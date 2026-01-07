/**
 * @spezivibe/medplum
 *
 * Medplum FHIR integration for SpeziVibe applications.
 * Provides Medplum-backed implementations of account management and backend services.
 *
 * @example
 * ```tsx
 * import { MedplumAccountService, MedplumBackend } from '@spezivibe/medplum';
 * import { AccountProvider } from '@spezivibe/account';
 *
 * const medplumConfig = {
 *   baseUrl: 'https://api.medplum.com/',
 *   clientId: 'your-client-id',
 *   projectId: 'your-project-id',
 * };
 *
 * const accountService = new MedplumAccountService(medplumConfig);
 * const backend = new MedplumBackend(medplumConfig);
 *
 * function App() {
 *   return (
 *     <AccountProvider accountService={accountService}>
 *       <YourApp />
 *     </AccountProvider>
 *   );
 * }
 * ```
 */

// Medplum Account Service
export { MedplumAccountService } from './services/medplum-account-service';

// Medplum Backend Service
export { MedplumBackend } from './services/medplum-backend';

// Error utilities
export { mapMedplumError, notAuthenticatedError, profileUpdateError } from './utils/errors';

// Types
export type {
  MedplumConfig,
  MedplumBackendConfig,
  BackendService,
  SchedulerState,
  Task,
  Outcome,
  Schedule,
  RecurrenceRule,
  TaskCategory,
  AllowedCompletionPolicy,
} from './types';

// FHIR Mapping utilities (for advanced use cases)
export {
  patientToUser,
  userToPatient,
  taskToFhirTask,
  fhirTaskToTask,
  outcomeToObservation,
  observationToOutcome,
  consentDataToFhirConsent,
  fhirConsentToConsentData,
  generateFhirId,
  type ConsentData,
} from './utils/fhir-mapping';

/**
 * @internal
 * Low-level client utilities. Most users should use MedplumAccountService
 * and MedplumBackend instead of accessing the client directly.
 */
export { createMedplumClient, getMedplumClient, getMedplumConfig, resetMedplumClient } from './client';
