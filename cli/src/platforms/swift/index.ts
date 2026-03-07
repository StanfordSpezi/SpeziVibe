/**
 * Swift / iOS Platform Generator
 *
 * Generates Xcode projects using Stanford Spezi framework modules.
 * Uses xcodegen to produce the .xcodeproj from a project.yml spec.
 *
 * Architecture:
 * 1. Copy swift-template as the base project
 * 2. Load swift-features manifests for selected features
 * 3. Copy feature source files into the project
 * 4. Apply variable substitution
 * 5. Merge SPM dependencies and injection markers
 * 6. Run xcodegen to produce the .xcodeproj
 * 7. Init git repo
 */

import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import pc from 'picocolors';
import { execSync } from 'child_process';
import type {
  PlatformGenerator,
  GenerationOptions,
  GenerationResult,
  BackendOption,
  FeatureOption,
} from '../types.js';
import { checkGitConfig } from '../../utils.js';
import {
  blank,
  heading,
  hr,
  p,
  note,
  spin,
  formatDuration,
} from '../../pretty.js';
import { SWIFT_MODULES, SWIFT_BACKENDS } from './config.js';

// ============================================================================
// Types
// ============================================================================

interface SwiftManifest {
  name: string;
  category: string;
  platform: string;
  description?: string;
  spmPackages?: Record<string, {
    url: string;
    from: string;
    products: string[];
  }>;
  targetDependencies?: string[];
  autoIncludes?: string[];
  copyFiles?: string[];
  replaceFiles?: string[];
  extraFiles?: string[];
  delegateImports?: string[];
  delegateModules?: string[];
  delegateHelpers?: string;
  standardImports?: string[];
  standardConformances?: string[];
  standardMethods?: string;
  standardDependencies?: string;
  onboardingImports?: string[];
  onboardingSteps?: string[];
  onboardingCopyFiles?: string[];
  homeViewImports?: string[];
  homeViewSheets?: string;
  homeToolbar?: string;
  tabs?: {
    case: string;
    label: string;
    icon: string;
    view: string;
  };
  entitlements?: Record<string, unknown>;
  infoPlistEntries?: Record<string, string>;
  envVars?: Record<string, string>;
  requires?: string[];
  conflicts?: string[];
}

// ============================================================================
// Generator
// ============================================================================

export class SwiftPlatformGenerator implements PlatformGenerator {
  readonly id = 'swift';
  readonly name = 'iOS (Swift + Spezi)';
  readonly description = 'Native iOS app with Swift and Stanford Spezi framework';

  async getBackends(): Promise<BackendOption[]> {
    return SWIFT_BACKENDS;
  }

  async getFeatures(): Promise<FeatureOption[]> {
    return SWIFT_MODULES.map((m) => ({
      value: m.value,
      name: `${m.name} — ${m.description}`,
      description: m.description,
      defaultChecked: m.defaultChecked,
    }));
  }

