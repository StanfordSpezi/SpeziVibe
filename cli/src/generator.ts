import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import pc from 'picocolors';
import type { ProjectOptions, TransformContext, FeatureManifest, CodeTransform } from './types.js';
import { checkGitConfig } from './utils.js';
import {
  BACKEND_ENV_VAR,
  getLLMEnvVarNames,
  getProviderConfig,
  formatMarker,
} from './config.js';
import {
  copyTemplate,
  copyPackageToProject,
  copyFilesFromFeature,
  copyFromFeature,
  type FeatureCopyContext,
} from './file-ops.js';
import {
  validateManifest,
  validateFeatureSelection,
} from './validation.js';
import {
  blank,
  heading,
  hr,
  p,
  success,
  warning,
  note,
  command,
  spin,
  formatDuration,
} from './pretty.js';
import { resolveSourcePaths } from './source.js';

/**
 * Main project generation function
 * Uses a temp directory for atomic generation with rollback on failure
 */
export async function generateProject(options: ProjectOptions): Promise<{ duration: number }> {
  const startTime = Date.now();
  const finalDir = path.resolve(options.outputDir);

  if (await fs.pathExists(finalDir)) {
    throw new Error(`Directory ${finalDir} already exists`);
  }

  // Validate project name
  if (!/^[a-z0-9-]+$/.test(options.projectName)) {
    throw new Error(
      `Invalid project name "${options.projectName}". Must be lowercase with hyphens only.`
    );
  }

  // Resolve source paths (local repo or download from GitHub)
  const source = await resolveSourcePaths();

  blank();
  hr();
  heading(`Creating ${options.displayName}`);
  hr();
  blank();

  // Use temp directory for atomic operation
  const tempDir = path.join(os.tmpdir(), `spezivibe-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const ctx: TransformContext = {
    options,
    projectDir: tempDir,
    source,
  };

  try {
    // Collect all features to apply (backend + selected features)
    const allFeatures = await collectFeatures(ctx);

    // Step 1: Copy base template
    let spinner = spin('Copying base template...');
    await copyBaseTemplate(ctx);
    spinner.succeed('Base template copied');

    // Step 2: Load all feature manifests
    const manifests = await loadFeatureManifests(ctx, allFeatures);

    // Step 3: Validate feature selection (dependencies and conflicts)
    const selectionResult = validateFeatureSelection(allFeatures, manifests);
    if (!selectionResult.valid) {
      for (const err of selectionResult.errors) {
        p(pc.red(`Error: ${err.message}`));
      }
      throw new Error('Invalid feature selection');
    }

    // Step 4: Apply features in order
    // Track copied packages to avoid duplicates (e.g., account used by firebase + onboarding)
    const copiedPackages = new Set<string>();
    for (const featureName of allFeatures) {
      const manifest = manifests.get(featureName);
      if (manifest) {
        spinner = spin(`Adding ${featureName}...`);
        await applyFeature(ctx, featureName, manifest, copiedPackages);
        spinner.succeed(`Added ${featureName}`);
      }
    }

    // Step 5: Apply template variables
    spinner = spin('Applying project settings...');
    await applyTemplateVariables(ctx);
    spinner.succeed('Applied project settings');

    // Step 6: Apply code transforms (data-driven from manifests)
    spinner = spin('Applying code transforms...');
    await applyTransforms(ctx, manifests, allFeatures);
    spinner.succeed('Applied code transforms');

    // Step 7: Generate .env.example
    spinner = spin('Generating environment files...');
    await generateEnvFiles(ctx, manifests, allFeatures);
    spinner.succeed('Generated .env and .env.example');

    // Step 8: Generate personalized GETTING_STARTED.md
    spinner = spin('Generating documentation...');
    await generateGettingStarted(ctx);
    spinner.succeed('Generated GETTING_STARTED.md');

    // Step 8b: HIPAA-specific generation
    if (options.hipaaMode) {
      spinner = spin('Applying HIPAA safeguards...');
      await applyHipaaSafeguards(ctx);
      spinner.succeed('Applied HIPAA safeguards');
    }

    // Step 9: Initialize git
    spinner = spin('Initializing git repository...');
    const gitResult = await initGit(tempDir);
    if (gitResult.success) {
      spinner.succeed('Initialized git repository');
    } else {
      spinner.warn('Git initialized without commit');
      if (gitResult.warning) {
        note(gitResult.warning);
      }
    }

    // Step 10: Move from temp to final location (atomic)
    await fs.move(tempDir, finalDir);

    const duration = Date.now() - startTime;
    blank();
    hr();
    p(pc.green(pc.bold('Done!')) + pc.dim(` in ${formatDuration(duration)}`));
    hr();

    // Print BAA reminder for HIPAA mode
    if (options.hipaaMode) {
      printBaaReminder(options.backend);
    }

    return { duration };
  } catch (err) {
    // Cleanup temp directory on failure
    blank();
    p(pc.red('Generation failed. Cleaning up...'));
    try {
      await fs.remove(tempDir);
    } catch {
      // Ignore cleanup errors
    }
    throw err;
  }
}

// ============================================================================
// Feature Collection
// ============================================================================

/**
 * Collect all features to apply, including backend as a feature
 *
 * Cloud backends (discovered from features with category: "backend"):
 * - Automatically included as a feature
 * - May declare autoIncludes for additional features (e.g., onboarding)
 *
 * Local backend ('local') includes no additional features.
 */
async function collectFeatures(ctx: TransformContext): Promise<string[]> {
  const { options, source } = ctx;
  const features: string[] = [];

  if (options.backend !== 'local') {
    // Load the backend's manifest to get autoIncludes
    const manifestPath = path.join(source.featuresDir, options.backend, 'manifest.json');
    if (await fs.pathExists(manifestPath)) {
      const manifest = await fs.readJson(manifestPath);
      features.push(options.backend);
      if (manifest.autoIncludes) {
        features.push(...manifest.autoIncludes);
      }
    }
  }
  // Local backend: no additional features (no auth)

  // Add user-selected features (avoid duplicates)
  for (const feature of options.features) {
    if (!features.includes(feature)) {
      features.push(feature);
    }
  }

  // Auto-include HIPAA feature when hipaaMode is enabled
  if (options.hipaaMode && !features.includes('hipaa')) {
    features.push('hipaa');
  }

  return features;
}

/**
 * Load and validate manifests for all features
 */
async function loadFeatureManifests(ctx: TransformContext, featureNames: string[]): Promise<Map<string, FeatureManifest>> {
  const { source } = ctx;
  const manifests = new Map<string, FeatureManifest>();
  const validationResults = [];

  for (const name of featureNames) {
    const manifestPath = path.join(source.featuresDir, name, 'manifest.json');
    if (await fs.pathExists(manifestPath)) {
      const manifest = await fs.readJson(manifestPath);
      manifests.set(name, manifest);

      // Validate each manifest
      const result = validateManifest(manifest, name);
      validationResults.push(result);

      // Log warnings (but don't fail)
      for (const warn of result.warnings) {
        note(`Note: ${warn.message}`);
      }

      // Fail on errors
      if (!result.valid) {
        for (const err of result.errors) {
          p(pc.red(`Error: ${err.message}`));
        }
        throw new Error(`Invalid manifest for feature "${name}"`);
      }
    }
  }

  return manifests;
}

// ============================================================================
// Template & Package Operations (using file-ops helpers)
// ============================================================================

async function copyBaseTemplate(ctx: TransformContext): Promise<void> {
  await copyTemplate(ctx.source.templateDir, ctx.projectDir);
}

async function copyPackage(ctx: TransformContext, packageName: string): Promise<void> {
  await copyPackageToProject(ctx.source.packagesDir, packageName, ctx.projectDir);
}

// ============================================================================
// Feature Application
// ============================================================================

/**
 * Extract package names from @spezivibe/* dependencies
 * e.g., "@spezivibe/chat": "*" -> "chat"
 */
function extractSpezivibePackages(dependencies: Record<string, string>): string[] {
  const packages: string[] = [];
  for (const dep of Object.keys(dependencies)) {
    if (dep.startsWith('@spezivibe/')) {
      packages.push(dep.replace('@spezivibe/', ''));
    }
  }
  return packages;
}

/**
 * Apply a single feature based on its manifest
 */
async function applyFeature(
  ctx: TransformContext,
  featureName: string,
  manifest: FeatureManifest,
  copiedPackages: Set<string>
): Promise<void> {
  const featureDir = path.join(ctx.source.featuresDir, featureName);
  const copyCtx: FeatureCopyContext = {
    featureDir,
    projectDir: ctx.projectDir,
    backend: ctx.options.backend,
  };

  // Auto-copy packages from @spezivibe/* dependencies (deduplicated)
  if (manifest.dependencies) {
    const packages = extractSpezivibePackages(manifest.dependencies);
    for (const pkg of packages) {
      if (!copiedPackages.has(pkg)) {
        await copyPackage(ctx, pkg);
        copiedPackages.add(pkg);
      }
    }
    // Ensure workspaces is set if we copied any packages
    if (packages.length > 0) {
      await ensureWorkspaces(ctx);
    }
  }

  // Copy directories (app-level dirs only, packages are auto-inferred from dependencies)
  if (manifest.copyDirs) {
    for (const dir of manifest.copyDirs) {
      await copyFromFeature(copyCtx, dir);
    }
  }

  // Copy files (won't overwrite existing - as documented in types.ts)
  if (manifest.copyFiles) {
    await copyFilesFromFeature(copyCtx, manifest.copyFiles, { overwrite: false });
  }

  // Replace files (will overwrite existing)
  if (manifest.replaceFiles) {
    await copyFilesFromFeature(copyCtx, manifest.replaceFiles, { overwrite: true });
  }

  // Add dependencies
  if (manifest.dependencies) {
    await addDependencies(ctx, manifest.dependencies);
  }

  // Add scripts
  if (manifest.scripts) {
    await addScripts(ctx, manifest.scripts);
  }
}

// ============================================================================
// Package.json Operations
// ============================================================================

async function addDependencies(
  ctx: TransformContext,
  deps: Record<string, string>
): Promise<void> {
  const packageJsonPath = path.join(ctx.projectDir, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);

  packageJson.dependencies = {
    ...packageJson.dependencies,
    ...deps,
  };

  // Sort dependencies alphabetically
  const sortedDeps: Record<string, string> = {};
  Object.keys(packageJson.dependencies)
    .sort()
    .forEach((key) => {
      sortedDeps[key] = packageJson.dependencies[key];
    });
  packageJson.dependencies = sortedDeps;

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

async function addScripts(
  ctx: TransformContext,
  scripts: Record<string, string>
): Promise<void> {
  const packageJsonPath = path.join(ctx.projectDir, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);

  packageJson.scripts = {
    ...packageJson.scripts,
    ...scripts,
  };

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

async function ensureWorkspaces(ctx: TransformContext): Promise<void> {
  const packageJsonPath = path.join(ctx.projectDir, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);

  if (!packageJson.workspaces || !Array.isArray(packageJson.workspaces)) {
    packageJson.workspaces = ['packages/*'];
  }

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

// ============================================================================
// Template Variables
// ============================================================================

async function applyTemplateVariables(ctx: TransformContext): Promise<void> {
  const { projectDir, options } = ctx;

  // Update package.json - replace default name with user's project name
  const packageJsonPath = path.join(projectDir, 'package.json');
  let packageJson = await fs.readFile(packageJsonPath, 'utf-8');
  packageJson = packageJson.replace(/"name": "spezivibe-app"/, `"name": "${options.projectName}"`);
  await fs.writeFile(packageJsonPath, packageJson);

  // Update app.config.js - replace defaults with user's choices
  const appConfigPath = path.join(projectDir, 'app.config.js');
  let appConfig = await fs.readFile(appConfigPath, 'utf-8');
  appConfig = appConfig.replace(/name: "SpeziVibe"/, `name: "${options.displayName}"`);
  appConfig = appConfig.replace(/slug: "spezivibe-app"/, `slug: "${options.projectName}"`);
  appConfig = appConfig.replace(/scheme: "spezivibe-app"/, `scheme: "${options.projectName}"`);
  await fs.writeFile(appConfigPath, appConfig);
}

// ============================================================================
// Code Transforms (Declarative injection from manifests)
// ============================================================================

/**
 * Apply all transforms from feature manifests
 * Groups transforms by file to minimize file reads/writes
 */
async function applyTransforms(
  ctx: TransformContext,
  manifests: Map<string, FeatureManifest>,
  allFeatures: string[]
): Promise<void> {
  // Collect all transforms, grouped by target file
  const transformsByFile = new Map<string, CodeTransform[]>();

  for (const featureName of allFeatures) {
    const manifest = manifests.get(featureName);
    if (!manifest?.transforms) continue;

    for (const transform of manifest.transforms) {
      const existing = transformsByFile.get(transform.file) || [];
      existing.push(transform);
      transformsByFile.set(transform.file, existing);
    }
  }

  // Apply transforms to each file
  for (const [filePath, transforms] of transformsByFile) {
    await applyFileTransforms(ctx, filePath, transforms);
  }
}

/**
 * Detect the indentation of a line containing a marker
 * Returns the leading whitespace of that line
 */
function detectMarkerIndentation(content: string, marker: string): string {
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.includes(marker)) {
      // Extract leading whitespace
      const match = line.match(/^(\s*)/);
      return match ? match[1] : '';
    }
  }
  return '';
}

/**
 * Apply multiple transforms to a single file
 *
 * Note: The content in manifests should have absolute indentation (not relative).
 * The marker's indentation is used as a separator when joining multiple injections.
 */
async function applyFileTransforms(
  ctx: TransformContext,
  filePath: string,
  transforms: CodeTransform[]
): Promise<void> {
  const fullPath = path.join(ctx.projectDir, filePath);

  if (!(await fs.pathExists(fullPath))) {
    note(`Transform target ${filePath} not found, skipping`);
    return;
  }

  let content = await fs.readFile(fullPath, 'utf-8');

  // Group transforms by marker (multiple features might inject at the same marker)
  const byMarker = new Map<string, string[]>();
  for (const transform of transforms) {
    const existing = byMarker.get(transform.marker) || [];
    existing.push(transform.content);
    byMarker.set(transform.marker, existing);
  }

  // Apply each marker's transforms
  for (const [marker, contents] of byMarker) {
    const fullMarker = formatMarker(marker);
    if (content.includes(fullMarker)) {
      // Detect indentation from the marker's line for separator between items
      const indent = detectMarkerIndentation(content, fullMarker);

      // Join multiple injections with newline and detected indent as separator
      // Note: Each content string should already have correct absolute indentation
      const injection = contents.join('\n' + indent);

      content = content.replace(fullMarker, injection);
    } else {
      note(`Marker ${marker} not found in ${filePath}`);
    }
  }

  await fs.writeFile(fullPath, content);
}

// ============================================================================
// Environment Configuration (Data-driven from manifests)
// ============================================================================

async function generateEnvFiles(
  ctx: TransformContext,
  manifests: Map<string, FeatureManifest>,
  allFeatures: string[]
): Promise<void> {
  const userEnvValues = ctx.options.envValues || {};

  // Get LLM env var names from config (to filter based on selection)
  const llmEnvVarNames = getLLMEnvVarNames();

  // Collect all env vars and their default values
  const allEnvVars: { key: string; defaultValue: string; description: string }[] = [
    { key: BACKEND_ENV_VAR, defaultValue: ctx.options.backend, description: 'Backend Configuration' },
  ];

  // Collect env vars from all selected features
  for (const featureName of allFeatures) {
    const manifest = manifests.get(featureName);
    if (!manifest?.envVars) continue;

    const description = manifest.description || featureName;
    for (const [key, value] of Object.entries(manifest.envVars)) {
      // Skip backend type (already added)
      if (key === BACKEND_ENV_VAR) continue;
      // Skip LLM env vars (handled separately based on selected providers)
      if (llmEnvVarNames.includes(key)) continue;

      allEnvVars.push({ key, defaultValue: value, description });
    }
  }

  // Add only selected LLM providers
  if (ctx.options.features.includes('chat') && ctx.options.llmProviders.length > 0) {
    for (const provider of ctx.options.llmProviders) {
      const providerConfig = getProviderConfig(provider);
      if (providerConfig) {
        allEnvVars.push({ key: providerConfig.envVar, defaultValue: '', description: 'LLM API Keys' });
      }
    }
  }

  // Generate .env.example (with empty/default values, grouped by description)
  const exampleLines: string[] = [];
  let currentDescription = '';
  for (const { key, defaultValue, description } of allEnvVars) {
    if (description !== currentDescription) {
      if (exampleLines.length > 0) exampleLines.push('');
      exampleLines.push(`# ${description}`);
      currentDescription = description;
    }
    exampleLines.push(`${key}=${defaultValue}`);
  }
  exampleLines.push('');

  const envExamplePath = path.join(ctx.projectDir, '.env.example');
  await fs.writeFile(envExamplePath, exampleLines.join('\n'));

  // Generate .env (with user-provided values where available)
  const envLines: string[] = [];
  currentDescription = '';
  for (const { key, defaultValue, description } of allEnvVars) {
    if (description !== currentDescription) {
      if (envLines.length > 0) envLines.push('');
      envLines.push(`# ${description}`);
      currentDescription = description;
    }
    // Use user-provided value if available, otherwise use default
    const value = userEnvValues[key] !== undefined ? userEnvValues[key] : defaultValue;
    envLines.push(`${key}=${value}`);
  }
  envLines.push('');

  const envPath = path.join(ctx.projectDir, '.env');
  await fs.writeFile(envPath, envLines.join('\n'));
}

