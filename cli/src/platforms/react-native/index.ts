/**
 * React Native / Expo Platform Generator
 *
 * Implements PlatformGenerator for React Native apps using Expo.
 * Contains all generation logic previously in generator.ts.
 */

import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import pc from 'picocolors';
import type { PlatformGenerator, GenerationOptions, GenerationResult, BackendOption, FeatureOption } from '../types.js';
import type { TransformContext, FeatureManifest, CodeTransform, ProjectOptions } from '../../types.js';
import { checkGitConfig } from '../../utils.js';
import { discoverBackends, formatMarker } from '../../config.js';
import {
  copyTemplate,
  copyPackageToProject,
  copyFilesFromFeature,
  copyFromFeature,
  type FeatureCopyContext,
} from '../../file-ops.js';
import {
  validateManifest,
  validateFeatureSelection,
} from '../../validation.js';
import {
  blank,
  heading,
  hr,
  p,
  note,
  spin,
  formatDuration,
} from '../../pretty.js';
import { resolveSourcePaths } from '../../source.js';
import { FEATURES, LLM_PROVIDERS, BACKEND_ENV_VAR, getLLMEnvVarNames, getProviderConfig } from './config.js';

export class ReactNativePlatformGenerator implements PlatformGenerator {
  readonly id = 'react-native';
  readonly name = 'React Native (Expo)';
  readonly description = 'Cross-platform mobile app with Expo and React Native';

  async getBackends(): Promise<BackendOption[]> {
    const backends = await discoverBackends();
    return [
      { value: 'local', name: 'Local (on-device only, no auth)', description: 'Offline-first, no server required' },
      ...backends.map((b) => ({
        value: b.name,
        name: `${b.name} (${b.description})`,
        description: b.description,
      })),
    ];
  }

  async getFeatures(): Promise<FeatureOption[]> {
    return FEATURES.map((f) => ({
      value: f.value,
      name: f.name,
      description: f.description,
      defaultChecked: f.defaultChecked,
    }));
  }

