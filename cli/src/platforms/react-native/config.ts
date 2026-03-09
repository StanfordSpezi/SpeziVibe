/**
 * React Native / Expo specific configuration
 *
 * Contains features, LLM providers, and constants specific to the
 * React Native platform. Extracted from the shared config.ts.
 */

import type { Feature, LLMProvider } from '../../types.js';

// ============================================================================
// Feature Configuration (React Native specific)
// ============================================================================

export interface RNFeatureConfig {
  value: Feature;
  name: string;
  description: string;
  defaultChecked: boolean;
  /** Feature directory name (defaults to value) */
  dirName?: string;
}

export const FEATURES: RNFeatureConfig[] = [
  {
    value: 'chat',
    name: 'Chat',
    description: 'LLM integration with AI providers',
    defaultChecked: true,
  },
  {
    value: 'scheduler',
    name: 'Scheduler',
    description: 'recurring tasks and reminders',
    defaultChecked: true,
  },
  {
    value: 'questionnaire',
    name: 'Questionnaires',
    description: 'FHIR-compliant forms',
    defaultChecked: true,
  },
  {
    value: 'healthkit',
    name: 'HealthKit',
    description: 'Apple Health data access (iOS only)',
    defaultChecked: false,
  },
];

// ============================================================================
// LLM Provider Configuration (React Native specific)
// ============================================================================

export interface LLMProviderConfig {
  value: LLMProvider;
  name: string;
  description: string;
  defaultChecked: boolean;
  /** Environment variable name for API key */
  envVar: string;
  /** Setup URL for getting API key */
  setupUrl: string;
}

export const LLM_PROVIDERS: LLMProviderConfig[] = [
  {
    value: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, o1',
    defaultChecked: true,
    envVar: 'EXPO_PUBLIC_OPENAI_API_KEY',
    setupUrl: 'https://platform.openai.com/api-keys',
  },
  {
    value: 'anthropic',
    name: 'Anthropic',
    description: 'Claude',
    defaultChecked: false,
    envVar: 'EXPO_PUBLIC_ANTHROPIC_API_KEY',
    setupUrl: 'https://console.anthropic.com/',
  },
  {
    value: 'google',
    name: 'Google',
    description: 'Gemini',
    defaultChecked: false,
    envVar: 'EXPO_PUBLIC_GOOGLE_API_KEY',
    setupUrl: 'https://aistudio.google.com/apikey',
  },
];

// Helper to get provider config by value
export function getProviderConfig(provider: LLMProvider): LLMProviderConfig | undefined {
  return LLM_PROVIDERS.find((p) => p.value === provider);
}

// Get all LLM env var names (for filtering in env generation)
export function getLLMEnvVarNames(): string[] {
  return LLM_PROVIDERS.map((p) => p.envVar);
}

/** Environment variable for backend type (Expo-specific) */
export const BACKEND_ENV_VAR = 'EXPO_PUBLIC_BACKEND_TYPE';
