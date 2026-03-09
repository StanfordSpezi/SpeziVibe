// BackendType is dynamic - 'local' is the default, others are discovered from features
export type BackendType = string;

export type Feature = 'chat' | 'scheduler' | 'questionnaire' | 'healthkit';

export type LLMProvider = 'openai' | 'anthropic' | 'google';

export interface ProjectOptions {
  projectName: string;
  displayName: string;
  backend: BackendType;
  features: Feature[];
  llmProviders: LLMProvider[];
  outputDir: string;
  /** User-provided values for environment variables */
  envValues?: Record<string, string>;
  /** Enable HIPAA-compliant defaults (audit logging, session timeout, etc.) */
  hipaaMode: boolean;
}

export interface SourcePaths {
  templateDir: string;
  featuresDir: string;
  packagesDir: string;
}

export interface TransformContext {
  options: ProjectOptions;
  projectDir: string;
  source: SourcePaths;
}

/**
 * Code transform operation
 * Describes how to modify a file by injecting content at a marker
 */
export interface CodeTransform {
  /** Target file path (relative to project root) */
  file: string;
  /** Injection marker to find (e.g., "__INJECT_TABS__") */
  marker: string;
  /** Content to inject at the marker */
  content: string;
}

/**
 * Feature manifest schema
 *
 * Each feature is defined by a manifest.json file that declares:
 * - What packages/files to add
 * - Dependencies to install
 *
 * Package auto-inference:
 * Packages are automatically copied from the `packages/` directory based on
 * `@spezivibe/*` entries in dependencies. For example, if dependencies includes
 * `"@spezivibe/chat": "*"`, the `packages/chat` directory will be copied and
 * added to workspaces automatically.
 *
 * Backend-specific file variants:
 * Features can provide backend-specific versions of files using naming convention:
 *   file.tsx         -> default version
 *   file.firebase.tsx -> used when firebase backend is selected
 */
export interface FeatureManifest {
  /** Feature identifier */
  name: string;
  /** Human-readable description */
  description: string;

  // Plugin categorization
  /** Category: 'backend' for backend plugins, 'feature' for regular features (default) */
  category?: 'backend' | 'feature';
  /** Features to automatically include when this feature is selected */
  autoIncludes?: string[];

  // Package management
  /**
   * NPM dependencies to add to package.json
   * @spezivibe/* dependencies are auto-copied from packages/ and added to workspaces
   */
  dependencies?: Record<string, string>;
  /** NPM scripts to add to package.json */
  scripts?: Record<string, string>;

  // File operations
  /** Directories to copy from feature dir (app-level dirs only, not packages) */
  copyDirs?: string[];
  /** Individual files to copy (won't overwrite existing) */
  copyFiles?: string[];
  /** Files to replace (will overwrite existing) */
  replaceFiles?: string[];

  // Code transforms
  /**
   * Declarative code transforms to apply
   * Each transform injects content at a marker in a target file
   */
  transforms?: CodeTransform[];

  // Environment
  /** Environment variables to add to .env.example */
  envVars?: Record<string, string>;

  // Feature relationships
  /** Features that must also be selected (auto-added) */
  requires?: string[];
  /** Features that cannot be used together */
  conflicts?: string[];
}
