import type { QuestionnaireResponse } from 'fhir/r4';

// ============================================================================
// Scheduler Types (defined internally to avoid @spezivibe/scheduler dependency)
// These types mirror the scheduler package types for compatibility
// ============================================================================

/**
 * Recurrence rules for scheduled tasks
 */
export type RecurrenceRule =
  | { type: 'daily'; hour: number; minute: number }
  | { type: 'weekly'; weekday: number; hour: number; minute: number }
  | { type: 'monthly'; day: number; hour: number; minute: number }
  | { type: 'once'; date: Date };

/**
 * Schedule definition for a task
 */
export interface Schedule {
  startDate: Date;
  endDate?: Date;
  recurrence: RecurrenceRule;
}

/**
 * Task categories for classification
 */
export type TaskCategory = 'questionnaire' | 'task' | 'reminder' | 'measurement';

/**
 * Policy controlling when a task can be completed
 */
export type AllowedCompletionPolicy =
  | { type: 'anytime' }
  | { type: 'window'; start: number; end: number };

/**
 * A scheduled task
 */
export interface Task {
  id: string;
  title: string;
  instructions: string;
  category: TaskCategory;
  schedule: Schedule;
  completionPolicy: AllowedCompletionPolicy;
  questionnaireId?: string;
  createdAt: Date;
}

/**
 * The result of completing a task occurrence
 */
export interface Outcome {
  id: string;
  completedAt: Date;
  data?: Record<string, unknown>;
}

// ============================================================================
// Medplum Configuration Types
// ============================================================================

/**
 * Configuration for Medplum client
 */
export interface MedplumConfig {
  /** Base URL of the Medplum server (e.g., https://api.medplum.com/) */
  baseUrl: string;

  /** OAuth2 client ID */
  clientId?: string;

  /** Medplum project ID */
  projectId?: string;

  /**
   * Pagination settings for FHIR queries
   */
  pagination?: {
    /** Number of results per page (default: 100) */
    pageSize?: number;
    /** Maximum total results to fetch (default: 1000) */
    maxResults?: number;
  };
}

/**
 * Extended backend config including Medplum
 */
export interface MedplumBackendConfig {
  type: 'medplum';
  medplum: MedplumConfig;
}

/**
 * Scheduler state containing tasks and outcomes
 */
export interface SchedulerState {
  tasks: Task[];
  outcomes: Outcome[];
}

/**
 * Backend service interface for data persistence
 *
 * This interface defines the contract for backend implementations.
 * MedplumBackend implements this interface using FHIR resources.
 *
 * Note: This service only supports Patient profiles. Practitioner and
 * RelatedPerson profiles are not currently supported.
 */
export interface BackendService {
  /** Initialize the backend (authenticate, set up listeners, etc.) */
  initialize(): Promise<void>;

  /** Set the current user ID for data operations */
  setUserId(userId: string | null): void;

  /** Load scheduler state (tasks and outcomes) */
  loadSchedulerState(): Promise<SchedulerState | null>;

  /** Save scheduler state */
  saveSchedulerState(state: SchedulerState): Promise<void>;

  /** Create a new task */
  createTask(task: Task): Promise<Task>;

  /** Update an existing task */
  updateTask(task: Task): Promise<Task>;

  /** Delete a task */
  deleteTask(taskId: string): Promise<void>;

  /** Get all tasks for the current user */
  getTasks(): Promise<Task[]>;

  /** Create a new outcome (task completion record) */
  createOutcome(outcome: Outcome): Promise<Outcome>;

  /** Get all outcomes for the current user */
  getOutcomes(): Promise<Outcome[]>;

  /** Save a questionnaire response */
  saveQuestionnaireResponse(response: QuestionnaireResponse): Promise<void>;

  /** Get questionnaire responses, optionally filtered by task ID */
  getQuestionnaireResponses(taskId?: string): Promise<QuestionnaireResponse[]>;

  /** Sync local data to remote server */
  syncToRemote(): Promise<void>;

  /** Sync remote data to local storage */
  syncFromRemote(): Promise<void>;
}