// ============================================================================
// Getting Started Guide Generation
// ============================================================================

/**
 * Generate a personalized GETTING_STARTED.md based on user selections
 */
async function generateGettingStarted(ctx: TransformContext): Promise<void> {
  const { options, projectDir } = ctx;
  const lines: string[] = [];

  // Header
  lines.push(`# Getting Started with ${options.displayName}`);
  lines.push('');
  lines.push('This guide will help you set up and run your app.');
  lines.push('');

  // Quick Start
  lines.push('## Quick Start');
  lines.push('');
  lines.push('```bash');
  lines.push('# Install dependencies');
  lines.push('npm install');
  lines.push('');
  lines.push('# Copy environment file and add your keys');
  lines.push('cp .env.example .env');
  lines.push('');
  lines.push('# Start the development server');
  lines.push('npm start');
  lines.push('```');
  lines.push('');

  // Environment Setup
  lines.push('## Environment Setup');
  lines.push('');
  lines.push('Copy `.env.example` to `.env` and fill in the required values:');
  lines.push('');

  // Backend-specific instructions
  const hasCloudBackend = options.backend !== 'local';
  if (hasCloudBackend) {
    const backendName = options.backend.charAt(0).toUpperCase() + options.backend.slice(1);
    lines.push(`### ${backendName} Configuration`);
    lines.push('');
    lines.push(`Your app uses ${backendName} for cloud storage and authentication.`);
    lines.push('');

    if (options.backend === 'firebase') {
      lines.push('#### Option 1: Firebase Emulator (Recommended for Development)');
      lines.push('');
      lines.push('If you left the Firebase credentials blank, your app is configured to use');
      lines.push('the Firebase Emulator. Start the emulator before running your app:');
      lines.push('');
      lines.push('```bash');
      lines.push('npm run emulators  # Terminal 1 - starts Firebase Emulator');
      lines.push('npm start          # Terminal 2 - starts Expo');
      lines.push('```');
      lines.push('');
      lines.push('The emulator UI is available at http://localhost:4000');
      lines.push('');
      lines.push('#### Option 2: Production Firebase');
      lines.push('');
      lines.push('For production, fill in your Firebase credentials in `.env`:');
      lines.push('');
      lines.push('1. Go to [Firebase Console](https://console.firebase.google.com)');
      lines.push('2. Create a project or select an existing one');
      lines.push('3. Add a web app and copy the config values to `.env`');
      lines.push('');
    } else {
      lines.push('Check your `.env.example` file for the required configuration values.');
      lines.push('Fill in the credentials for your backend service in `.env`.');
      lines.push('');
    }
  } else {
    lines.push('### Local Storage');
    lines.push('');
    lines.push('Your app uses local AsyncStorage for data persistence.');
    lines.push('No cloud configuration is required.');
    lines.push('');
    lines.push('> **Note:** Data is stored on-device only. Users cannot sync');
    lines.push('> across devices, and data is lost when the app is uninstalled.');
    lines.push('');
  }

  // Chat/LLM setup
  if (options.features.includes('chat')) {
    lines.push('### AI Chat Configuration');
    lines.push('');
    lines.push('Your app includes the Chat feature with AI integration.');
    lines.push('');
    lines.push('> **⚠️ Security Warning:** API keys are exposed client-side in');
    lines.push('> React Native apps. For production, implement a backend proxy');
    lines.push('> to keep your keys secure.');
    lines.push('');

    if (options.llmProviders.length > 0) {
      lines.push('Get API keys for your selected providers:');
      lines.push('');
      for (const provider of options.llmProviders) {
        const providerConfig = getProviderConfig(provider);
        if (providerConfig) {
          lines.push(`- **${providerConfig.name}**: [${providerConfig.setupUrl}](${providerConfig.setupUrl})`);
        }
      }
      lines.push('');
      lines.push('Add the keys to your `.env` file:');
      lines.push('');
      lines.push('```');
      for (const provider of options.llmProviders) {
        const providerConfig = getProviderConfig(provider);
        if (providerConfig) {
          lines.push(`${providerConfig.envVar}=your-api-key`);
        }
      }
      lines.push('```');
      lines.push('');
    }
  }

  // HealthKit setup (if selected)
  if (options.features.includes('healthkit')) {
    lines.push('### HealthKit Setup (iOS Only)');
    lines.push('');
    lines.push('Your app includes Apple HealthKit integration for health data access.');
    lines.push('');
    lines.push('> **⚠️ Important:** HealthKit requires a custom development build.');
    lines.push('> It will NOT work in Expo Go.');
    lines.push('');
    lines.push('#### Building for iOS:');
    lines.push('');
    lines.push('```bash');
    lines.push('# Create native iOS project and run');
    lines.push('npx expo prebuild --platform ios');
    lines.push('npx expo run:ios');
    lines.push('');
    lines.push('# Or use EAS Build');
    lines.push('eas build --platform ios --profile development');
    lines.push('```');
    lines.push('');
    lines.push('#### Testing:');
    lines.push('');
    lines.push('- Use a **physical iOS device** for best results');
    lines.push('- Simulator has limited HealthKit support');
    lines.push('- Add test data: Simulator → Features → Health → Health Data');
    lines.push('');
    lines.push('#### Configuration:');
    lines.push('');
    lines.push('Edit `lib/healthkit-config.ts` to customize which health metrics to collect.');
    lines.push('');
  }

  // Features overview
  lines.push('## Your App Features');
  lines.push('');
  lines.push('Based on your selections, your app includes:');
  lines.push('');

  if (hasCloudBackend) {
    lines.push(`- **${options.backend.charAt(0).toUpperCase() + options.backend.slice(1)} Backend** - Cloud storage with user authentication`);
  } else {
    lines.push('- **Local Storage** - On-device data persistence');
  }

  if (options.features.includes('chat')) {
    lines.push('- **Chat** - AI-powered chat interface with LLM integration');
  }
  if (options.features.includes('scheduler')) {
    lines.push('- **Scheduler** - Recurring tasks and reminder management');
  }
  if (options.features.includes('questionnaire')) {
    lines.push('- **Questionnaires** - FHIR-compliant health forms');
  }
  if (options.features.includes('healthkit')) {
    lines.push('- **HealthKit** - Apple Health data integration (iOS only)');
  }
  if (hasCloudBackend) {
    lines.push('- **Onboarding** - Welcome flow with consent management');
  }
  lines.push('');

  // Running on devices
  lines.push('## Running on Devices');
  lines.push('');
  lines.push('```bash');
  lines.push('# iOS Simulator');
  lines.push('npm run ios');
  lines.push('');
  lines.push('# Android Emulator');
  lines.push('npm run android');
  lines.push('');
  lines.push('# Web Browser');
  lines.push('npm run web');
  lines.push('```');
  lines.push('');

  // Project structure
  lines.push('## Project Structure');
  lines.push('');
  lines.push('```');
  lines.push('├── app/              # Expo Router screens');
  lines.push('│   ├── (tabs)/       # Bottom tab screens');
  if (hasCloudBackend) {
    lines.push('│   ├── (onboarding)/ # Welcome and consent flow');
  }
  if (options.features.includes('questionnaire')) {
    lines.push('│   └── questionnaire/# Health form screens');
  }
  lines.push('├── packages/         # Shared modules');
  if (hasCloudBackend) {
    lines.push('│   └── account/      # User account management');
  }
  if (options.features.includes('chat')) {
    lines.push('│   └── chat/         # AI chat functionality');
  }
  if (options.features.includes('scheduler')) {
    lines.push('│   └── scheduler/    # Task scheduling');
  }
  if (options.features.includes('questionnaire')) {
    lines.push('│   └── questionnaire/# FHIR forms');
  }
  if (options.features.includes('healthkit')) {
    lines.push('│   └── healthkit/    # Apple Health integration');
  }
  if (hasCloudBackend) {
    lines.push(`│   └── ${options.backend}/     # ${options.backend.charAt(0).toUpperCase() + options.backend.slice(1)} integration`);
  }
  lines.push('├── lib/              # App utilities');
  lines.push('└── components/       # Reusable UI components');
  lines.push('```');
  lines.push('');

  // Learn more
  lines.push('## Learn More');
  lines.push('');
  lines.push('- [Expo Documentation](https://docs.expo.dev)');
  lines.push('- [Expo Router](https://expo.github.io/router/docs)');
  lines.push('- [React Native](https://reactnative.dev)');
  lines.push('');

  await fs.writeFile(path.join(projectDir, 'GETTING_STARTED.md'), lines.join('\n'));
}

