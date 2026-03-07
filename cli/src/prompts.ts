import { input, select, checkbox, confirm } from '@inquirer/prompts';
import pc from 'picocolors';
import type { BackendType, Feature, LLMProvider, ProjectOptions } from './types.js';
import type { PlatformGenerator } from './platforms/types.js';
import { getReadyPlatforms, getPlatform } from './platforms/registry.js';
import { discoverBackends, FEATURES, LLM_PROVIDERS } from './config.js';
import { promptForLLMKeys, promptForEnvVars, promptForLLMProviders } from './platforms/react-native/prompts.js';

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Prompt for platform selection
 * Auto-selects if only one platform is available
 */
export async function selectPlatform(): Promise<PlatformGenerator> {
  const readyPlatforms = getReadyPlatforms();

  if (readyPlatforms.length === 0) {
    throw new Error('No platforms available');
  }

  if (readyPlatforms.length === 1) {
    return readyPlatforms[0];
  }

  const platformId = await select<string>({
    message: 'Select a platform:',
    choices: readyPlatforms.map((p) => ({
      name: `${p.name} - ${p.description}`,
      value: p.id,
    })),
  });

  const platform = getPlatform(platformId);
  if (!platform) {
    throw new Error(`Unknown platform: ${platformId}`);
  }
  return platform;
}

export async function runPrompts(projectName?: string): Promise<{ options: ProjectOptions; platformId: string }> {
  // Platform selection (auto-selects if only one available)
  const platform = await selectPlatform();

  // Project name
  const name = projectName || await input({
    message: 'What is your project name?',
    default: 'my-spezi-app',
    validate: (value) => {
      if (!value.trim()) return 'Project name is required';
      if (!/^[a-z0-9-]+$/.test(value)) {
        return 'Project name must be lowercase with hyphens only (e.g., my-app)';
      }
      return true;
    },
  });

  // Display name
  const displayName = await input({
    message: 'What is your app display name?',
    default: name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
  });

  // Output directory
  const outputDir = await input({
    message: 'Where should the project be created?',
    default: `./${name}`,
    validate: (value) => {
      if (!value.trim()) return 'Output directory is required';
      return true;
    },
  });

  // Backend selection (from platform)
  const backendOptions = await platform.getBackends();
  const backend = await select<BackendType>({
    message: 'Select a backend:',
    choices: backendOptions.map((b) => ({
      name: `${b.name} — ${b.description}`,
      value: b.value,
    })),
  });

  // Prompt for backend env vars if applicable (React Native only)
  let envValues: Record<string, string> = {};
  if (platform.id === 'react-native') {
    const backends = await discoverBackends();
    const selectedBackend = backends.find(b => b.name === backend);
    if (selectedBackend) {
      envValues = await promptForEnvVars(selectedBackend);
    }
  }

  // Feature selection (from platform — Spezi module picker for Swift)
  const featureOptions = await platform.getFeatures();
  const featureLabel = platform.id === 'swift'
    ? 'Which Spezi modules do you want to include?'
    : 'Which features do you want to include?';
  const features = await checkbox<string>({
    message: featureLabel,
    choices: featureOptions.map((f) => ({
      name: f.name,
      value: f.value,
      checked: f.defaultChecked,
    })),
  });

  // LLM provider selection (React Native only, when chat is enabled)
  let llmProviders: LLMProvider[] = [];
  if (platform.id === 'react-native' && features.includes('chat')) {
    llmProviders = await promptForLLMProviders();

    // Prompt for LLM API keys
    const llmEnvValues = await promptForLLMKeys(llmProviders);
    envValues = { ...envValues, ...llmEnvValues };
  }

  return {
    options: {
      projectName: toKebabCase(name),
      displayName,
      backend,
      features,
      llmProviders,
      outputDir,
      envValues,
    },
    platformId: platform.id,
  };
}

/**
 * Ask user if they want to install dependencies
 */
export async function askInstallDependencies(): Promise<boolean> {
  return await confirm({
    message: 'Install dependencies now?',
    default: true,
  });
}

/**
 * Ask user if they want to launch the app
 */
export async function askLaunchApp(): Promise<boolean> {
  return await confirm({
    message: 'Launch the app now?',
    default: true,
  });
}

/**
 * Ask user if they want to build for iOS (for HealthKit)
 */
export async function askBuildForIOS(): Promise<'simulator' | 'device' | 'skip'> {
  return await select<'simulator' | 'device' | 'skip'>({
    message: 'HealthKit requires a custom iOS build. Build now?',
    choices: [
      {
        name: 'Build for iOS Simulator (Recommended for testing)',
        value: 'simulator',
      },
      {
        name: 'Build for iOS Device (Requires Apple Developer account)',
        value: 'device',
      },
      {
        name: 'Skip for now (I\'ll build later)',
        value: 'skip',
      },
    ],
  });
}