  async generate(options: GenerationOptions): Promise<GenerationResult> {
    const startTime = Date.now();
    const finalDir = path.resolve(options.outputDir);

    if (await fs.pathExists(finalDir)) {
      throw new Error(`Directory ${finalDir} already exists`);
    }

    // Validate project name (Swift-compatible: letters, numbers, underscores)
    const swiftName = this.toSwiftIdentifier(options.projectName);

    blank();
    hr();
    heading(`Creating ${options.displayName} (iOS)`);
    hr();
    blank();

    const tempDir = path.join(
      os.tmpdir(),
      `spezivibe-swift-${Date.now()}-${Math.random().toString(36).slice(2)}`
    );

    try {
      // Resolve template and features directories
      const repoRoot = this.findRepoRoot();
      const templateDir = path.join(repoRoot, 'swift-template');
      const featuresDir = path.join(repoRoot, 'swift-features');

      if (!(await fs.pathExists(templateDir))) {
        throw new Error(`Swift template not found at ${templateDir}. Are you running from the SpeziVibe repo?`);
      }

      // 1. Copy base template
      let spinner = spin('Copying base template...');
      await fs.copy(templateDir, tempDir, {
        filter: (src) => !path.basename(src).startsWith('.git'),
      });
      spinner.succeed('Base template copied');

      // 2. Collect all features (including auto-includes from backend)
      const allFeatures = await this.collectFeatures(options, featuresDir);

      // 3. Load and apply feature manifests
      const manifests = await this.loadManifests(allFeatures, featuresDir);

      for (const featureName of allFeatures) {
        const manifest = manifests.get(featureName);
        if (manifest) {
          spinner = spin(`Adding ${manifest.name}...`);
          await this.applyFeature(tempDir, featuresDir, featureName, manifest);
          spinner.succeed(`Added ${manifest.name}`);
        }
      }

      // 4. Merge injection markers (before variable substitution so injected content gets substituted too)
      spinner = spin('Applying code transforms...');
      await this.applyInjections(tempDir, manifests, allFeatures, swiftName);
      spinner.succeed('Applied code transforms');

      // 5. Apply variable substitution across all files (including injected content)
      spinner = spin('Applying project settings...');
      await this.applyVariableSubstitution(tempDir, swiftName, options.displayName);
      spinner.succeed('Applied project settings');

      // 6. Rename template files to project name
      spinner = spin('Renaming files...');
      await this.renameEntitlementsFile(tempDir, swiftName);
      spinner.succeed('Renamed files');

      // 7. Run xcodegen if available
      spinner = spin('Generating Xcode project...');
      const xcodegen = await this.runXcodegen(tempDir);
      if (xcodegen.success) {
        spinner.succeed('Generated Xcode project');
      } else {
        spinner.warn('xcodegen not found — project.yml ready for manual generation');
        note('Install xcodegen: brew install xcodegen');
        note('Then run: cd ' + options.outputDir + ' && xcodegen generate');
      }

      // 8. Init git
      spinner = spin('Initializing git repository...');
      const gitResult = await this.initGit(tempDir);
      if (gitResult.success) {
        spinner.succeed('Initialized git repository');
      } else {
        spinner.warn('Git initialized without commit');
        if (gitResult.warning) note(gitResult.warning);
      }

      // 9. Move to final directory
      await fs.move(tempDir, finalDir);

      const duration = Date.now() - startTime;
      const filesCreated = await this.countFiles(finalDir);

      blank();
      hr();
      p(pc.green(pc.bold('Done!')) + pc.dim(` in ${formatDuration(duration)}`));
      hr();

      return { duration, platform: this.id, filesCreated };
    } catch (err) {
      blank();
      p(pc.red('Generation failed. Cleaning up...'));
      try { await fs.remove(tempDir); } catch { /* ignore */ }
      throw err;
    }
  }

  getNextSteps(options: GenerationOptions): string[] {
    const steps: string[] = [
      `cd ${options.outputDir}`,
    ];

    // Check if xcodegen is available
    try {
      execSync('which xcodegen', { stdio: 'ignore' });
    } catch {
      steps.push('brew install xcodegen');
      steps.push('xcodegen generate');
    }

    steps.push('open *.xcodeproj');
    steps.push('# Build and run in Xcode (⌘R)');
    return steps;
  }

  // ============================================================================
  // Private: Feature Collection
  // ============================================================================

  private async collectFeatures(
    options: GenerationOptions,
    featuresDir: string
  ): Promise<string[]> {
    const features: string[] = [];

    // Add backend if not local
    if (options.backend !== 'local') {
      const manifestPath = path.join(featuresDir, options.backend, 'manifest.json');
      if (await fs.pathExists(manifestPath)) {
        const manifest: SwiftManifest = await fs.readJson(manifestPath);
        features.push(options.backend);
        if (manifest.autoIncludes) {
          features.push(...manifest.autoIncludes);
        }
      }
    }

    // Add selected features
    for (const feature of options.features) {
      if (!features.includes(feature)) {
        features.push(feature);
      }
    }

    return features;
  }

  private async loadManifests(
    featureNames: string[],
    featuresDir: string
  ): Promise<Map<string, SwiftManifest>> {
    const manifests = new Map<string, SwiftManifest>();

    for (const name of featureNames) {
      const manifestPath = path.join(featuresDir, name, 'manifest.json');
      if (await fs.pathExists(manifestPath)) {
        manifests.set(name, await fs.readJson(manifestPath));
      }
    }

    return manifests;
  }