// ============================================================================
// Git Initialization
// ============================================================================

interface GitResult {
  success: boolean;
  warning?: string;
}

async function initGit(projectDir: string): Promise<GitResult> {
  const { execSync } = await import('child_process');

  // Check if git is available
  try {
    execSync('git --version', { stdio: 'ignore' });
  } catch {
    return {
      success: false,
      warning: 'Git is not installed. Skipping repository initialization.',
    };
  }

  // Initialize repository
  try {
    execSync('git init', { cwd: projectDir, stdio: 'ignore' });
  } catch {
    return {
      success: false,
      warning: 'Failed to initialize git repository.',
    };
  }

  // Check git config before attempting commit
  const gitConfig = checkGitConfig();
  if (!gitConfig.configured) {
    return {
      success: false,
      warning: `Git ${gitConfig.missing.join(' and ')} not configured. Run: git config --global user.name "Your Name"`,
    };
  }

  // Stage and commit
  try {
    execSync('git add .', { cwd: projectDir, stdio: 'ignore' });
    execSync('git commit -m "Initial commit from create-spezivibe-app"', {
      cwd: projectDir,
      stdio: 'ignore',
    });
    return { success: true };
  } catch {
    return {
      success: false,
      warning: 'Git commit failed. You can commit manually later.',
    };
  }
}