  async generate(options: GenerationOptions): Promise<GenerationResult> {
    const startTime = Date.now();
    const finalDir = path.resolve(options.outputDir);

    if (await fs.pathExists(finalDir)) {
      throw new Error(`Directory ${finalDir} already exists`);
    }

    if (!/^[a-z0-9-]+$/.test(options.projectName)) {
      throw new Error(
        `Invalid project name "${options.projectName}". Must be lowercase with hyphens only.`
      );
    }

    const source = await resolveSourcePaths();

    blank();
    hr();
    heading(`Creating ${options.displayName}`);
    hr();
    blank();

    const tempDir = path.join(os.tmpdir(), `spezivibe-${Date.now()}-${Math.random().toString(36).slice(2)}`);

    // Bridge GenerationOptions to the internal ProjectOptions/TransformContext
    const projectOptions: ProjectOptions = {
      projectName: options.projectName,
      displayName: options.displayName,
      backend: options.backend,
      features: options.features as ProjectOptions['features'],
      llmProviders: options.llmProviders as ProjectOptions['llmProviders'],
      outputDir: options.outputDir,
      envValues: options.envValues,
    };

    const ctx: TransformContext = {
      options: projectOptions,
      projectDir: tempDir,
      source,
    };

    let filesCreated = 0;

    try {
      const allFeatures = await this.collectFeatures(ctx);

      let spinner = spin('Copying base template...');
      await copyTemplate(ctx.source.templateDir, ctx.projectDir);
      spinner.succeed('Base template copied');

      const manifests = await this.loadFeatureManifests(ctx, allFeatures);

      const selectionResult = validateFeatureSelection(allFeatures, manifests);
      if (!selectionResult.valid) {
        for (const err of selectionResult.errors) {
          p(pc.red(`Error: ${err.message}`));
        }
        throw new Error('Invalid feature selection');
      }

      const copiedPackages = new Set<string>();
      for (const featureName of allFeatures) {
        const manifest = manifests.get(featureName);
        if (manifest) {
          spinner = spin(`Adding ${featureName}...`);
          await this.applyFeature(ctx, featureName, manifest, copiedPackages);
          spinner.succeed(`Added ${featureName}`);
        }
      }

      spinner = spin('Applying project settings...');
      await this.applyTemplateVariables(ctx);
      spinner.succeed('Applied project settings');

      spinner = spin('Applying code transforms...');
      await this.applyTransforms(ctx, manifests, allFeatures);
      spinner.succeed('Applied code transforms');

      spinner = spin('Generating environment files...');
      await this.generateEnvFiles(ctx, manifests, allFeatures);
      spinner.succeed('Generated .env and .env.example');

      spinner = spin('Generating documentation...');
      await this.generateGettingStarted(ctx);
      spinner.succeed('Generated GETTING_STARTED.md');

      spinner = spin('Initializing git repository...');
      const gitResult = await this.initGit(tempDir);
      if (gitResult.success) {
        spinner.succeed('Initialized git repository');
      } else {
        spinner.warn('Git initialized without commit');
        if (gitResult.warning) {
          note(gitResult.warning);
        }
      }

      await fs.move(tempDir, finalDir);

      const duration = Date.now() - startTime;
      blank();
      hr();
      p(pc.green(pc.bold('Done!')) + pc.dim(` in ${formatDuration(duration)}`));
      hr();

      // Count files
      filesCreated = await this.countFiles(finalDir);

      return { duration, platform: this.id, filesCreated };
    } catch (err) {
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

  getNextSteps(options: GenerationOptions): string[] {
    const steps: string[] = [
      `cd ${options.outputDir}`,
      'npm install',
      'npm start',
    ];
    return steps;
  }

  // ============================================================================
  // Private helpers (moved from generator.ts)
  // ============================================================================

  private async countFiles(dir: string): Promise<number> {
    let count = 0;
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      if (entry.isDirectory()) {
        count += await this.countFiles(path.join(dir, entry.name));
      } else {
        count++;
      }
    }
    return count;
  }

  private async collectFeatures(ctx: TransformContext): Promise<string[]> {
    const { options, source } = ctx;
    const features: string[] = [];

    if (options.backend !== 'local') {
      const manifestPath = path.join(source.featuresDir, options.backend, 'manifest.json');
      if (await fs.pathExists(manifestPath)) {
        const manifest = await fs.readJson(manifestPath);
        features.push(options.backend);
        if (manifest.autoIncludes) {
          features.push(...manifest.autoIncludes);
        }
      }
    }

    for (const feature of options.features) {
      if (!features.includes(feature)) {
        features.push(feature);
      }
    }

    return features;
  }

  private async loadFeatureManifests(ctx: TransformContext, featureNames: string[]): Promise<Map<string, FeatureManifest>> {
    const { source } = ctx;
    const manifests = new Map<string, FeatureManifest>();

    for (const name of featureNames) {
      const manifestPath = path.join(source.featuresDir, name, 'manifest.json');
      if (await fs.pathExists(manifestPath)) {
        const manifest = await fs.readJson(manifestPath);
        manifests.set(name, manifest);

        const result = validateManifest(manifest, name);

        for (const warn of result.warnings) {
          note(`Note: ${warn.message}`);
        }

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

  private async applyFeature(
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

    if (manifest.dependencies) {
      const packages = this.extractSpezivibePackages(manifest.dependencies);
      for (const pkg of packages) {
        if (!copiedPackages.has(pkg)) {
          await copyPackageToProject(ctx.source.packagesDir, pkg, ctx.projectDir);
          copiedPackages.add(pkg);
        }
      }
      if (packages.length > 0) {
        await this.ensureWorkspaces(ctx);
      }
    }

    if (manifest.copyDirs) {
      for (const dir of manifest.copyDirs) {
        await copyFromFeature(copyCtx, dir);
      }
    }

    if (manifest.copyFiles) {
      await copyFilesFromFeature(copyCtx, manifest.copyFiles, { overwrite: false });
    }

    if (manifest.replaceFiles) {
      await copyFilesFromFeature(copyCtx, manifest.replaceFiles, { overwrite: true });
    }

    if (manifest.dependencies) {
      await this.addDependencies(ctx, manifest.dependencies);
    }

    if (manifest.scripts) {
      await this.addScripts(ctx, manifest.scripts);
    }
  }

  private extractSpezivibePackages(dependencies: Record<string, string>): string[] {
    const packages: string[] = [];
    for (const dep of Object.keys(dependencies)) {
      if (dep.startsWith('@spezivibe/')) {
        packages.push(dep.replace('@spezivibe/', ''));
      }
    }
    return packages;
  }

  private async addDependencies(ctx: TransformContext, deps: Record<string, string>): Promise<void> {
    const packageJsonPath = path.join(ctx.projectDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);

    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...deps,
    };

    const sortedDeps: Record<string, string> = {};
    Object.keys(packageJson.dependencies)
      .sort()
      .forEach((key) => {
        sortedDeps[key] = packageJson.dependencies[key];
      });
    packageJson.dependencies = sortedDeps;

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  private async addScripts(ctx: TransformContext, scripts: Record<string, string>): Promise<void> {
    const packageJsonPath = path.join(ctx.projectDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);

    packageJson.scripts = {
      ...packageJson.scripts,
      ...scripts,
    };

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  private async ensureWorkspaces(ctx: TransformContext): Promise<void> {
    const packageJsonPath = path.join(ctx.projectDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);

    if (!packageJson.workspaces || !Array.isArray(packageJson.workspaces)) {
      packageJson.workspaces = ['packages/*'];
    }

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  private async applyTemplateVariables(ctx: TransformContext): Promise<void> {
    const { projectDir, options } = ctx;

    const packageJsonPath = path.join(projectDir, 'package.json');
    let packageJson = await fs.readFile(packageJsonPath, 'utf-8');
    packageJson = packageJson.replace(/"name": "spezivibe-app"/, `"name": "${options.projectName}"`);
    await fs.writeFile(packageJsonPath, packageJson);

    const appConfigPath = path.join(projectDir, 'app.config.js');
    let appConfig = await fs.readFile(appConfigPath, 'utf-8');
    appConfig = appConfig.replace(/name: "SpeziVibe"/, `name: "${options.displayName}"`);
    appConfig = appConfig.replace(/slug: "spezivibe-app"/, `slug: "${options.projectName}"`);
    appConfig = appConfig.replace(/scheme: "spezivibe-app"/, `scheme: "${options.projectName}"`);
    await fs.writeFile(appConfigPath, appConfig);
  }

  private async applyTransforms(
    ctx: TransformContext,
    manifests: Map<string, FeatureManifest>,
    allFeatures: string[]
  ): Promise<void> {
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

    for (const [filePath, transforms] of transformsByFile) {
      await this.applyFileTransforms(ctx, filePath, transforms);
    }
  }

  private detectMarkerIndentation(content: string, marker: string): string {
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.includes(marker)) {
        const match = line.match(/^(\s*)/);
        return match ? match[1] : '';
      }
    }
    return '';
  }

  private async applyFileTransforms(
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

    const byMarker = new Map<string, string[]>();
    for (const transform of transforms) {
      const existing = byMarker.get(transform.marker) || [];
      existing.push(transform.content);
      byMarker.set(transform.marker, existing);
    }

    for (const [marker, contents] of byMarker) {
      const fullMarker = formatMarker(marker);
      if (content.includes(fullMarker)) {
        const indent = this.detectMarkerIndentation(content, fullMarker);
        const injection = contents.join('\n' + indent);
        content = content.replace(fullMarker, injection);
      } else {
        note(`Marker ${marker} not found in ${filePath}`);
      }
    }

    await fs.writeFile(fullPath, content);
  }

  private async generateEnvFiles(
    ctx: TransformContext,
    manifests: Map<string, FeatureManifest>,
    allFeatures: string[]
  ): Promise<void> {
    const userEnvValues = ctx.options.envValues || {};
    const llmEnvVarNames = getLLMEnvVarNames();

    const allEnvVars: { key: string; defaultValue: string; description: string }[] = [
      { key: BACKEND_ENV_VAR, defaultValue: ctx.options.backend, description: 'Backend Configuration' },
    ];

    for (const featureName of allFeatures) {
      const manifest = manifests.get(featureName);
      if (!manifest?.envVars) continue;

      const description = manifest.description || featureName;
      for (const [key, value] of Object.entries(manifest.envVars)) {
        if (key === BACKEND_ENV_VAR) continue;
        if (llmEnvVarNames.includes(key)) continue;
        allEnvVars.push({ key, defaultValue: value, description });
      }
    }

    if (ctx.options.features.includes('chat') && ctx.options.llmProviders.length > 0) {
      for (const provider of ctx.options.llmProviders) {
        const providerConfig = getProviderConfig(provider);
        if (providerConfig) {
          allEnvVars.push({ key: providerConfig.envVar, defaultValue: '', description: 'LLM API Keys' });
        }
      }
    }

    // Generate .env.example
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

    // Generate .env
    const envLines: string[] = [];
    currentDescription = '';
    for (const { key, defaultValue, description } of allEnvVars) {
      if (description !== currentDescription) {
        if (envLines.length > 0) envLines.push('');
        envLines.push(`# ${description}`);
        currentDescription = description;
      }
      const value = userEnvValues[key] !== undefined ? userEnvValues[key] : defaultValue;
      envLines.push(`${key}=${value}`);
    }
    envLines.push('');

    const envPath = path.join(ctx.projectDir, '.env');
    await fs.writeFile(envPath, envLines.join('\n'));
  }

  private async generateGettingStarted(ctx: TransformContext): Promise<void> {
    const { options, projectDir } = ctx;
    const lines: string[] = [];

    lines.push(`# Getting Started with ${options.displayName}`);
    lines.push('');
    lines.push('This guide will help you set up and run your app.');
    lines.push('');

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

    lines.push('## Environment Setup');
    lines.push('');
    lines.push('Copy `.env.example` to `.env` and fill in the required values:');
    lines.push('');

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

    if (options.features.includes('chat')) {
      lines.push('### AI Chat Configuration');
      lines.push('');
      lines.push('Your app includes the Chat feature with AI integration.');
      lines.push('');
      lines.push('> **\u26A0\uFE0F Security Warning:** API keys are exposed client-side in');
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

    if (options.features.includes('healthkit')) {
      lines.push('### HealthKit Setup (iOS Only)');
      lines.push('');
      lines.push('Your app includes Apple HealthKit integration for health data access.');
      lines.push('');
      lines.push('> **\u26A0\uFE0F Important:** HealthKit requires a custom development build.');
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
      lines.push('- Add test data: Simulator > Features > Health > Health Data');
      lines.push('');
      lines.push('#### Configuration:');
      lines.push('');
      lines.push('Edit `lib/healthkit-config.ts` to customize which health metrics to collect.');
      lines.push('');
    }

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

    lines.push('## Project Structure');
    lines.push('');
    lines.push('```');
    lines.push('\u251C\u2500\u2500 app/              # Expo Router screens');
    lines.push('\u2502   \u251C\u2500\u2500 (tabs)/       # Bottom tab screens');
    if (hasCloudBackend) {
      lines.push('\u2502   \u251C\u2500\u2500 (onboarding)/ # Welcome and consent flow');
    }
    if (options.features.includes('questionnaire')) {
      lines.push('\u2502   \u2514\u2500\u2500 questionnaire/# Health form screens');
    }
    lines.push('\u251C\u2500\u2500 packages/         # Shared modules');
    if (hasCloudBackend) {
      lines.push('\u2502   \u2514\u2500\u2500 account/      # User account management');
    }
    if (options.features.includes('chat')) {
      lines.push('\u2502   \u2514\u2500\u2500 chat/         # AI chat functionality');
    }
    if (options.features.includes('scheduler')) {
      lines.push('\u2502   \u2514\u2500\u2500 scheduler/    # Task scheduling');
    }
    if (options.features.includes('questionnaire')) {
      lines.push('\u2502   \u2514\u2500\u2500 questionnaire/# FHIR forms');
    }
    if (options.features.includes('healthkit')) {
      lines.push('\u2502   \u2514\u2500\u2500 healthkit/    # Apple Health integration');
    }
    if (hasCloudBackend) {
      lines.push(`\u2502   \u2514\u2500\u2500 ${options.backend}/     # ${options.backend.charAt(0).toUpperCase() + options.backend.slice(1)} integration`);
    }
    lines.push('\u251C\u2500\u2500 lib/              # App utilities');
    lines.push('\u2514\u2500\u2500 components/       # Reusable UI components');
    lines.push('```');
    lines.push('');

    lines.push('## Learn More');
    lines.push('');
    lines.push('- [Expo Documentation](https://docs.expo.dev)');
    lines.push('- [Expo Router](https://expo.github.io/router/docs)');
    lines.push('- [React Native](https://reactnative.dev)');
    lines.push('');

    await fs.writeFile(path.join(projectDir, 'GETTING_STARTED.md'), lines.join('\n'));
  }

  private async initGit(projectDir: string): Promise<{ success: boolean; warning?: string }> {
    const { execSync } = await import('child_process');

    try {
      execSync('git --version', { stdio: 'ignore' });
    } catch {
      return {
        success: false,
        warning: 'Git is not installed. Skipping repository initialization.',
      };
    }

    try {
      execSync('git init', { cwd: projectDir, stdio: 'ignore' });
    } catch {
      return {
        success: false,
        warning: 'Failed to initialize git repository.',
      };
    }

    const gitConfig = checkGitConfig();
    if (!gitConfig.configured) {
      return {
        success: false,
        warning: `Git ${gitConfig.missing.join(' and ')} not configured. Run: git config --global user.name "Your Name"`,
      };
    }

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
}