  // ============================================================================
  // Private: Feature Application
  // ============================================================================

  private async applyFeature(
    projectDir: string,
    featuresDir: string,
    featureName: string,
    manifest: SwiftManifest
  ): Promise<void> {
    const featureDir = path.join(featuresDir, featureName);

    // Copy files
    if (manifest.copyFiles) {
      for (const file of manifest.copyFiles) {
        const src = path.join(featureDir, file);
        const dest = path.join(projectDir, 'Sources', file);
        if (await fs.pathExists(src)) {
          await fs.ensureDir(path.dirname(dest));
          await fs.copy(src, dest);
        }
      }
    }

    // Replace files (overwrite existing)
    if (manifest.replaceFiles) {
      for (const file of manifest.replaceFiles) {
        const src = path.join(featureDir, file);
        const dest = path.join(projectDir, 'Sources', file);
        if (await fs.pathExists(src)) {
          await fs.ensureDir(path.dirname(dest));
          await fs.copy(src, dest, { overwrite: true });
        }
      }
    }

    // Copy onboarding-specific files
    if (manifest.onboardingCopyFiles) {
      for (const file of manifest.onboardingCopyFiles) {
        const src = path.join(featureDir, file);
        const dest = path.join(projectDir, 'Sources', 'Onboarding', file);
        if (await fs.pathExists(src)) {
          await fs.ensureDir(path.dirname(dest));
          await fs.copy(src, dest);
        }
      }
    }
  }

  // ============================================================================
  // Private: Variable Substitution
  // ============================================================================

  private async applyVariableSubstitution(
    projectDir: string,
    projectName: string,
    displayName: string
  ): Promise<void> {
    const files = await this.findAllFiles(projectDir);
    const projectNameLower = projectName.toLowerCase();

    for (const filePath of files) {
      // Only process text files
      const ext = path.extname(filePath);
      if (['.png', '.jpg', '.jpeg', '.gif', '.ico', '.icns'].includes(ext)) continue;

      try {
        let content = await fs.readFile(filePath, 'utf-8');
        const original = content;

        content = content.replace(/\{\{ProjectName\}\}/g, projectName);
        content = content.replace(/\{\{projectNameLower\}\}/g, projectNameLower);
        content = content.replace(/\{\{DisplayName\}\}/g, displayName);

        if (content !== original) {
          await fs.writeFile(filePath, content);
        }
      } catch {
        // Skip binary files that can't be read as text
      }
    }
  }

  // ============================================================================
  // Private: Injection Markers
  // ============================================================================

