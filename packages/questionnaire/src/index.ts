// Types
export * from './types';

// Components
export { QuestionnaireForm } from './components/QuestionnaireForm';
export { QuestionnaireErrorBoundary } from './components/ErrorBoundary';
export { QuestionRenderer } from './components/QuestionRenderer';
export * from './components/questions';

// Builders (FHIR convenience helpers)
export { QuestionnaireBuilder, enableWhen } from './builders/QuestionnaireBuilder';

// EnableWhen evaluation (conditional logic)
export { EnableWhenEvaluator } from './enablewhen/EnableWhenEvaluator';

// Validation
export { createValidationSchema } from './validation/schema-builder';

// Theme
export { defaultLightTheme, defaultDarkTheme, mergeTheme } from './theme/default-theme';

// Utils
export { triggerHaptic } from './utils/haptics';

// Note: Storage is NOT provided by this module.
// Following the Spezi standard, consuming applications should handle
// persistence of QuestionnaireResponses in the onResult callback.
