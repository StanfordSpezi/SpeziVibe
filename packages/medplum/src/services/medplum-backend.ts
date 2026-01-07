import type { MedplumClient } from '@medplum/core';
import type { Task as FhirTask, Observation, QuestionnaireResponse as FhirQuestionnaireResponse, Consent, Bundle, Resource } from '@medplum/fhirtypes';
import type { QuestionnaireResponse } from 'fhir/r4';
import { createLogger } from '@spezivibe/account';
import { createMedplumClient } from '../client';
import {
  taskToFhirTask,
  fhirTaskToTask,
  outcomeToObservation,
  observationToOutcome,
  consentDataToFhirConsent,
  fhirConsentToConsentData,
  generateFhirId,
  ConsentData,
  SPEZIVIBE_TASK_ID_SYSTEM,
  SPEZIVIBE_OUTCOME_ID_SYSTEM,
} from '../utils/fhir-mapping';
import type { MedplumConfig, BackendService, SchedulerState, Task, Outcome } from '../types';

/**
 * Default pagination settings
 */
const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_MAX_RESULTS = 1000;

/**
 * Medplum Backend Service
 *
 * Implements BackendService interface using Medplum FHIR server for data storage.
 *
 * Data is stored as FHIR resources:
 * - Tasks -> FHIR Task resources
 * - Outcomes -> FHIR Observation resources
 * - QuestionnaireResponses -> FHIR QuestionnaireResponse resources
 *
 * @example
 * ```typescript
 * const backend = new MedplumBackend({
 *   baseUrl: 'https://api.medplum.com/',
 *   clientId: 'your-client-id',
 *   projectId: 'your-project-id',
 * });
 *
 * await backend.initialize();
 * backend.setUserId('patient-id');
 *
 * const tasks = await backend.getTasks();
 * ```
 */
export class MedplumBackend implements BackendService {
  private medplum: MedplumClient;
  private patientId: string | null = null;
  private initialized = false;
  private logger = createLogger('MedplumBackend');

  constructor(private config: MedplumConfig) {
    this.medplum = createMedplumClient(config);
  }

  /**
   * Initialize the backend
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Medplum client is initialized in the constructor via createMedplumClient
    // Just mark as initialized
    this.initialized = true;
  }

  /**
   * Set the current user ID (Patient ID)
   *
   * This is called by the Standard when the user logs in/out.
   * The patient ID is used to scope all FHIR resource queries.
   */
  setUserId(userId: string | null): void {
    this.patientId = userId;
  }

  /**
   * Load the scheduler state from Medplum
   */
  async loadSchedulerState(): Promise<SchedulerState | null> {
    if (!this.patientId) {
      this.logger.debug('Cannot load scheduler state - no patient ID');
      return null;
    }

    try {
      const [tasks, outcomes] = await Promise.all([
        this.getTasks(),
        this.getOutcomes(),
      ]);

      return { tasks, outcomes };
    } catch (error) {
      this.logger.error('Failed to load scheduler state', error);
      return null;
    }
  }

  /**
   * Save the scheduler state to Medplum
   *
   * Note: This saves the entire state. For production, consider
   * implementing incremental sync for better performance.
   */
  async saveSchedulerState(state: SchedulerState): Promise<void> {
    if (!this.patientId) {
      return;
    }

    try {
      await this.reconcileSchedulerState(state);

      // Save tasks
      for (const task of state.tasks) {
        await this.createTask(task);
      }

      // Save outcomes
      for (const outcome of state.outcomes) {
        await this.createOutcome(outcome);
      }
    } catch (error) {
      this.logger.error('Failed to save scheduler state', error);
      throw error;
    }
  }