// ============================================================================
// HIPAA Safeguards
// ============================================================================

/**
 * Apply HIPAA-specific safeguards to the generated project:
 * - Generate HIPAA_CHECKLIST.md with backend-specific content
 * - Copy HIPAA-enhanced security rules for Firebase
 */
async function applyHipaaSafeguards(ctx: TransformContext): Promise<void> {
  const { options, projectDir, source } = ctx;

  // Generate HIPAA checklist
  await generateHipaaChecklist(ctx);

  // Copy backend-specific HIPAA rules
  if (options.backend === 'firebase') {
    const hipaaRulesDir = path.join(source.featuresDir, 'firebase', 'hipaa');
    if (await fs.pathExists(hipaaRulesDir)) {
      // Replace standard firestore.rules with HIPAA-enhanced version
      const hipaaFirestoreRules = path.join(hipaaRulesDir, 'firestore-hipaa.rules');
      if (await fs.pathExists(hipaaFirestoreRules)) {
        await fs.copy(hipaaFirestoreRules, path.join(projectDir, 'firestore.rules'));
      }

      // Copy storage HIPAA rules
      const hipaaStorageRules = path.join(hipaaRulesDir, 'storage-hipaa.rules');
      if (await fs.pathExists(hipaaStorageRules)) {
        await fs.copy(hipaaStorageRules, path.join(projectDir, 'storage.rules'));
      }
    }
  }
}

