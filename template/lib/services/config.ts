import { BackendConfig } from './types';

/**
 * Backend Configuration - Local Storage Only
 *
 * This configuration uses AsyncStorage for local data persistence.
 * Data is stored on-device and will be lost if the app is uninstalled.
 *
 * FOR CLOUD STORAGE (Firebase):
 * Add the Firebase feature when generating your app:
 *   npx create-spezivibe-app --features firebase
 *
 * The Firebase feature replaces this file with one that:
 * - Reads EXPO_PUBLIC_BACKEND_TYPE from environment
 * - Supports both Firebase Firestore and local AsyncStorage
 * - Validates Firebase configuration on startup
 */

const DEFAULT_CONFIG: BackendConfig = {
  type: 'local',
};

/**
 * Get the backend configuration
 *
 * Returns local storage config. For Firebase support,
 * regenerate with the Firebase feature enabled.
 */
export function getBackendConfig(): BackendConfig {
  return DEFAULT_CONFIG;
}

