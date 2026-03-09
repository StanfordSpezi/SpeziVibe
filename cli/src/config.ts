/**
 * Central configuration for the CLI tool
 *
 * Contains platform-agnostic configuration (markers, dependency requirements,
 * template variables, backend discovery).
 *
 * Platform-specific configuration (features, LLM providers) lives in
 * platforms/react-native/config.ts.
 */

import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import type { FeatureManifest } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Re-exports from React Native config (backward compatibility)
// ============================================================================

// Re-export RN-specific config for existing code that imports from here
export {
  FEATURES,
  LLM_PROVIDERS,
  BACKEND_ENV_VAR,
  getProviderConfig,
  getLLMEnvVarNames,
  type RNFeatureConfig as FeatureConfig,
  type LLMProviderConfig,
} from './platforms/react-native/config.js';

// ============================================================================
// Backend Discovery (platform-agnostic)
// ============================================================================

/**
 * Discover available backends by scanning the features directory
 * for features with category: "backend"
 */
export async function discoverBackends(): Promise<FeatureManifest[]> {
  const featuresDir = path.join(__dirname, '../../features');
  const backends: FeatureManifest[] = [];

  if (!(await fs.pathExists(featuresDir))) {
    return backends;
  }

  const entries = await fs.readdir(featuresDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const manifestPath = path.join(featuresDir, entry.name, 'manifest.json');
      if (await fs.pathExists(manifestPath)) {
        try {
          const manifest = await fs.readJson(manifestPath);
          if (manifest.category === 'backend') {
            backends.push(manifest);
          }
        } catch {
          // Skip invalid manifest for this feature
        }
      }
    }
  }

  return backends;
}

// ============================================================================
// Injection Marker Configuration (platform-agnostic)
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
  // React Native markers
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
  // Swift markers
  {
    name: '__INJECT_DELEGATE_IMPORTS__',
    file: 'Sources/Delegate.swift',
    description: 'Import statements for the Spezi delegate',
  },
  {
    name: '__INJECT_DELEGATE_MODULES__',
    file: 'Sources/Delegate.swift',
    description: 'Spezi module configuration entries',
  },
  {
    name: '__INJECT_STANDARD_IMPORTS__',
    file: 'Sources/Standard.swift',
    description: 'Import statements for the Standard',
  },
  {
    name: '__INJECT_STANDARD_CONFORMANCES__',
    file: 'Sources/Standard.swift',
    description: 'Protocol conformances for the Standard',
  },
  {
    name: '__INJECT_STANDARD_METHODS__',
    file: 'Sources/Standard.swift',
    description: 'Method implementations for the Standard',
  },
  {
    name: '__INJECT_ONBOARDING_STEPS__',
    file: 'Sources/OnboardingFlow.swift',
    description: 'Onboarding flow step views',
  },
  {
    name: '__INJECT_TABS__',
    file: 'Sources/HomeView.swift',
    description: 'Tab views for home screen',
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
// Dependency Requirements (platform-agnostic)
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
// Template Variables (platform-agnostic)
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
