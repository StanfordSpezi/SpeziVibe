import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { BackendConfig, BackendType } from './types';

/**
 * Backend configuration with Firebase support
 *
 * Configure via environment variables (.env file).
 */

const extra = Constants.expoConfig?.extra || {};

/**
 * Get the correct host for Firebase Emulator based on platform
 */
function getEmulatorHost(): string {
  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }
  return 'localhost';
}

/**
 * Check if we should use Firebase Emulator
 * Emulator mode is used when:
 * - In development mode (__DEV__) AND no API key is configured
 */
const shouldUseEmulator = __DEV__ && !extra.firebase?.apiKey;

const FIREBASE_CONFIG = {
  // Use demo values for emulator mode, real values for production
  apiKey: extra.firebase?.apiKey || (shouldUseEmulator ? 'demo-api-key' : ''),
  authDomain: extra.firebase?.authDomain || (shouldUseEmulator ? 'demo-project.firebaseapp.com' : ''),
  projectId: extra.firebase?.projectId || (shouldUseEmulator ? 'demo-project' : ''),
  storageBucket: extra.firebase?.storageBucket || '',
  messagingSenderId: extra.firebase?.messagingSenderId || '',
  appId: extra.firebase?.appId || (shouldUseEmulator ? 'demo-app-id' : ''),
  useEmulator: shouldUseEmulator,
  emulatorConfig: {
    authHost: getEmulatorHost(),
    authPort: 9099,
    firestoreHost: getEmulatorHost(),
    firestorePort: 8080,
  },
};

if (__DEV__) {
  if (shouldUseEmulator) {
    console.log('[Config] Firebase Emulator mode - no API key configured');
    console.log('[Config] Make sure Firebase Emulator is running: firebase emulators:start');
  } else {
    console.log('[Config] Firebase production mode');
  }
}

const backendType = (extra.backendType as BackendType) || 'local';

/**
 * Check if Firebase is properly configured for production use
 * Skipped in emulator mode since demo values are used
 */
function validateFirebaseConfig(): { isValid: boolean; missingFields: string[] } {
  // Emulator mode uses demo values, no validation needed
  if (shouldUseEmulator) {
    return { isValid: true, missingFields: [] };
  }

  const missingFields: string[] = [];

  if (!FIREBASE_CONFIG.apiKey) missingFields.push('FIREBASE_API_KEY');
  if (!FIREBASE_CONFIG.projectId) missingFields.push('FIREBASE_PROJECT_ID');
  if (!FIREBASE_CONFIG.appId) missingFields.push('FIREBASE_APP_ID');

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Get the backend configuration
 *
 * In development mode without credentials, automatically uses Firebase Emulator.
 * In production, throws an error if Firebase credentials are missing.
 */
export function getBackendConfig(): BackendConfig {
  if (backendType === 'firebase') {
    const validation = validateFirebaseConfig();

    if (!validation.isValid) {
      throw new Error(
        `Firebase backend is selected but not properly configured.\n\n` +
        `Missing environment variables:\n` +
        validation.missingFields.map(field => `  - ${field}`).join('\n') +
        `\n\nPlease add these to your .env file and restart the app.\n` +
        `See .env.example for the required format.`
      );
    }

    return {
      type: 'firebase',
      firebase: FIREBASE_CONFIG,
    };
  }

  return { type: 'local' };
}
