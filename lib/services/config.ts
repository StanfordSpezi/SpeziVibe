import { BackendConfig, BackendType } from './types';

/**
 * Backend configuration
 *
 * Configure via environment variables (.env file) or directly in code below.
 *
 * To use environment variables:
 * 1. Copy .env.example to .env
 * 2. Fill in your Firebase credentials
 * 3. Set BACKEND_TYPE to 'firebase' or 'local'
 *
 * To configure in code:
 * 1. Uncomment and fill in the FIREBASE_CONFIG object below
 * 2. Set DEFAULT_CONFIG type to 'firebase'
 */

// Configure your Firebase credentials here (or use environment variables)
const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

// Determine if Firebase is configured
const isFirebaseConfigured =
  FIREBASE_CONFIG.apiKey &&
  FIREBASE_CONFIG.projectId &&
  FIREBASE_CONFIG.appId;

// Get backend type from environment or default to local
const backendType = (process.env.EXPO_PUBLIC_BACKEND_TYPE as BackendType) || 'local';

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

