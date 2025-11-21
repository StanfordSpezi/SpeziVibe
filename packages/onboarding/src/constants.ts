/**
 * AsyncStorage key for tracking onboarding completion status
 */
export const ONBOARDING_COMPLETED_KEY = '@onboarding_completed';

/**
 * AsyncStorage key for storing consent data
 */
export const CONSENT_KEY = '@consent_data';

/**
 * Default brand colors for onboarding UI
 */
export const DEFAULT_COLORS = {
  primaryLight: '#8C1515',
  primaryDark: '#B83A4B',
  inactiveLight: '#ddd',
  inactiveDark: '#333',
} as const;

/**
 * Default input styling colors
 */
export const INPUT_COLORS = {
  backgroundLight: '#F5F5F5',
  backgroundDark: '#1D1D1D',
  borderLight: '#E0E0E0',
  borderDark: '#333',
  placeholderLight: '#999',
  placeholderDark: '#666',
} as const;
