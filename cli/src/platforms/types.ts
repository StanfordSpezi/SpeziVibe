/**
 * Platform generator abstraction
 *
 * Each platform (React Native, Swift, Android, etc.) implements this interface
 * to provide project generation for that platform.
 */

export interface BackendOption {
  value: string;
  name: string;
  description: string;
}

export interface FeatureOption {
  value: string;
  name: string;
  description: string;
  defaultChecked: boolean;
}

export interface GenerationOptions {
  projectName: string;
  displayName: string;
  backend: string;
  features: string[];
  llmProviders: string[];
  outputDir: string;
  envValues?: Record<string, string>;
}

export interface GenerationResult {
  duration: number;
  platform: string;
  filesCreated: number;
}

export interface PlatformGenerator {
  /** Platform identifier */
  readonly id: string;
  /** Human-readable name */
  readonly name: string;
  /** Description for CLI prompt */
  readonly description: string;
  /** Whether this platform is ready for use (false for stubs) */
  readonly ready?: boolean;

  /** Get available backends for this platform */
  getBackends(): Promise<BackendOption[]>;

  /** Get available features for this platform */
  getFeatures(): Promise<FeatureOption[]>;

  /** Generate the project */
  generate(options: GenerationOptions): Promise<GenerationResult>;

  /** Get platform-specific next steps */
  getNextSteps(options: GenerationOptions): string[];
}
