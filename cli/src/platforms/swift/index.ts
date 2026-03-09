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
  resourceFiles?: string[];
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

    // Pre-check for user-friendly error (the actual move uses overwrite: false for safety)
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

      // 3.5. Handle questionnaire selection
      if (allFeatures.includes('questionnaire')) {
        const questionnaireManifest = manifests.get('questionnaire');
        const qOpts = (questionnaireManifest as any)?.questionnaireOptions;
        const questDir = path.join(tempDir, 'Sources', 'Questionnaires');
        await fs.ensureDir(questDir);

        let questionnairesAdded = false;

        // Copy selected validated questionnaires
        if (options.questionnaires && options.questionnaires.length > 0 && qOpts?.validated) {
          for (const qId of options.questionnaires) {
            const qDef = qOpts.validated[qId];
            if (qDef?.file) {
              const src = path.join(featuresDir, 'questionnaire', qDef.file);
              const dest = path.join(questDir, path.basename(qDef.file));
              if (await fs.pathExists(src)) {
                await fs.copy(src, dest);
                questionnairesAdded = true;
              }
            }
          }
        }

        // Generate questionnaire from custom questions
        if (options.customQuestions && options.customQuestions.length > 0) {
          const customQ = {
            resourceType: 'Questionnaire',
            id: 'custom-questionnaire',
            title: `${options.displayName} Questionnaire`,
            status: 'active',
            item: options.customQuestions.map((q, i) => ({
              linkId: `q${i + 1}`,
              text: q,
              type: 'string',
            })),
          };
          await fs.writeJson(
            path.join(questDir, 'CustomQuestionnaire.json'),
            customQ,
            { spaces: 2 }
          );
          questionnairesAdded = true;
        }

        // If no questionnaires selected, copy the default sample
        if (!questionnairesAdded) {
          const defaultSrc = path.join(featuresDir, 'questionnaire', 'Questionnaires', 'SampleQuestionnaire.json');
          if (await fs.pathExists(defaultSrc)) {
            await fs.copy(defaultSrc, path.join(questDir, 'SampleQuestionnaire.json'));
          }
        }
      }

      // 4. Generate consent document based on selected features
      if (allFeatures.includes('onboarding')) {
        spinner = spin('Generating consent document...');
        await this.generateConsentDocument(
          tempDir,
          options.displayName,
          allFeatures,
          options.backend
        );
        spinner.succeed('Generated consent document');
      }

      // 5. Merge injection markers (before variable substitution so injected content gets substituted too)
      spinner = spin('Applying code transforms...');
      await this.applyInjections(tempDir, manifests, allFeatures, swiftName);
      spinner.succeed('Applied code transforms');

      // 6. Apply variable substitution across all files (including injected content)
      spinner = spin('Applying project settings...');
      await this.applyVariableSubstitution(tempDir, swiftName, options.displayName);
      spinner.succeed('Applied project settings');

      // 7. Rename template files to project name
      spinner = spin('Renaming files...');
      await this.renameEntitlementsFile(tempDir, swiftName);
      spinner.succeed('Renamed files');

      // 8. Run xcodegen if available
      spinner = spin('Generating Xcode project...');
      const xcodegen = await this.runXcodegen(tempDir);
      if (xcodegen.success) {
        spinner.succeed('Generated Xcode project');
      } else {
        spinner.warn('xcodegen not found — project.yml ready for manual generation');
        note('Install xcodegen: brew install xcodegen');
        note('Then run: cd ' + options.outputDir + ' && xcodegen generate');
      }

      // 9. Init git
      spinner = spin('Initializing git repository...');
      const gitResult = await this.initGit(tempDir);
      if (gitResult.success) {
        spinner.succeed('Initialized git repository');
      } else {
        spinner.warn('Git initialized without commit');
        if (gitResult.warning) note(gitResult.warning);
      }

      // 10. Move to final directory (overwrite: false to prevent TOCTOU race)
      try {
        await fs.move(tempDir, finalDir, { overwrite: false });
      } catch (moveErr: unknown) {
        if (moveErr instanceof Error && moveErr.message.includes('dest already exists')) {
          throw new Error(`Directory ${finalDir} already exists`);
        }
        throw moveErr;
      }

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

    // Copy resource files (e.g., GoogleService-Info.plist)
    if (manifest.resourceFiles) {
      for (const file of manifest.resourceFiles) {
        const src = path.join(featureDir, file);
        const dest = path.join(projectDir, 'Sources', 'Resources', file);
        if (await fs.pathExists(src)) {
          await fs.ensureDir(path.dirname(dest));
          await fs.copy(src, dest);
        }
      }
    }

    // Copy feature-specific scripts (e.g., supabase-setup.sh)
    const featureScriptsDir = path.join(featureDir, 'scripts');
    if (await fs.pathExists(featureScriptsDir)) {
      const scriptsDestDir = path.join(projectDir, 'scripts');
      await fs.ensureDir(scriptsDestDir);
      const scriptFiles = await fs.readdir(featureScriptsDir);
      for (const scriptFile of scriptFiles) {
        const src = path.join(featureScriptsDir, scriptFile);
        const dest = path.join(scriptsDestDir, scriptFile);
        await fs.copy(src, dest);
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
  // Private: Consent Document Generation
  // ============================================================================

  /**
   * Generates a consent document tailored to the specific features selected
   * by the user. Only mentions data types and capabilities that are actually
   * present in the generated app. This is critical for health apps — the
   * consent must accurately reflect what the app does.
   */
  private async generateConsentDocument(
    projectDir: string,
    displayName: string,
    features: string[],
    backend: string
  ): Promise<void> {
    const hasHealthKit = features.includes('healthkit');
    const hasQuestionnaire = features.includes('questionnaire');
    const hasAccount = features.includes('account') || backend === 'firebase' || backend === 'supabase';
    const hasScheduler = features.includes('scheduler');
    const hasNotifications = features.includes('notifications');
    const hasContacts = features.includes('contacts');
    const usesCloud = backend === 'firebase' || backend === 'supabase' || backend === 'medplum';

    // --- Purpose section ---
    const purposeParts = ['manage your health activities'];
    if (hasScheduler) purposeParts.push('stay on top of scheduled health tasks');
    if (hasQuestionnaire) purposeParts.push('complete health assessments');
    if (hasHealthKit) purposeParts.push('track health data from Apple Health');

    // --- Data Collection bullets ---
    const dataBullets: string[] = [];
    dataBullets.push('- **App usage data** such as settings and preferences');

    if (hasHealthKit) {
      dataBullets.push(
        '- **Apple Health data** including health samples you authorize the app to read (e.g., step count, heart rate, activity data)'
      );
    }

    if (hasQuestionnaire) {
      dataBullets.push(
        '- **Questionnaire responses** from health assessments you complete within the app'
      );
    }

    if (hasScheduler) {
      dataBullets.push(
        '- **Task completion data** from scheduled health activities and check-ins'
      );
    }

    if (hasAccount) {
      dataBullets.push(
        '- **Account information** such as your name, email address, and authentication credentials'
      );
    }

    if (hasNotifications) {
      dataBullets.push(
        '- **Notification preferences** and device tokens for delivering reminders'
      );
    }

    // --- Data Storage section ---
    let storageText: string;
    if (usesCloud) {
      storageText =
        'Your data is stored securely using industry-standard encryption. ' +
        'When synced to the cloud, data is transmitted over encrypted connections and stored ' +
        'in compliance with applicable data protection regulations.';
    } else {
      storageText =
        'Your data is stored locally on your device using encrypted storage. ' +
        'No data is transmitted to external servers unless you explicitly choose to share it.';
    }

    // --- Withdrawal section ---
    let withdrawalText: string;
    if (hasAccount) {
      withdrawalText =
        'You may withdraw your consent at any time by deleting your account through the app\'s settings. ' +
        'Upon account deletion, your associated data will be removed from our systems in accordance with ' +
        'the app\'s data retention policy.';
    } else {
      withdrawalText =
        'You may withdraw your consent at any time by deleting the app from your device. ' +
        'Since your data is stored locally, removing the app will delete all associated data.';
    }

    // --- Contact section ---
    let contactText: string;
    if (hasContacts) {
      contactText =
        'If you have questions about this consent or the app\'s data practices, ' +
        'please use the contact information provided in the app\'s Contacts section.';
    } else {
      contactText =
        'If you have questions about this consent or the app\'s data practices, ' +
        'please contact the app development team.';
    }

    // --- Assemble the full document ---
    const doc = `# Consent Form

## Purpose
${displayName} is designed to help you ${purposeParts.join(', ')}.

## Data Collection
By using this application, you agree to the collection and processing of the following data:

${dataBullets.join('\n')}

## Data Storage & Security
${storageText}

## Privacy
Your data is handled in accordance with applicable privacy regulations, including HIPAA where applicable. Data is used only for the purposes described in this application and is never sold to third parties.

## Withdrawal of Consent
${withdrawalText}

## Contact
${contactText}

---

By signing below, you confirm that you have read and understood the above information and agree to participate.
`;

    // Write the consent document
    const consentPath = path.join(projectDir, 'Sources', 'Resources', 'ConsentDocument.md');
    await fs.ensureDir(path.dirname(consentPath));
    await fs.writeFile(consentPath, doc);
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

        // Use XML-escaped display name for plist/XML files to prevent invalid XML
        const isPlist = filePath.endsWith('.plist') || filePath.endsWith('.xml');
        const safeDisplayName = isPlist ? this.escapeXml(displayName) : displayName;
        content = content.replace(/\{\{DisplayName\}\}/g, safeDisplayName);

        // Bundle ID substitution (used by GoogleService-Info.plist)
        const bundleId = `com.spezivibe.${projectNameLower}`;
        content = content.replace(/\{\{bundleId\}\}/g, bundleId);

        if (content !== original) {
          await fs.writeFile(filePath, content);
        }
      } catch {
        // Skip binary files that can't be read as text
      }
    }
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
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
    // Build a map of product name → package name for xcodegen dependency resolution
    const productToPackage = new Map<string, string>();
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
    const infoPlistEntries: Record<string, string> = {};

    for (const featureName of allFeatures) {
      const m = manifests.get(featureName);
      if (!m) continue;

      // SPM packages for project.yml
      if (m.spmPackages) {
        for (const [name, pkg] of Object.entries(m.spmPackages)) {
          spmPackages.push(`  ${name}:\n    url: ${pkg.url}\n    from: "${pkg.from}"`);
          // Map each product to its package name for dependency resolution
          for (const product of pkg.products) {
            productToPackage.set(product, name);
          }
        }
      }

      if (m.targetDependencies) {
        for (const dep of m.targetDependencies) {
          const pkgName = productToPackage.get(dep) ?? dep;
          // If the product name matches the package name, use simple format
          if (pkgName === dep) {
            targetDeps.push(`      - package: ${dep}`);
          } else {
            targetDeps.push(`      - package: ${pkgName}\n        product: ${dep}`);
          }
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
      if (m.infoPlistEntries) Object.assign(infoPlistEntries, m.infoPlistEntries);

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

    // Apply Info.plist entries (e.g., usage descriptions for HealthKit)
    if (Object.keys(infoPlistEntries).length > 0) {
      const plistPath = path.join(projectDir, 'Sources', 'Supporting Files', 'Info.plist');
      if (await fs.pathExists(plistPath)) {
        let content = await fs.readFile(plistPath, 'utf-8');
        const plistLines = Object.entries(infoPlistEntries)
          .map(([key, value]) => `\t<key>${key}</key>\n\t<string>${this.escapeXml(value)}</string>`)
          .join('\n');
        content = content.replace('<!-- __INJECT_PLIST_ENTRIES__ -->', plistLines);
        await fs.writeFile(plistPath, content);
      }
    }

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
    // Include common Homebrew paths in PATH for child process
    const env = {
      ...process.env,
      PATH: `${process.env.PATH}:/opt/homebrew/bin:/usr/local/bin`,
    };
    try {
      execSync('which xcodegen', { stdio: 'ignore', env });
      execSync('xcodegen generate', { cwd: projectDir, stdio: 'pipe', env });
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
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    // When running from local repo: cli/dist/platforms/swift/index.js -> cli/dist -> cli -> repo root
    const repoRoot = path.join(__dirname, '..', '..', '..', '..');
    // When running from npm package: cli/dist/platforms/swift/index.js -> cli/dist -> cli (templates bundled inside)
    const packageRoot = path.join(__dirname, '..', '..', '..');
    // Prefer repo root (dev), fall back to package root (npm published)
    if (fs.pathExistsSync(path.join(repoRoot, 'swift-template'))) {
      return repoRoot;
    }
    return packageRoot;
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
