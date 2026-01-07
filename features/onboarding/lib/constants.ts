/**
 * Shared application-wide constants
 */

import type { AccountConfiguration } from '@spezivibe/account';

// Re-export onboarding constants from the package
export { ONBOARDING_COMPLETED_KEY, CONSENT_KEY } from '@spezivibe/onboarding';

/**
 * FHIR identifier system for task IDs
 */
export const SPEZIVIBE_TASK_ID_SYSTEM = 'http://spezivibe.com/fhir/identifier/task-id';

/**
 * Account configuration for the application
 * Controls which profile fields to collect and which are required
 */
export const ACCOUNT_CONFIGURATION: AccountConfiguration = {
  collects: ['name'],
  required: ['name'],
  allowsEditing: true,
};
