/**
 * Swift / iOS platform configuration
 *
 * Defines available Spezi modules that users can select when generating
 * a Swift/iOS project. Each module maps to one or more Swift packages
 * in the Stanford Spezi ecosystem.
 */

export interface SwiftModuleConfig {
  value: string;
  name: string;
  description: string;
  defaultChecked: boolean;
  /** Category for grouping in the CLI picker */
  category: 'backend' | 'core' | 'data' | 'ui';
}

/**
 * Available Spezi modules for the Swift platform.
 * These drive the interactive picker — users select which modules
 * to include in their generated project.
 */
export const SWIFT_MODULES: SwiftModuleConfig[] = [
  // Data & Health
  {
    value: 'healthkit',
    name: 'HealthKit',
    description: 'Apple Health data collection (SpeziHealthKit)',
    defaultChecked: false,
    category: 'data',
  },
  {
    value: 'scheduler',
    name: 'Scheduler',
    description: 'Task scheduling and reminders (SpeziScheduler)',
    defaultChecked: true,
    category: 'core',
  },
  {
    value: 'questionnaire',
    name: 'Questionnaires',
    description: 'FHIR-compliant health forms (SpeziQuestionnaire)',
    defaultChecked: true,
    category: 'data',
  },
  // UI & Flow
  {
    value: 'onboarding',
    name: 'Onboarding & Consent',
    description: 'Welcome flow with consent (SpeziOnboarding + SpeziConsent)',
    defaultChecked: true,
    category: 'ui',
  },
  {
    value: 'account',
    name: 'Account',
    description: 'User authentication and profile (SpeziAccount)',
    defaultChecked: true,
    category: 'ui',
  },
  {
    value: 'contacts',
    name: 'Contacts',
    description: 'Provider contact cards (SpeziContact)',
    defaultChecked: false,
    category: 'ui',
  },
  {
    value: 'notifications',
    name: 'Notifications',
    description: 'Local and push notifications (SpeziNotifications)',
    defaultChecked: false,
    category: 'core',
  },
];

/**
 * Swift backend options.
 */
export const SWIFT_BACKENDS = [
  {
    value: 'local',
    name: 'Local (SwiftData)',
    description: 'On-device persistence — no server required',
  },
  {
    value: 'firebase',
    name: 'Firebase',
    description: 'Cloud storage with SpeziFirebase + Firestore',
  },
];
