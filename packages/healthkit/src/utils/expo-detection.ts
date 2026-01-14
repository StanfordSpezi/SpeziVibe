/**
 * Expo Go Detection Utility
 *
 * Detects whether the app is running in Expo Go (managed workflow)
 * where native modules like HealthKit are not available.
 */

import Constants from 'expo-constants';

/**
 * Check if running in Expo Go
 *
 * HealthKit requires a custom dev client and won't work in Expo Go.
 * Use this to show a helpful fallback UI.
 */
export function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

/**
 * Check if running in a standalone/dev client build
 */
export function isStandalone(): boolean {
  // appOwnership is 'expo' in Expo Go, null in standalone/dev client builds
  return Constants.appOwnership !== 'expo';
}

/**
 * Get a user-friendly message about Expo Go limitations
 */
export function getExpoGoMessage(): string {
  return 'HealthKit requires a custom development build and is not available in Expo Go. Run `npx expo run:ios` to build a development client.';
}
