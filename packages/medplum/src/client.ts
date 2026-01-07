import { MedplumClient } from '@medplum/core';
import { ExpoClientStorage, polyfillMedplumWebAPIs } from '@medplum/expo-polyfills';
import type { MedplumConfig } from './types';

// Apply polyfills for React Native environment
polyfillMedplumWebAPIs();

// Singleton client instance
let medplumClient: MedplumClient | null = null;
let currentConfig: MedplumConfig | null = null;

/**
 * Create or get the MedplumClient instance
 *
 * Uses ExpoClientStorage for React Native compatible persistence.
 * Polyfills are applied automatically for missing Web APIs.
 *
 * Note: projectId is stored in the config and passed during login/registration
 * as it's not part of MedplumClientOptions.
 *
 * @param config - Medplum configuration
 * @returns MedplumClient instance
 */
export function createMedplumClient(config: MedplumConfig): MedplumClient {
  if (medplumClient) {
    return medplumClient;
  }

  currentConfig = config;

  medplumClient = new MedplumClient({
    baseUrl: config.baseUrl,
    clientId: config.clientId,
    storage: new ExpoClientStorage(),
  });

  return medplumClient;
}

/**
 * Get the current Medplum configuration
 */
export function getMedplumConfig(): MedplumConfig | null {
  return currentConfig;
}

/**
 * Get the existing MedplumClient instance
 *
 * @throws Error if client has not been created yet
 */
export function getMedplumClient(): MedplumClient {
  if (!medplumClient) {
    throw new Error('MedplumClient has not been initialized. Call createMedplumClient first.');
  }
  return medplumClient;
}

/**
 * Reset the MedplumClient instance
 * Useful for testing or when switching accounts
 */
export function resetMedplumClient(): void {
  medplumClient = null;
}
