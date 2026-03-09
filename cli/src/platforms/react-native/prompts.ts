/**
 * React Native specific prompts
 *
 * Handles LLM provider selection, API key input, and backend env var configuration.
 */

import { input, checkbox } from '@inquirer/prompts';
import pc from 'picocolors';
import type { LLMProvider, FeatureManifest } from '../../types.js';
import { LLM_PROVIDERS, getProviderConfig } from './config.js';

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
export async function promptForLLMKeys(providers: LLMProvider[]): Promise<Record<string, string>> {
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
export async function promptForEnvVars(backendManifest: FeatureManifest): Promise<Record<string, string>> {
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

/**
 * Prompt for LLM provider selection
 */
export async function promptForLLMProviders(): Promise<LLMProvider[]> {
  let llmProviders = await checkbox<LLMProvider>({
    message: 'Which LLM providers do you want to support?',
    choices: LLM_PROVIDERS.map((p) => ({
      name: `${p.name} (${p.description})`,
      value: p.value,
      checked: p.defaultChecked,
    })),
  });

  // Ensure at least one provider is selected (default to first)
  if (llmProviders.length === 0) {
    if (LLM_PROVIDERS.length === 0) {
      throw new Error('No LLM providers configured. Check your platform configuration.');
    }
    const defaultProvider = LLM_PROVIDERS.find((p) => p.defaultChecked) ?? LLM_PROVIDERS[0];
    llmProviders = [defaultProvider.value];
    console.log(`  No providers selected, defaulting to ${defaultProvider.name}`);
  }

  return llmProviders;
}