/**
 * Generate HIPAA_CHECKLIST.md from template with backend-specific content
 */
async function generateHipaaChecklist(ctx: TransformContext): Promise<void> {
  const { options, projectDir, source } = ctx;

  // Read the template
  const templatePath = path.join(source.featuresDir, 'hipaa', 'HIPAA_CHECKLIST.md');
  let content = await fs.readFile(templatePath, 'utf-8');

  // Backend-specific values
  const backendName = options.backend.charAt(0).toUpperCase() + options.backend.slice(1);
  const today = new Date().toISOString().split('T')[0];

  const backendConfig: Record<string, { encryptionAtRest: string; dataIsolation: string; baaProvider: string; resources: string }> = {
    firebase: {
      encryptionAtRest: 'Google-managed encryption keys (AES-256)',
      dataIsolation: 'Firestore rules with per-user + role-based access',
      baaProvider: 'Google Cloud / Firebase',
      resources: [
        '- [Firebase BAA](https://cloud.google.com/terms/hipaa-baa)',
        '- [Firebase Security Rules](https://firebase.google.com/docs/rules)',
        '- [HHS HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)',
      ].join('\n'),
    },
    supabase: {
      encryptionAtRest: 'PostgreSQL with pgsodium column-level encryption',
      dataIsolation: 'Row Level Security (RLS) policies on all tables',
      baaProvider: 'Supabase',
      resources: [
        '- [Supabase BAA](https://supabase.com/docs/guides/platform/hipaa)',
        '- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)',
        '- [HHS HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)',
      ].join('\n'),
    },
    medplum: {
      encryptionAtRest: 'Medplum managed encryption (AWS infrastructure)',
      dataIsolation: 'SMART on FHIR scopes + AccessPolicy resources',
      baaProvider: 'Medplum',
      resources: [
        '- [Medplum Compliance](https://www.medplum.com/docs/compliance)',
        '- [SMART on FHIR](https://smarthealthit.org/)',
        '- [HHS HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)',
      ].join('\n'),
    },
    local: {
      encryptionAtRest: 'iOS Data Protection (hardware-backed AES-256)',
      dataIsolation: 'On-device only, single user',
      baaProvider: 'N/A (no cloud provider)',
      resources: [
        '- [Apple Data Protection](https://support.apple.com/guide/security/data-protection-classes-secb010e978a/web)',
        '- [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/)',
        '- [HHS HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)',
      ].join('\n'),
    },
  };

  const config = backendConfig[options.backend] || backendConfig['local'];

  // Replace template variables
  content = content.replace(/\{\{displayName\}\}/g, options.displayName);
  content = content.replace(/\{\{date\}\}/g, today);
  content = content.replace(/\{\{backend\}\}/g, backendName);
  content = content.replace(/\{\{encryptionAtRest\}\}/g, config.encryptionAtRest);
  content = content.replace(/\{\{dataIsolation\}\}/g, config.dataIsolation);
  content = content.replace(/\{\{baaProvider\}\}/g, config.baaProvider);
  content = content.replace(/\{\{resources\}\}/g, config.resources);

  await fs.writeFile(path.join(projectDir, 'HIPAA_CHECKLIST.md'), content);
}

