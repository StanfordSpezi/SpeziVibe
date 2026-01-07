import Constants from 'expo-constants';
import { BackendConfig, BackendType } from './types';

/**
 * Backend configuration with Medplum FHIR support
 *
 * Configure via environment variables (.env file).
 */

const extra = Constants.expoConfig?.extra || {};

const MEDPLUM_CONFIG = {
  baseUrl: extra.medplum?.baseUrl || '',
  clientId: extra.medplum?.clientId || '',
  projectId: extra.medplum?.projectId || '',
};

const backendType = (extra.backendType as BackendType) || 'local';

/**
 * Check if Medplum is properly configured
 */
function validateMedplumConfig(): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  if (!MEDPLUM_CONFIG.baseUrl) missingFields.push('MEDPLUM_BASE_URL');

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Get the backend configuration
 *
 * Throws an error if Medplum credentials are missing when medplum backend is selected.
 */
export function getBackendConfig(): BackendConfig {
  if (backendType === 'medplum') {
    const validation = validateMedplumConfig();

    if (!validation.isValid) {
      throw new Error(
        `Medplum backend is selected but not properly configured.\n\n` +
        `Missing environment variables:\n` +
        validation.missingFields.map(field => `  - EXPO_PUBLIC_${field}`).join('\n') +
        `\n\nPlease add these to your .env file and restart the app.\n` +
        `See .env.example for the required format.`
      );
    }

    return {
      type: 'medplum',
      medplum: MEDPLUM_CONFIG,
    };
  }

  return { type: 'local' };
}
