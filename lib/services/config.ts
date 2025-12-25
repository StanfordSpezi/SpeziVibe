import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { BackendConfig, BackendType } from './types';

/**
 * Backend configuration
 *
 * Configure via environment variables (.env file).
 *
 * To use:
 * 1. Copy .env.example to .env
 * 2. Fill in your Firebase credentials
 * 3. Restart dev server with: npx expo start --clear
 */

// Get config from expo-constants (loaded from .env via app.config.js)
const extra = Constants.expoConfig?.extra || {};

/**
 * Get the correct host for Firebase Emulator based on platform
 * - Android Emulator: 10.0.2.2 (special IP to reach host machine)
 * - iOS Simulator / Web: localhost
 */
function getEmulatorHost(): string {
  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }
  return 'localhost';
}

// Configure your Firebase credentials from environment
const FIREBASE_CONFIG = {
  apiKey: extra.firebase?.apiKey || '',
  authDomain: extra.firebase?.authDomain || '',
  projectId: extra.firebase?.projectId || '',
  storageBucket: extra.firebase?.storageBucket || '',
  messagingSenderId: extra.firebase?.messagingSenderId || '',
  appId: extra.firebase?.appId || '',
  // Use Firebase Emulator by default in development
  useEmulator: __DEV__,
  // Platform-specific emulator host configuration
  emulatorConfig: {
    authHost: getEmulatorHost(),
    authPort: 9099,
    firestoreHost: getEmulatorHost(),
    firestorePort: 8080,
  },
};

// Debug: Check if env vars are loaded
if (__DEV__) {
  console.log('[Config] Firebase configuration loaded:', {
    hasApiKey: !!FIREBASE_CONFIG.apiKey,
    hasProjectId: !!FIREBASE_CONFIG.projectId,
    hasAppId: !!FIREBASE_CONFIG.appId,
    backendType: extra.backendType,
    useEmulator: FIREBASE_CONFIG.useEmulator,
  });
  if (FIREBASE_CONFIG.useEmulator) {
    const host = FIREBASE_CONFIG.emulatorConfig.authHost;
    console.log(`[Config] 🔧 Using Firebase Emulator at ${host} (${Platform.OS})`);
  }
  if (!FIREBASE_CONFIG.apiKey) {
    console.warn('[Config] ⚠️ Firebase credentials not found! Make sure .env file exists and dev server was restarted.');
  }
}

// Determine if Firebase is configured
const isFirebaseConfigured =
  FIREBASE_CONFIG.apiKey &&
  FIREBASE_CONFIG.projectId &&
  FIREBASE_CONFIG.appId;

// Get backend type from environment or default to local
const backendType = (extra.backendType as BackendType) || 'local';

// Build the configuration
const DEFAULT_CONFIG: BackendConfig = {
  type: isFirebaseConfigured && backendType === 'firebase' ? 'firebase' : 'local',
  ...(isFirebaseConfigured && backendType === 'firebase' ? { firebase: FIREBASE_CONFIG } : {}),
};

/**
 * Get the backend configuration (synchronous)
 */
export function getBackendConfig(): BackendConfig {
  return DEFAULT_CONFIG;
}

/**
 * Get the backend configuration (async version for compatibility)
 * @deprecated Use getBackendConfig() instead (now synchronous)
 */
export async function getBackendConfigAsync(): Promise<BackendConfig> {
  return DEFAULT_CONFIG;
}

