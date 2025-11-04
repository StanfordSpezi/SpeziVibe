import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Event, Outcome, SchedulerState, Schedule, Occurrence } from './types';
import { calculateOccurrences, isAllowedToComplete } from './utils';

const STORAGE_KEY = '@scheduler_state';

/**
 * Main Scheduler class for managing tasks and events
 * Based on Stanford Spezi SpeziScheduler
 */
export class Scheduler {
  private state: SchedulerState = {
    tasks: [],
    outcomes: [],
  };

  private listeners: Set<() => void> = new Set();

  async initialize(): Promise<void> {
    await this.loadState();
  }

  private async loadState(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Deserialize dates
        this.state = {
          tasks: parsed.tasks.map((task: any) => ({
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
          })),
          outcomes: parsed.outcomes.map((outcome: any) => ({
            ...outcome,
            completedAt: new Date(outcome.completedAt),
          })),
        };
      }
    } catch (error) {
      console.error('Failed to load scheduler state:', error);
    }
  }

  private async saveState(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save scheduler state:', error);
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Create or update a task
   */
  async createOrUpdateTask(task: Omit<Task, 'createdAt' | 'effectiveFrom'>): Promise<Task> {
    const existingIndex = this.state.tasks.findIndex((t) => t.id === task.id);
    const now = new Date();

    const newTask: Task = {
      ...task,
      createdAt: existingIndex >= 0 ? this.state.tasks[existingIndex].createdAt : now,
      effectiveFrom: now,
    };

    if (existingIndex >= 0) {
      this.state.tasks[existingIndex] = newTask;
    } else {
      this.state.tasks.push(newTask);
    }

    await this.saveState();
    return newTask;
  }

  /**
   * Get all tasks
   */
  getTasks(): Task[] {
    return [...this.state.tasks];
  }

  /**
   * Get a specific task by ID
   */
  getTask(id: string): Task | undefined {
    return this.state.tasks.find((task) => task.id === id);
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    this.state.tasks = this.state.tasks.filter((task) => task.id !== id);
    // Also remove outcomes for this task
    this.state.outcomes = this.state.outcomes.filter((outcome) => !outcome.id.startsWith(id));
    await this.saveState();
  }

  /**
   * Clear all tasks and outcomes (useful for resetting)
   */
  async clearAll(): Promise<void> {
    this.state.tasks = [];
    this.state.outcomes = [];
    await this.saveState();
  }

  /**
   * Query events for tasks within a date range
   */
  queryEvents(startDate: Date, endDate: Date): Event[] {
    const events: Event[] = [];

    for (const task of this.state.tasks) {
      const occurrences = calculateOccurrences(task.schedule, startDate, endDate);

      for (const occurrence of occurrences) {
        const outcomeId = this.getOutcomeId(task.id, occurrence);
        const outcome = this.state.outcomes.find((o) => o.id === outcomeId);

        events.push({
          task,
          occurrence,
          outcome,
        });
      }
    }

    // Sort by scheduled date
    events.sort((a, b) => a.occurrence.scheduledDate.getTime() - b.occurrence.scheduledDate.getTime());

    return events;
  }

  /**
   * Complete an event
   */
  async completeEvent(
    event: Event,
    data?: Record<string, any>,
    ignoreCompletionPolicy: boolean = false
  ): Promise<Outcome> {
    // Check if already completed
    if (event.outcome) {
      return event.outcome;
    }

    // Check completion policy
    if (!ignoreCompletionPolicy && !isAllowedToComplete(event)) {
      throw new Error('Event cannot be completed at this time due to completion policy');
    }

    const outcome: Outcome = {
      id: this.getOutcomeId(event.task.id, event.occurrence),
      completedAt: new Date(),
      data,
    };

    this.state.outcomes.push(outcome);
    await this.saveState();

    return outcome;
  }

  /**
   * Uncomplete an event (remove its outcome)
   */
  async uncompleteEvent(event: Event): Promise<void> {
    if (!event.outcome) {
      return;
    }

    this.state.outcomes = this.state.outcomes.filter((o) => o.id !== event.outcome!.id);
    await this.saveState();
  }

  /**
   * Get a specific event by task ID and occurrence index
   */
  getEventById(taskId: string, occurrenceIndex: number): Event | undefined {
    const task = this.getTask(taskId);
    if (!task) return undefined;

    // Get all occurrences for this task
    const now = new Date();
    const startDate = new Date(task.schedule.startDate);
    const endDate = task.schedule.endDate || new Date(now.getFullYear() + 1, 11, 31);
    const occurrences = calculateOccurrences(task.schedule, startDate, endDate);

    const occurrence = occurrences.find((occ) => occ.index === occurrenceIndex);
    if (!occurrence) return undefined;

    const outcomeId = this.getOutcomeId(taskId, occurrence);
    const outcome = this.state.outcomes.find((o) => o.id === outcomeId);

    return {
      task,
      occurrence,
      outcome,
    };
  }

  /**
   * Get all outcomes
   */
  getOutcomes(): Outcome[] {
    return [...this.state.outcomes];
  }

  /**
   * Get completion statistics for a date range
   */
  getCompletionStats(startDate: Date, endDate: Date): {
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  } {
    const events = this.queryEvents(startDate, endDate);
    const completed = events.filter((e) => e.outcome).length;
    const total = events.length;
    const pending = total - completed;

    return {
      total,
      completed,
      pending,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }

  private getOutcomeId(taskId: string, occurrence: Occurrence): string {
    return `${taskId}-${occurrence.index}-${occurrence.scheduledDate.getTime()}`;
  }
}

// Singleton instance
let schedulerInstance: Scheduler | null = null;

export function getScheduler(): Scheduler {
  if (!schedulerInstance) {
    schedulerInstance = new Scheduler();
  }
  return schedulerInstance;
}
