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

export interface SchedulerTask {
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM
}

export interface ContactInfo {
  name: string;
  title?: string;
  org?: string;
  email?: string;
  phone?: string;
}

export interface NotificationConfig {
  permissionTiming: 'onboarding' | 'firstUse';
  linkedTasks?: string[];
}

export interface GenerationOptions {
  projectName: string;
  displayName: string;
  backend: string;
  features: string[];
  llmProviders: string[];
  outputDir: string;
  envValues?: Record<string, string>;
  /** Selected validated questionnaires (e.g., 'phq-9', 'gad-7') */
  questionnaires?: string[];
  /** Custom questionnaire questions (one per line) */
  customQuestions?: string[];
  /** Primary brand color hex (e.g., '#0077B6') */
  primaryColor?: string;
  /** Optional app icon file path */
  appIconPath?: string;
  /** Selected HealthKit data types to collect */
  healthKitTypes?: string[];
  /** Configured scheduler tasks */
  schedulerTasks?: SchedulerTask[];
  /** Provider contacts */
  contacts?: ContactInfo[];
  /** Notification configuration */
  notificationConfig?: NotificationConfig;
  /** Firebase project configuration */
  firebaseConfig?: {
    apiKey: string;
    gcmSenderId: string;
    projectId: string;
    appId: string;
  };
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

  /** Get available backends for this platform */
  getBackends(): Promise<BackendOption[]>;

  /** Get available features for this platform */
  getFeatures(): Promise<FeatureOption[]>;

  /** Generate the project */
  generate(options: GenerationOptions): Promise<GenerationResult>;

  /** Get platform-specific next steps */
  getNextSteps(options: GenerationOptions): string[];
}
