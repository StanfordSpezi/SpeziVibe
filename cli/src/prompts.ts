import { input, select, checkbox, confirm } from '@inquirer/prompts';
import pc from 'picocolors';
import type { BackendType, Feature, FeatureManifest, LLMProvider, ProjectOptions } from './types.js';
import { discoverBackends, FEATURES, LLM_PROVIDERS, getProviderConfig } from './config.js';

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Convert env var name to human-readable label
 * e.g., "EXPO_PUBLIC_FIREBASE_API_KEY" -> "Firebase API Key"
 */
function envVarToLabel(envVar: string): string {
  return envVar
    .replace(/^EXPO_PUBLIC_/, '')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Prompt user for LLM API keys
 */
async function promptForLLMKeys(providers: LLMProvider[]): Promise<Record<string, string>> {
  const envValues: Record<string, string> = {};

  if (providers.length === 0) {
    return envValues;
  }

  console.log('');
  console.log(pc.cyan('Configure LLM API Keys:'));
  console.log(pc.dim('  (leave blank to configure later in .env file)'));
  console.log('');

  for (const provider of providers) {
    const config = getProviderConfig(provider);
    if (config) {
      console.log(pc.dim(`  Get your key at: ${config.setupUrl}`));
      const value = await input({
        message: `  ${config.name} API Key:`,
        default: '',
      });
      envValues[config.envVar] = value;
    }
  }

  return envValues;
}

/**
 * Prompt user for backend environment variable values
 */
async function promptForEnvVars(backendManifest: FeatureManifest): Promise<Record<string, string>> {
  const envValues: Record<string, string> = {};

  if (!backendManifest.envVars) {
    return envValues;
  }

  // Find env vars that need user input (empty values)
  const promptableVars = Object.entries(backendManifest.envVars)
    .filter(([_, value]) => value === '');

  if (promptableVars.length === 0) {
    return envValues;
  }

  console.log('');
  console.log(pc.cyan(`Configure ${backendManifest.name}:`));
  console.log(pc.dim('  (leave blank to configure later in .env file)'));
  console.log('');

  for (const [envVar] of promptableVars) {
    const label = envVarToLabel(envVar);
    const value = await input({
      message: `  ${label}:`,
      default: '',
    });
    envValues[envVar] = value;
  }

  return envValues;
}

export interface PromptFlags {
  hipaaFlag?: boolean;
}

export async function runPrompts(projectName?: string, flags: PromptFlags = {}): Promise<ProjectOptions> {
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

  // Backend selection (discovered from features)
  const backends = await discoverBackends();
  const backendChoices = [
    { name: 'Local (on-device only, no auth)', value: 'local' },
    ...backends.map((b) => ({
      name: `${b.name} (${b.description})`,
      value: b.name,
    })),
  ];

  const backend = await select<BackendType>({
    message: 'Select a backend:',
    choices: backendChoices,
  });

  // Prompt for backend env vars if applicable
  let envValues: Record<string, string> = {};
  const selectedBackend = backends.find(b => b.name === backend);
  if (selectedBackend) {
    envValues = await promptForEnvVars(selectedBackend);
  }

  // HIPAA mode (from flag or prompt)
  let hipaaMode = flags.hipaaFlag || false;
  if (!hipaaMode) {
    hipaaMode = await confirm({
      message: 'Will this app handle Protected Health Information (PHI)?',
      default: false,
    });
  }

  if (hipaaMode && backend === 'local') {
    console.log('');
    console.log(pc.yellow('  \u26a0\ufe0f  Local-only backend stores data on-device without cloud sync.'));
    console.log(pc.yellow('     On-device data is encrypted by iOS (Data Protection). HIPAA mode will'));
    console.log(pc.yellow('     add audit logging and consent tracking, but a cloud backend is'));
    console.log(pc.yellow('     recommended for full HIPAA compliance.'));
    console.log('');
  }

  // Feature selection (from config)
  const features = await checkbox<Feature>({
    message: 'Which features do you want to include?',
    choices: FEATURES.map((f) => ({
      name: `${f.name} (${f.description})`,
      value: f.value,
      checked: f.defaultChecked,
    })),
  });

  // LLM provider selection (only if chat is enabled)
  let llmProviders: LLMProvider[] = [];
  if (features.includes('chat')) {
    llmProviders = await checkbox<LLMProvider>({
      message: 'Which LLM providers do you want to support?',
      choices: LLM_PROVIDERS.map((p) => ({
        name: `${p.name} (${p.description})`,
        value: p.value,
        checked: p.defaultChecked,
      })),
    });

    // Ensure at least one provider is selected (default to first)
    if (llmProviders.length === 0) {
      const defaultProvider = LLM_PROVIDERS.find((p) => p.defaultChecked) || LLM_PROVIDERS[0];
      llmProviders = [defaultProvider.value];
      console.log(`  No providers selected, defaulting to ${defaultProvider.name}`);
    }

    // Prompt for LLM API keys
    const llmEnvValues = await promptForLLMKeys(llmProviders);
    envValues = { ...envValues, ...llmEnvValues };
  }

  return {
    projectName: toKebabCase(name),
    displayName,
    backend,
    features,
    llmProviders,
    outputDir,
    envValues,
    hipaaMode,
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