/**
 * Print BAA reminder after project generation
 */
function printBaaReminder(backend: string): void {
  blank();
  p(pc.yellow(pc.bold('\u26a0\ufe0f  HIPAA REMINDER:')));
  p(pc.yellow('Before deploying to production with PHI, ensure you have'));
  p(pc.yellow('a signed Business Associate Agreement (BAA) with your backend provider.'));
  blank();

  const baaLinks: Record<string, string> = {
    firebase: 'Firebase: https://cloud.google.com/terms/hipaa-baa',
    supabase: 'Supabase: https://supabase.com/docs/guides/platform/hipaa',
    medplum: 'Medplum: https://www.medplum.com/docs/compliance',
  };

  if (baaLinks[backend]) {
    note(baaLinks[backend]);
  }

  blank();
  p(pc.yellow('Without a BAA, you are NOT HIPAA-compliant regardless of technical safeguards.'));
  note('See HIPAA_CHECKLIST.md for the full compliance checklist.');
  blank();
}

// ============================================================================
// CLI Helper
// ============================================================================

export function printNextSteps(options: ProjectOptions, dependenciesInstalled = false): void {
  blank();
  heading('Next steps');
  blank();

  command(`cd ${options.outputDir}`);
  if (!dependenciesInstalled) {
    command('npm install');
  }
  command('npm start');
  blank();

  note('See GETTING_STARTED.md for setup details');
  blank();
}
