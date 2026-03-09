import { input, select, checkbox, confirm } from '@inquirer/prompts';
import pc from 'picocolors';
import type { BackendType, Feature, LLMProvider, ProjectOptions, SchedulerTask, ContactInfo, NotificationConfig } from './types.js';
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

  // Firebase configuration (Swift only — prompt for GoogleService-Info.plist values)
  let firebaseConfig: { apiKey: string; gcmSenderId: string; projectId: string; appId: string } | undefined;
  if (platform.id === 'swift' && backend === 'firebase') {
    const hasExisting = await confirm({
      message: '🔥 Do you have an existing Firebase project? (You\'ll need values from GoogleService-Info.plist)',
      default: true,
    });

    if (hasExisting) {
      const apiKey = await input({
        message: 'Firebase API Key (API_KEY from GoogleService-Info.plist):',
        validate: (v) => v.trim() ? true : 'API key is required',
      });
      const gcmSenderId = await input({
        message: 'GCM Sender ID (GCM_SENDER_ID):',
        validate: (v) => v.trim() ? true : 'GCM Sender ID is required',
      });
      const projectId = await input({
        message: 'Firebase Project ID (PROJECT_ID):',
        validate: (v) => v.trim() ? true : 'Project ID is required',
      });
      const appId = await input({
        message: 'Firebase App ID (GOOGLE_APP_ID):',
        validate: (v) => v.trim() ? true : 'App ID is required',
      });
      firebaseConfig = {
        apiKey: apiKey.trim(),
        gcmSenderId: gcmSenderId.trim(),
        projectId: projectId.trim(),
        appId: appId.trim(),
      };
    }
  }

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

  // Questionnaire selection (Swift only, when questionnaire feature is enabled)
  let questionnaires: string[] = [];
  let customQuestions: string[] = [];
  if (features.includes('questionnaire')) {
    const qChoice = await select<string>({
      message: 'How would you like to set up questionnaires?',
      choices: [
        { name: 'Validated instruments (PHQ-9, GAD-7, EQ-5D)', value: 'validated' },
        { name: 'Custom questions (I\'ll type them in)', value: 'custom' },
        { name: 'Both (validated + custom)', value: 'both' },
        { name: 'Use sample questionnaire (can customize later)', value: 'sample' },
      ],
    });

    if (qChoice === 'validated' || qChoice === 'both') {
      questionnaires = await checkbox<string>({
        message: 'Select validated questionnaires:',
        choices: [
          { name: 'PHQ-9 — Patient Health Questionnaire (depression)', value: 'phq-9', checked: true },
          { name: 'GAD-7 — Generalized Anxiety Disorder (anxiety)', value: 'gad-7' },
          { name: 'EQ-5D-5L — Health Status (quality of life)', value: 'eq-5d' },
        ],
      });
    }

    if (qChoice === 'custom' || qChoice === 'both') {
      const questionsInput = await input({
        message: 'Enter your questions (separate with | or newline):',
      });
      customQuestions = questionsInput
        .split(/[|\n]/)
        .map((q: string) => q.trim())
        .filter((q: string) => q.length > 0);
    }
  }

  // ── Color Palette (Swift only) ──
  let primaryColor: string | undefined;
  if (platform.id === 'swift') {
    const colorChoice = await select<string>({
      message: '🎨 Choose a primary color for your app:',
      choices: [
        { name: '🔴 Stanford Cardinal (#8C1515)', value: '#8C1515' },
        { name: '🔵 Ocean Blue (#0077B6)', value: '#0077B6' },
        { name: '🌲 Forest Green (#2D6A4F)', value: '#2D6A4F' },
        { name: '💜 Amethyst Purple (#7B2CBF)', value: '#7B2CBF' },
        { name: '🌅 Sunset Orange (#F77F00)', value: '#F77F00' },
        { name: '🩶 Slate (#475569)', value: '#475569' },
        { name: '✏️  Custom hex color', value: 'custom' },
      ],
    });

    if (colorChoice === 'custom') {
      primaryColor = await input({
        message: 'Enter your hex color (e.g., #FF5733):',
        validate: (value) => {
          if (/^#[0-9A-Fa-f]{6}$/.test(value.trim())) return true;
          return 'Please enter a valid hex color (e.g., #FF5733)';
        },
      });
      primaryColor = primaryColor.trim();
    } else {
      primaryColor = colorChoice;
    }
  }

  // ── App Icon (Swift only) ──
  let appIconPath: string | undefined;
  if (platform.id === 'swift') {
    const wantsIcon = await confirm({
      message: '🖼️  Do you have a custom app icon to use? (1024x1024 PNG recommended)',
      default: false,
    });
    if (wantsIcon) {
      appIconPath = await input({
        message: 'Path to your app icon file:',
        validate: (value) => {
          if (!value.trim()) return 'Please provide a file path';
          return true;
        },
      });
      appIconPath = appIconPath.trim();
    }
  }

  // ── HealthKit Data Types ──
  let healthKitTypes: string[] = [];
  if (features.includes('healthkit')) {
    healthKitTypes = await checkbox<string>({
      message: '🩺 What health data do you want to collect?',
      choices: [
        { name: 'Steps (stepCount)', value: 'stepCount', checked: true },
        { name: 'Heart Rate (heartRate)', value: 'heartRate', checked: true },
        { name: 'Blood Pressure — Systolic (bloodPressureSystolic)', value: 'bloodPressureSystolic' },
        { name: 'Blood Pressure — Diastolic (bloodPressureDiastolic)', value: 'bloodPressureDiastolic' },
        { name: 'Weight (bodyMass)', value: 'bodyMass' },
        { name: 'Height (height)', value: 'height' },
        { name: 'Blood Glucose (bloodGlucose)', value: 'bloodGlucose' },
        { name: 'Oxygen Saturation (oxygenSaturation)', value: 'oxygenSaturation' },
        { name: 'Sleep Analysis (sleepAnalysis)', value: 'sleepAnalysis' },
        { name: 'Active Energy (activeEnergyBurned)', value: 'activeEnergyBurned' },
        { name: 'Workouts (workoutType)', value: 'workoutType' },
      ],
    });
  }

  // ── Scheduler Tasks ──
  let schedulerTasks: SchedulerTask[] = [];
  if (features.includes('scheduler')) {
    let addMore = true;
    while (addMore) {
      const taskName = await input({
        message: '📋 Task name:',
        default: schedulerTasks.length === 0 ? 'Daily Check-In' : undefined,
        validate: (v) => v.trim() ? true : 'Task name is required',
      });

      const taskFrequency = await select<'daily' | 'weekly' | 'monthly'>({
        message: `How often should "${taskName.trim()}" run?`,
        choices: [
          { name: 'Daily', value: 'daily' },
          { name: 'Weekly', value: 'weekly' },
          { name: 'Monthly', value: 'monthly' },
        ],
      });

      const taskTime = await input({
        message: 'What time? (HH:MM, 24h format):',
        default: '09:00',
        validate: (v) => /^\d{2}:\d{2}$/.test(v.trim()) ? true : 'Use HH:MM format (e.g., 09:00)',
      });

      schedulerTasks.push({
        name: taskName.trim(),
        frequency: taskFrequency,
        time: taskTime.trim(),
      });

      addMore = await confirm({
        message: 'Add another scheduled task?',
        default: false,
      });
    }
  }

  // ── Contacts Builder ──
  let contacts: ContactInfo[] = [];
  if (features.includes('contacts')) {
    let addMore = true;
    while (addMore) {
      const cName = await input({
        message: '👤 Contact name:',
        validate: (v) => v.trim() ? true : 'Name is required',
      });

      const cTitle = await input({
        message: `Title for ${cName.trim()} (optional):`,
      });

      const cOrg = await input({
        message: `Organization (optional):`,
      });

      const cEmail = await input({
        message: `Email (optional):`,
      });

      const cPhone = await input({
        message: `Phone (optional):`,
      });

      contacts.push({
        name: cName.trim(),
        title: cTitle.trim() || undefined,
        org: cOrg.trim() || undefined,
        email: cEmail.trim() || undefined,
        phone: cPhone.trim() || undefined,
      });

      addMore = await confirm({
        message: 'Add another contact?',
        default: false,
      });
    }
  }

  // ── Notification Configuration ──
  let notificationConfig: NotificationConfig | undefined;
  if (features.includes('notifications')) {
    const permissionTiming = await select<'onboarding' | 'firstUse'>({
      message: '🔔 When should the app request notification permissions?',
      choices: [
        { name: 'During onboarding (recommended)', value: 'onboarding' },
        { name: 'On first use (lazy permission)', value: 'firstUse' },
      ],
    });

    let linkedTasks: string[] = [];
    if (schedulerTasks.length > 0) {
      linkedTasks = await checkbox<string>({
        message: 'Link notifications to which scheduled tasks?',
        choices: schedulerTasks.map((t) => ({
          name: t.name,
          value: t.name,
          checked: true,
        })),
      });
    }

    notificationConfig = {
      permissionTiming,
      linkedTasks: linkedTasks.length > 0 ? linkedTasks : undefined,
    };
  }

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
      questionnaires,
      customQuestions,
      primaryColor,
      appIconPath,
      healthKitTypes,
      schedulerTasks,
      contacts,
      notificationConfig,
      firebaseConfig,
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
