import { Task, Outcome, SchedulerState } from '../scheduler/types';
import { QuestionnaireResponse } from '../questionnaires/types';

/**
 * Common backend interface for data persistence
 * Firebase will implement this interface
 */
export interface BackendService {
  // Initialization
  initialize(): Promise<void>;

  // Authentication (for remote backends)
  isAuthenticated(): Promise<boolean>;
  login(credentials: any): Promise<void>;
  logout(): Promise<void>;

  // Scheduler data operations
  loadSchedulerState(): Promise<SchedulerState | null>;
  saveSchedulerState(state: SchedulerState): Promise<void>;

  // Task CRUD operations (optional - for real-time sync)
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
  // Firebase config
  firebase?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}
