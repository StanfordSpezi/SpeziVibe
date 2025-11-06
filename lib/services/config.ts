import Constants from 'expo-constants';
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

// Configure your Firebase credentials from environment
const FIREBASE_CONFIG = {
  apiKey: extra.firebase?.apiKey || '',
  authDomain: extra.firebase?.authDomain || '',
  projectId: extra.firebase?.projectId || '',
  storageBucket: extra.firebase?.storageBucket || '',
  messagingSenderId: extra.firebase?.messagingSenderId || '',
  appId: extra.firebase?.appId || '',
};

// Debug: Check if env vars are loaded
if (__DEV__) {
  console.log('[Config] Firebase configuration loaded:', {
    hasApiKey: !!FIREBASE_CONFIG.apiKey,
    hasProjectId: !!FIREBASE_CONFIG.projectId,
    hasAppId: !!FIREBASE_CONFIG.appId,
    backendType: extra.backendType,
  });
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
 * Get the backend configuration
 */
export async function getBackendConfig(): Promise<BackendConfig> {
  return DEFAULT_CONFIG;
}