  /**
   * Create a new task
   */
  async createTask(task: Task): Promise<Task> {
    if (!this.patientId) {
      return task;
    }

    try {
      const fhirTask = taskToFhirTask(task, this.patientId);

      // Check if task already exists
      const existing = await this.searchTask(task.id);
      if (existing) {
        // Update existing task
        const updated = await this.medplum.updateResource({
          ...fhirTask,
          id: existing.id,
        });
        return fhirTaskToTask(updated);
      }

      // Create new task
      const created = await this.medplum.createResource(fhirTask);
      return fhirTaskToTask(created);
    } catch (error) {
      this.logger.error('Failed to create task', error);
      throw error;
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(task: Task): Promise<Task> {
    return this.createTask(task);
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    if (!this.patientId) {
      return;
    }

    try {
      const existing = await this.searchTask(taskId);
      if (existing?.id) {
        await this.medplum.deleteResource('Task', existing.id);
      }
    } catch (error) {
      this.logger.error('Failed to delete task', error);
      throw error;
    }
  }

  /**
   * Get all tasks for the current patient
   *
   * Uses paginated search to handle large result sets.
   */
  async getTasks(): Promise<Task[]> {
    if (!this.patientId) {
      return [];
    }

    try {
      const fhirTasks = await this.searchAllPages<FhirTask>('Task', {
        patient: `Patient/${this.patientId}`,
        status: 'requested',
      });

      return fhirTasks.map(fhirTaskToTask);
    } catch (error) {
      this.logger.error('Failed to get tasks', error);
      return [];
    }
  }

  /**
   * Create a new outcome
   */
  async createOutcome(outcome: Outcome): Promise<Outcome> {
    if (!this.patientId) {
      return outcome;
    }

    try {
      // Extract task ID from outcome ID if present (format: taskId_occurrenceIndex)
      const taskId = outcome.id.includes('_') ? outcome.id.split('_')[0] : undefined;
      const observation = outcomeToObservation(outcome, this.patientId, taskId);

      // Check if outcome already exists
      const existing = await this.searchOutcome(outcome.id);
      if (existing) {
        const updated = await this.medplum.updateResource({
          ...observation,
          id: existing.id,
        });
        return observationToOutcome(updated);
      }

      const created = await this.medplum.createResource(observation);
      return observationToOutcome(created);
    } catch (error) {
      this.logger.error('Failed to create outcome', error);
      throw error;
    }
  }

  /**
   * Get all outcomes for the current patient
   *
   * Uses paginated search to handle large result sets.
   */
  async getOutcomes(): Promise<Outcome[]> {
    if (!this.patientId) {
      return [];
    }

    try {
      const observations = await this.searchAllPages<Observation>('Observation', {
        subject: `Patient/${this.patientId}`,
        code: 'http://spezivibe.com/fhir/code/outcome|task-completion',
      });

      return observations.map(observationToOutcome);
    } catch (error) {
      this.logger.error('Failed to get outcomes', error);
      return [];
    }
  }

  /**
   * Save a questionnaire response
   */
  async saveQuestionnaireResponse(response: QuestionnaireResponse): Promise<void> {
    if (!this.patientId) {
      return;
    }

    try {
      const fhirResponse: FhirQuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        id: response.id || generateFhirId(),
        status: 'completed',
        subject: { reference: `Patient/${this.patientId}` },
        authored: response.authored || new Date().toISOString(),
        questionnaire: response.questionnaire,
        item: response.item as FhirQuestionnaireResponse['item'],
        basedOn: response.basedOn as FhirQuestionnaireResponse['basedOn'],
      };

      // Check if response already exists
      if (response.id) {
        try {
          await this.medplum.readResource('QuestionnaireResponse', response.id);
          await this.medplum.updateResource(fhirResponse);
          return;
        } catch {
          // Resource doesn't exist, create it
        }
      }

      await this.medplum.createResource(fhirResponse);
    } catch (error) {
      this.logger.error('Failed to save questionnaire response', error);
      throw error;
    }
  }

  /**
   * Get questionnaire responses for the current patient
   *
   * Uses paginated search to handle large result sets.
   *
   * @param taskId - Optional task ID to filter responses
   */
  async getQuestionnaireResponses(taskId?: string): Promise<QuestionnaireResponse[]> {
    if (!this.patientId) {
      return [];
    }

    try {
      const searchParams: Record<string, string> = {
        subject: `Patient/${this.patientId}`,
      };

      if (taskId) {
        searchParams['based-on:identifier'] = `${SPEZIVIBE_TASK_ID_SYSTEM}|${taskId}`;
      }

      const fhirResponses = await this.searchAllPages<FhirQuestionnaireResponse>(
        'QuestionnaireResponse',
        searchParams
      );

      // Cast Medplum FHIR types to standard fhir/r4 types
      return fhirResponses as unknown as QuestionnaireResponse[];
    } catch (error) {
      this.logger.error('Failed to get questionnaire responses', error);
      return [];
    }
  }

  /**
   * Sync local data to remote
   *
   * For Medplum, data is synced in real-time, so this is a no-op.
   */
  async syncToRemote(): Promise<void> {
    // Data is synced in real-time with Medplum
  }

  /**
   * Sync remote data to local
   *
   * For Medplum, data is synced in real-time, so this is a no-op.
   */
  async syncFromRemote(): Promise<void> {
    // Data is synced in real-time with Medplum
  }

  // ============================================================================
  // Consent Methods
  // ============================================================================

  /**
   * Save consent to Medplum
   *
   * Creates or updates a FHIR Consent resource for the current patient.
   */
  async saveConsent(consent: ConsentData): Promise<void> {
    if (!this.patientId) {
      this.logger.debug('Cannot save consent - no patient ID');
      return;
    }

    try {
      const fhirConsent = consentDataToFhirConsent(consent, this.patientId);

      // Check if consent already exists for this patient
      const existing = await this.getExistingConsent();
      if (existing?.id) {
        await this.medplum.updateResource({
          ...fhirConsent,
          id: existing.id,
        });
      } else {
        await this.medplum.createResource(fhirConsent);
      }
    } catch (error) {
      this.logger.error('Failed to save consent', error);
      throw error;
    }
  }

  /**
   * Get consent for the current patient
   *
   * @returns The consent data if found, null otherwise
   */
  async getConsent(): Promise<ConsentData | null> {
    if (!this.patientId) {
      return null;
    }

    try {
      const existing = await this.getExistingConsent();
      if (existing) {
        return fhirConsentToConsentData(existing);
      }
      return null;
    } catch (error) {
      this.logger.error('Failed to get consent', error);
      return null;
    }
  }

  /**
   * Check if the current patient has consented
   *
   * @returns true if the patient has an active consent, false otherwise
   */
  async hasConsented(): Promise<boolean> {
    const consent = await this.getConsent();
    return consent?.accepted ?? false;
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Get the configured page size for FHIR queries
   */
  private getPageSize(): number {
    return this.config.pagination?.pageSize ?? DEFAULT_PAGE_SIZE;
  }

  /**
   * Get the configured max results for FHIR queries
   */
  private getMaxResults(): number {
    return this.config.pagination?.maxResults ?? DEFAULT_MAX_RESULTS;
  }

  /**
   * Validate that a response is a FHIR Bundle
   */
  private isBundle(response: unknown): response is Bundle {
    return (
      typeof response === 'object' &&
      response !== null &&
      'resourceType' in response &&
      (response as { resourceType: unknown }).resourceType === 'Bundle'
    );
  }

  /**
   * Search with pagination to get all matching resources
   *
   * FHIR servers may return paginated results. This method follows
   * the 'next' links to fetch all pages up to a maximum limit.
   *
   * @param resourceType - The FHIR resource type to search
   * @param params - Search parameters
   * @param maxResults - Maximum total results to return (uses config default if not specified)
   */
  private async searchAllPages<T extends Resource>(
    resourceType: 'Task' | 'Observation' | 'QuestionnaireResponse' | 'Consent',
    params: Record<string, string>,
    maxResults?: number
  ): Promise<T[]> {
    const results: T[] = [];
    let bundle: Bundle | undefined;
    let nextUrl: string | undefined;
    const limit = maxResults ?? this.getMaxResults();

    // Add page size to params
    const searchParams = { ...params, _count: String(this.getPageSize()) };

    try {
      // Initial search
      bundle = await this.medplum.search(resourceType, searchParams);

      while (bundle) {
        // Extract resources from bundle
        if (bundle.entry) {
          for (const entry of bundle.entry) {
            if (entry.resource?.resourceType === resourceType) {
              results.push(entry.resource as T);
              if (results.length >= limit) {
                return results;
              }
            }
          }
        }

        // Check for next page
        nextUrl = bundle.link?.find((l) => l.relation === 'next')?.url;
        if (!nextUrl) {
          break;
        }

        // Fetch next page using the URL directly
        // Note: Medplum client handles authentication for these requests
        const response: unknown = await this.medplum.get(nextUrl);
        if (!this.isBundle(response)) {
          this.logger.error('Invalid bundle response during pagination');
          break;
        }
        bundle = response;
      }
    } catch (error) {
      this.logger.error(`Paginated search for ${resourceType} failed`, error);
    }

    return results;
  }

  /**
   * Get existing consent for the current patient
   */
  private async getExistingConsent(): Promise<Consent | null> {
    if (!this.patientId) {
      return null;
    }

    try {
      const bundle = await this.medplum.search('Consent', {
        patient: `Patient/${this.patientId}`,
        _sort: '-dateTime',
        _count: '1',
      });

      if (bundle.entry && bundle.entry.length > 0) {
        return bundle.entry[0].resource as Consent;
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Search for a task by its original ID
   */
  private async searchTask(taskId: string): Promise<FhirTask | null> {
    try {
      let bundle = await this.medplum.search('Task', {
        patient: `Patient/${this.patientId}`,
        identifier: `${SPEZIVIBE_TASK_ID_SYSTEM}|${taskId}`,
      });

      if (bundle.entry && bundle.entry.length > 0) {
        return bundle.entry[0].resource as FhirTask;
      }

      bundle = await this.medplum.search('Task', {
        patient: `Patient/${this.patientId}`,
        identifier: taskId,
      });

      if (bundle.entry && bundle.entry.length > 0) {
        return bundle.entry[0].resource as FhirTask;
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Search for an outcome by its original ID
   */
  private async searchOutcome(outcomeId: string): Promise<Observation | null> {
    try {
      let bundle = await this.medplum.search('Observation', {
        subject: `Patient/${this.patientId}`,
        identifier: `${SPEZIVIBE_OUTCOME_ID_SYSTEM}|${outcomeId}`,
      });

      if (bundle.entry && bundle.entry.length > 0) {
        return bundle.entry[0].resource as Observation;
      }

      bundle = await this.medplum.search('Observation', {
        subject: `Patient/${this.patientId}`,
        identifier: outcomeId,
      });

      if (bundle.entry && bundle.entry.length > 0) {
        return bundle.entry[0].resource as Observation;
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Reconcile remote scheduler resources with the provided state.
   * Deletes tasks/outcomes that no longer exist locally.
   */
  private async reconcileSchedulerState(state: SchedulerState): Promise<void> {
    if (!this.patientId) {
      return;
    }

    try {
      const [existingTasks, existingOutcomes] = await Promise.all([
        this.searchAllPages<FhirTask>('Task', {
          patient: `Patient/${this.patientId}`,
          status: 'requested',
        }),
        this.searchAllPages<Observation>('Observation', {
          subject: `Patient/${this.patientId}`,
          code: 'http://spezivibe.com/fhir/code/outcome|task-completion',
        }),
      ]);

      const desiredTaskIds = new Set(state.tasks.map((task) => task.id));
      const desiredOutcomeIds = new Set(state.outcomes.map((outcome) => outcome.id));

      for (const task of existingTasks) {
        const taskId =
          task.identifier?.find((id) => id.system === SPEZIVIBE_TASK_ID_SYSTEM)?.value ??
          task.identifier?.find((id) => id.value)?.value;
        if (taskId && !desiredTaskIds.has(taskId) && task.id) {
          await this.medplum.deleteResource('Task', task.id);
        }
      }

      for (const observation of existingOutcomes) {
        const outcomeId =
          observation.identifier?.find((id) => id.system === SPEZIVIBE_OUTCOME_ID_SYSTEM)?.value ??
          observation.identifier?.find((id) => id.value)?.value;
        if (outcomeId && !desiredOutcomeIds.has(outcomeId) && observation.id) {
          await this.medplum.deleteResource('Observation', observation.id);
        }
      }
    } catch (error) {
      this.logger.error('Failed to reconcile scheduler state', error);
    }
  }
}
