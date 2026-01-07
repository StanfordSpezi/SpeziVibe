import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BackendService, SchedulerState, Task, Outcome } from '@spezivibe/medplum';
import type { QuestionnaireResponse } from 'fhir/r4';

const STORAGE_KEYS = {
  SCHEDULER: '@scheduler_state',
  RESPONSES: '@questionnaire_responses',
};

/**
 * Helper to deserialize a task from JSON
 */
function deserializeTask(task: any): Task {
  return {
    ...task,
    schedule: {
      ...task.schedule,
      startDate: new Date(task.schedule.startDate),
      endDate: task.schedule.endDate ? new Date(task.schedule.endDate) : undefined,
      recurrence: task.schedule.recurrence?.type === 'once' && task.schedule.recurrence.date
        ? { ...task.schedule.recurrence, date: new Date(task.schedule.recurrence.date) }
        : task.schedule.recurrence,
    },
    createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
  };
}

/**
 * Local AsyncStorage backend
 * Stores all data locally on the device
 * No authentication required - user ID management is a no-op
 */
export class LocalStorageBackend implements BackendService {
  async initialize(): Promise<void> {
    // No initialization needed for AsyncStorage
  }

  setUserId(_userId: string | null): void {
    // No-op for local storage - doesn't need user ID
  }

  async loadSchedulerState(): Promise<SchedulerState | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULER);
      if (!data) return null;

      const parsed = JSON.parse(data);
      // Deserialize dates
      return {
        tasks: parsed.tasks.map((task: any) => deserializeTask(task)),
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

      // Filter by task ID if provided (look for basedOn reference)
      if (taskId) {
        return responses.filter((r) => {
          const basedOn = r.basedOn?.[0]?.identifier;
          return basedOn?.value === taskId;
        });
      }

      return responses;
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
}
