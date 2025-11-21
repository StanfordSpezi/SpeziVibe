/**
 * @spezivibe/onboarding
 *
 * Reusable onboarding components and utilities for React Native applications.
 *
 * @example
 * ```tsx
 * import {
 *   useOnboardingStatus,
 *   PaginationDots,
 *   FeatureCard,
 *   ConsentCheckbox,
 *   OnboardingButton,
 *   ConsentService,
 * } from '@spezivibe/onboarding';
 * ```
 */

// Types
export * from './types';

// Constants
export {
  ONBOARDING_COMPLETED_KEY,
  CONSENT_KEY,
  DEFAULT_COLORS,
  INPUT_COLORS,
} from './constants';

// Hooks
export {
  useOnboardingStatus,
  markOnboardingCompleted,
  resetOnboardingStatus,
} from './hooks';

// Services
export { ConsentService } from './services';

// Components
export {
  PaginationDots,
  FeatureCard,
  ConsentCheckbox,
  OnboardingButton,
  NameInputSection,
} from './components';
