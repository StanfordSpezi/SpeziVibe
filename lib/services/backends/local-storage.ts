import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackendService } from '../types';
import { Task, Outcome, SchedulerState } from '../../scheduler/types';
import { QuestionnaireResponse } from '../../questionnaires/types';

const STORAGE_KEYS = {
  SCHEDULER: '@scheduler_state',
  RESPONSES: '@questionnaire_responses',
};

/**
 * Local AsyncStorage backend - existing implementation
 * This is the default backend that stores all data locally on the device
 */
export class LocalStorageBackend implements BackendService {
  async initialize(): Promise<void> {
    // No initialization needed for AsyncStorage
  }

  async isAuthenticated(): Promise<boolean> {
    return true; // Always authenticated for local storage
  }

  async login(): Promise<void> {
    throw new Error('Authentication not required for local storage');
  }

  async logout(): Promise<void> {
    // No-op for local storage
  }

  async loadSchedulerState(): Promise<SchedulerState | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULER);
      if (!data) return null;

      const parsed = JSON.parse(data);
      // Deserialize dates
      return {
        tasks: parsed.tasks.map((task: any) => this.deserializeTask(task)),
        outcomes: parsed.outcomes.map((outcome: any) => ({
          ...outcome,
          completedAt: new Date(outcome.completedAt),
        })),
      };
    } catch (error) {
      console.error('Failed to load scheduler state:', error);
      return null;
    }
  }

  async saveSchedulerState(state: SchedulerState): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SCHEDULER, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save scheduler state:', error);
      throw error;
    }
  }

  async createTask(task: Task): Promise<Task> {
    const state = (await this.loadSchedulerState()) || { tasks: [], outcomes: [] };
    state.tasks.push(task);
    await this.saveSchedulerState(state);
    return task;
  }

  async updateTask(task: Task): Promise<Task> {
    const state = (await this.loadSchedulerState()) || { tasks: [], outcomes: [] };
    const index = state.tasks.findIndex((t) => t.id === task.id);
    if (index >= 0) {
      state.tasks[index] = task;
      await this.saveSchedulerState(state);
    }
    return task;
  }

  async deleteTask(taskId: string): Promise<void> {
    const state = (await this.loadSchedulerState()) || { tasks: [], outcomes: [] };
    state.tasks = state.tasks.filter((t) => t.id !== taskId);
    state.outcomes = state.outcomes.filter((o) => !o.id.startsWith(taskId));
    await this.saveSchedulerState(state);
  }

  async getTasks(): Promise<Task[]> {
    const state = await this.loadSchedulerState();
    return state?.tasks || [];
  }

  async createOutcome(outcome: Outcome): Promise<Outcome> {
    const state = (await this.loadSchedulerState()) || { tasks: [], outcomes: [] };
    state.outcomes.push(outcome);
    await this.saveSchedulerState(state);
    return outcome;
  }

  async getOutcomes(): Promise<Outcome[]> {
    const state = await this.loadSchedulerState();
    return state?.outcomes || [];
  }

  async saveQuestionnaireResponse(response: QuestionnaireResponse): Promise<void> {
    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEYS.RESPONSES);
      const responses: QuestionnaireResponse[] = existing ? JSON.parse(existing) : [];
      responses.push(response);
      await AsyncStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));
    } catch (error) {
      console.error('Failed to save questionnaire response:', error);
      throw error;
    }
  }

  async getQuestionnaireResponses(taskId?: string): Promise<QuestionnaireResponse[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RESPONSES);
      if (!data) return [];

      const responses: QuestionnaireResponse[] = JSON.parse(data);

      // Deserialize dates
      const deserialized = responses.map((r) => ({
        ...r,
        completedAt: new Date(r.completedAt),
      }));

      return taskId ? deserialized.filter((r) => r.taskId === taskId) : deserialized;
    } catch (error) {
      console.error('Failed to load questionnaire responses:', error);
      return [];
    }
  }

  async syncToRemote(): Promise<void> {
    // No-op for local storage
  }

  async syncFromRemote(): Promise<void> {
    // No-op for local storage
  }

  private deserializeTask(task: any): Task {
    return {
      ...task,
      createdAt: new Date(task.createdAt),
      effectiveFrom: new Date(task.effectiveFrom),
      schedule: {
        ...task.schedule,
        startDate: new Date(task.schedule.startDate),
        endDate: task.schedule.endDate ? new Date(task.schedule.endDate) : undefined,
        recurrence:
          task.schedule.recurrence.type === 'once'
            ? {
                ...task.schedule.recurrence,
                date: new Date(task.schedule.recurrence.date),
              }
            : task.schedule.recurrence,
      },
    };
  }
}
