// Type stubs for optional features - will be replaced by actual types if features are installed
type Task = { id: string; [key: string]: unknown };
type Outcome = { id: string; completedAt: Date; [key: string]: unknown };
type SchedulerState = { tasks: Task[]; outcomes: Outcome[] };
type QuestionnaireResponse = { id?: string; [key: string]: unknown };

/**
 * Common backend interface for data persistence
 * Authentication is handled separately by AccountService
 */
export interface BackendService {
  // Initialization
  initialize(): Promise<void>;

  // User ID management (for remote backends that need to know the current user)
  setUserId(userId: string | null): void;

  // Scheduler data operations
  loadSchedulerState(): Promise<SchedulerState | null>;
  saveSchedulerState(state: SchedulerState): Promise<void>;

  // Task CRUD operations
  createTask(task: Task): Promise<Task>;
  updateTask(task: Task): Promise<Task>;
  deleteTask(taskId: string): Promise<void>;
  getTasks(): Promise<Task[]>;

  // Outcome operations
  createOutcome(outcome: Outcome): Promise<Outcome>;
  getOutcomes(): Promise<Outcome[]>;

  // Questionnaire responses
  saveQuestionnaireResponse(response: QuestionnaireResponse): Promise<void>;
  getQuestionnaireResponses(taskId?: string): Promise<QuestionnaireResponse[]>;

  // Sync operations (for offline support)
  syncToRemote(): Promise<void>;
  syncFromRemote(): Promise<void>;
}

export type BackendType = 'local' | 'firebase';

export interface BackendConfig {
  type: BackendType;
  firebase?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}