  private async applyInjections(
    projectDir: string,
    manifests: Map<string, SwiftManifest>,
    allFeatures: string[],
    projectName: string
  ): Promise<void> {
    // Collect all injections by marker
    const spmPackages: string[] = [];
    const targetDeps: string[] = [];
    const delegateImports: string[] = [];
    const delegateModules: string[] = [];
    const delegateHelpers: string[] = [];
    const standardImports: string[] = [];
    const standardConformances: string[] = [];
    const standardMethods: string[] = [];
    const onboardingImports: string[] = [];
    const onboardingSteps: string[] = [];
    const homeViewImports: string[] = [];
    const homeViewSheets: string[] = [];
    const homeToolbars: string[] = [];
    const tabCases: string[] = [];
    const tabViews: string[] = [];
    const entitlements: Record<string, unknown> = {};

    for (const featureName of allFeatures) {
      const m = manifests.get(featureName);
      if (!m) continue;

      // SPM packages for project.yml
      if (m.spmPackages) {
        for (const [name, pkg] of Object.entries(m.spmPackages)) {
          spmPackages.push(`  ${name}:\n    url: ${pkg.url}\n    from: "${pkg.from}"`);
        }
      }

      if (m.targetDependencies) {
        for (const dep of m.targetDependencies) {
          targetDeps.push(`      - package: ${dep.includes('/') ? dep.split('/')[0] : dep}\n        product: ${dep}`);
        }
      }

      if (m.delegateImports) delegateImports.push(...m.delegateImports);
      if (m.delegateModules) delegateModules.push(...m.delegateModules);
      if (m.delegateHelpers) delegateHelpers.push(m.delegateHelpers);
      if (m.standardImports) standardImports.push(...m.standardImports);
      if (m.standardConformances) standardConformances.push(...m.standardConformances);
      if (m.standardMethods) standardMethods.push(m.standardMethods);
      if (m.onboardingImports) onboardingImports.push(...m.onboardingImports);
      if (m.onboardingSteps) onboardingSteps.push(...m.onboardingSteps);
      if (m.homeViewImports) homeViewImports.push(...m.homeViewImports);
      if (m.homeViewSheets) homeViewSheets.push(m.homeViewSheets);
      if (m.homeToolbar) homeToolbars.push(m.homeToolbar);
      if (m.entitlements) Object.assign(entitlements, m.entitlements);

      if (m.tabs) {
        tabCases.push(`case ${m.tabs.case}`);
        tabViews.push(
          `Tab("${m.tabs.label}", systemImage: "${m.tabs.icon}", value: .${m.tabs.case}) {\n` +
          `                ${m.tabs.view}\n` +
          `            }`
        );
      }
    }

    // Apply to project.yml
    await this.injectInFile(
      path.join(projectDir, 'project.yml'),
      {
        '# __INJECT_SPM_PACKAGES__': spmPackages.join('\n'),
        '# __INJECT_TARGET_DEPENDENCIES__': targetDeps.join('\n'),
      }
    );

    // Apply to Delegate.swift
    await this.injectInFile(
      path.join(projectDir, 'Sources', 'Delegate.swift'),
      {
        '// __INJECT_DELEGATE_IMPORTS__': [...new Set(delegateImports)].map((i) => `import ${i}`).join('\n'),
        '            // __INJECT_DELEGATE_MODULES__': delegateModules.map((m) => `            ${m}`).join('\n'),
      }
    );

    // If delegate has helpers, append them before the closing brace
    if (delegateHelpers.length > 0) {
      const delegatePath = path.join(projectDir, 'Sources', 'Delegate.swift');
      if (await fs.pathExists(delegatePath)) {
        let content = await fs.readFile(delegatePath, 'utf-8');
        const lastBrace = content.lastIndexOf('}');
        if (lastBrace > 0) {
          const helpers = delegateHelpers.map((h) => `\n    ${h}`).join('\n');
          content = content.slice(0, lastBrace) + helpers + '\n' + content.slice(lastBrace);
          await fs.writeFile(delegatePath, content);
        }
      }
    }

    // Apply to Standard.swift
    await this.injectInFile(
      path.join(projectDir, 'Sources', 'Standard.swift'),
      {
        '// __INJECT_STANDARD_IMPORTS__': [...new Set(standardImports)].map((i) => `import ${i}`).join('\n'),
        '                               // __INJECT_STANDARD_CONFORMANCES__':
          standardConformances.length > 0
            ? standardConformances.map((c) => `,\n                               ${c}`).join('')
            : '',
        '    // __INJECT_STANDARD_METHODS__': standardMethods.map((m) => `    ${m}`).join('\n\n    '),
      }
    );

    // Apply to HomeView.swift
    await this.injectInFile(
      path.join(projectDir, 'Sources', 'HomeView.swift'),
      {
        '// __INJECT_HOMEVIEW_IMPORTS__': [...new Set(homeViewImports)].join('\n'),
        '        // __INJECT_TAB_CASES__': tabCases.map((c) => `        ${c}`).join('\n'),
        '            // __INJECT_TABS__': tabViews.map((t) => `            ${t}`).join('\n'),
        '        // __INJECT_HOMEVIEW_SHEETS__': homeViewSheets.map((s) => `        ${s}`).join('\n'),
        '                    // __INJECT_HOME_TOOLBAR__': homeToolbars.length > 0
          ? `.toolbar {\n                    ${homeToolbars.join('\n                    ')}\n                }`
          : '',
      }
    );

    // Apply to OnboardingFlow.swift
    await this.injectInFile(
      path.join(projectDir, 'Sources', 'OnboardingFlow.swift'),
      {
        '// __INJECT_ONBOARDING_IMPORTS__': [...new Set(onboardingImports)].map((i) => `import ${i}`).join('\n'),
        '            // __INJECT_ONBOARDING_STEPS__': onboardingSteps.map((s) => `            ${s}`).join('\n'),
      }
    );

    // Apply entitlements
    if (Object.keys(entitlements).length > 0) {
      const entPath = path.join(projectDir, 'Sources', 'Supporting Files', 'Entitlements.entitlements');
      if (await fs.pathExists(entPath)) {
        let content = await fs.readFile(entPath, 'utf-8');
        const entLines = Object.entries(entitlements)
          .map(([key, value]) => {
            if (typeof value === 'boolean') {
              return `\t<key>${key}</key>\n\t<${value}/>`;
            } else if (Array.isArray(value)) {
              const items = value.map((v) => `\t\t<string>${v}</string>`).join('\n');
              return `\t<key>${key}</key>\n\t<array>\n${items}\n\t</array>`;
            }
            return `\t<key>${key}</key>\n\t<string>${value}</string>`;
          })
          .join('\n');
        content = content.replace('<!-- __INJECT_ENTITLEMENTS__ -->', entLines);
        await fs.writeFile(entPath, content);
      }
    }
  }

