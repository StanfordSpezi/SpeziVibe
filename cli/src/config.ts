/**
 * Central configuration for the CLI tool
 * Single source of truth for features, providers, markers, and constants
 */

import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import type { Feature, FeatureManifest, LLMProvider } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Backend Discovery
// ============================================================================

/**
 * Discover available backends by scanning the features directory
 * for features with category: "backend"
 */
export async function discoverBackends(): Promise<FeatureManifest[]> {
  const featuresDir = path.join(__dirname, '../../features');
  const backends: FeatureManifest[] = [];

  try {
    const entries = await fs.readdir(featuresDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const manifestPath = path.join(featuresDir, entry.name, 'manifest.json');
        if (await fs.pathExists(manifestPath)) {
          const manifest = await fs.readJson(manifestPath);
          if (manifest.category === 'backend') {
            backends.push(manifest);
          }
        }
      }
    }
  } catch {
    // Features directory doesn't exist or can't be read
  }

  return backends;
}

// ============================================================================
// Feature Configuration
// ============================================================================

export interface FeatureConfig {
  value: Feature;
  name: string;
  description: string;
  defaultChecked: boolean;
  /** Feature directory name (defaults to value) */
  dirName?: string;
}

export const FEATURES: FeatureConfig[] = [
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
  // Note: Onboarding is no longer a selectable feature.
  // It's automatically included when Firebase backend is selected.
];

// Helper to get feature config by value
export function getFeatureConfig(feature: Feature): FeatureConfig | undefined {
  return FEATURES.find((f) => f.value === feature);
}

// ============================================================================
// LLM Provider Configuration
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

// ============================================================================
// Injection Marker Configuration
// ============================================================================

export interface MarkerConfig {
  /** Marker name (without wrapper syntax) */
  name: string;
  /** File where this marker exists */
  file: string;
  /** Description of what gets injected here */
  description: string;
}

export const MARKERS: MarkerConfig[] = [
  {
    name: '__INJECT_TABS__',
    file: 'app/(tabs)/_layout.tsx',
    description: 'Tab screen entries for bottom navigation',
  },
  {
    name: '__INJECT_STACK_SCREENS__',
    file: 'app/_layout.tsx',
    description: 'Stack screen entries for root navigation',
  },
];

/**
 * Format a marker name into the full marker syntax
 * e.g., "__INJECT_TABS__" -> "{/* __INJECT_TABS__ *‌/}"
 */
export function formatMarker(markerName: string): string {
  return `{/* ${markerName} */}`;
}

// Helper to validate a marker exists
export function isValidMarker(markerName: string): boolean {
  return MARKERS.some((m) => m.name === markerName);
}

// ============================================================================
// Dependency Requirements
// ============================================================================

export interface DependencyRequirement {
  name: string;
  command: string;
  versionArg: string;
  required: boolean;
  minVersion?: string;
  extractVersion?: (output: string) => string;
}

export const DEPENDENCY_REQUIREMENTS: DependencyRequirement[] = [
  {
    name: 'Node.js',
    command: 'node',
    versionArg: '--version',
    required: true,
    minVersion: '18.0.0',
    extractVersion: (output) => output.replace('v', '').trim(),
  },
  {
    name: 'npm',
    command: 'npm',
    versionArg: '--version',
    required: true,
    minVersion: '9.0.0',
    extractVersion: (output) => output.trim(),
  },
  {
    name: 'git',
    command: 'git',
    versionArg: '--version',
    required: false,
    extractVersion: (output) => {
      const match = output.match(/git version (\d+\.\d+\.\d+)/);
      return match ? match[1] : output.trim();
    },
  },
];

// ============================================================================
// Template Variables
// ============================================================================

/**
 * Files that contain template variables to replace
 * Variables use the format {{variableName}}
 */
export const TEMPLATE_VARIABLE_FILES = [
  'package.json',
  'app.config.js',
];

/**
 * Available template variables and their sources
 */
export const TEMPLATE_VARIABLES = {
  projectName: 'options.projectName',
  displayName: 'options.displayName',
} as const;

// ============================================================================
// Constants
// ============================================================================

/** Environment variable for backend type */
export const BACKEND_ENV_VAR = 'EXPO_PUBLIC_BACKEND_TYPE';
