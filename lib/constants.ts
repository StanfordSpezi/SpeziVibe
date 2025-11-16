/**
 * Shared application-wide constants
 */

import type { AccountConfiguration } from '@spezivibe/account';

/**
 * AsyncStorage key for tracking onboarding completion status
 */
export const ONBOARDING_COMPLETED_KEY = '@onboarding_completed';

/**
 * Account configuration for the application
 * Controls which profile fields to collect and which are required
 */
export const ACCOUNT_CONFIGURATION: AccountConfiguration = {
  collects: ['name', 'dateOfBirth', 'sex'],
  required: ['name'],
  allowsEditing: true,
};