  private async injectInFile(
    filePath: string,
    replacements: Record<string, string>
  ): Promise<void> {
    if (!(await fs.pathExists(filePath))) return;

    let content = await fs.readFile(filePath, 'utf-8');
    for (const [marker, injection] of Object.entries(replacements)) {
      content = content.replace(marker, injection);
    }
    await fs.writeFile(filePath, content);
  }

  // ============================================================================
  // Private: Xcodegen
  // ============================================================================

  private async runXcodegen(projectDir: string): Promise<{ success: boolean }> {
    try {
      execSync('which xcodegen', { stdio: 'ignore' });
      execSync('xcodegen generate', { cwd: projectDir, stdio: 'ignore' });
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  // ============================================================================
  // Private: Utilities
  // ============================================================================

  private toSwiftIdentifier(name: string): string {
    // Convert kebab-case to PascalCase
    return name
      .split(/[-_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  private findRepoRoot(): string {
    // When running from local repo: cli/dist/platforms/swift/index.js -> cli/dist -> cli -> repo root
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const repoRoot = path.join(__dirname, '..', '..', '..', '..');
    return repoRoot;
  }

  private async renameEntitlementsFile(projectDir: string, projectName: string): Promise<void> {
    const src = path.join(projectDir, 'Sources', 'Supporting Files', 'Entitlements.entitlements');
    const dest = path.join(projectDir, 'Sources', 'Supporting Files', `${projectName}.entitlements`);
    if (await fs.pathExists(src)) {
      await fs.move(src, dest);
    }
  }

  private async findAllFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      if (entry.isDirectory()) {
        files.push(...(await this.findAllFiles(fullPath)));
      } else {
        files.push(fullPath);
      }
    }
    return files;
  }

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

  private async initGit(projectDir: string): Promise<{ success: boolean; warning?: string }> {
    try {
      execSync('git --version', { stdio: 'ignore' });
    } catch {
      return { success: false, warning: 'Git is not installed.' };
    }

    try {
      execSync('git init', { cwd: projectDir, stdio: 'ignore' });
    } catch {
      return { success: false, warning: 'Failed to initialize git repository.' };
    }

    const gitConfig = checkGitConfig();
    if (!gitConfig.configured) {
      return {
        success: false,
        warning: `Git ${gitConfig.missing.join(' and ')} not configured.`,
      };
    }

    try {
      execSync('git add .', { cwd: projectDir, stdio: 'ignore' });
      execSync('git commit -m "Initial commit from create-spezivibe-app (Swift)"', {
        cwd: projectDir,
        stdio: 'ignore',
      });
      return { success: true };
    } catch {
      return { success: false, warning: 'Git commit failed.' };
    }
  }
}
