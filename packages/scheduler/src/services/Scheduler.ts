/**
 * Main Scheduler class for managing tasks and events
 * Based on Stanford Spezi SpeziScheduler
 *
 * This scheduler uses LOCAL STORAGE ONLY (AsyncStorage).
 * Backend synchronization is handled by the app's orchestrator/Standard.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Task,
  Event,
  Outcome,
  SchedulerState,
  CompletionStats,
  SerializedSchedulerState,
  SerializedTask,
  SerializedOutcome,
} from '../types';
import { calculateOccurrences, isAllowedToComplete } from '../utils';

export class Scheduler {
  private state: SchedulerState = {
    tasks: [],
    outcomes: [],
  };

  private storageKey: string;
  private listeners: Set<() => void> = new Set();
  private initialized: boolean = false;

  constructor(storageKey: string = '@scheduler_state') {
    this.storageKey = storageKey;
  }

  /**
   * Initialize the scheduler and load saved state
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await this.loadState();
    this.initialized = true;
  }

  /**
   * Load state from AsyncStorage
   */
  private async loadState(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      if (data) {
        const parsed: SerializedSchedulerState = JSON.parse(data);
        // Deserialize dates
        this.state = {
          tasks: parsed.tasks.map((t: SerializedTask): Task => ({
            ...t,
            schedule: {
              ...t.schedule,
              startDate: new Date(t.schedule.startDate),
              endDate: t.schedule.endDate ? new Date(t.schedule.endDate) : undefined,
              recurrence:
                t.schedule.recurrence.type === 'once'
                  ? { ...t.schedule.recurrence, date: new Date(t.schedule.recurrence.date) }
                  : t.schedule.recurrence,
            },
            createdAt: new Date(t.createdAt),
          })),
          outcomes: parsed.outcomes.map((o: SerializedOutcome): Outcome => ({
            ...o,
            completedAt: new Date(o.completedAt),
          })),
        };
      }
    } catch (error) {
      console.error('[Scheduler] Failed to load state:', error);
    }
  }

  /**
   * Save state to AsyncStorage
   */
  private async saveState(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(this.state));
      this.notifyListeners();
    } catch (error) {
      console.error('[Scheduler] Failed to save state:', error);
      throw error;
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error('[Scheduler] Error in listener:', error);
      }
    });
  }

  /**
   * Get the current state (for advanced use cases or backend sync)
   */
  getState(): SchedulerState {
    return {
      tasks: [...this.state.tasks],
      outcomes: [...this.state.outcomes],
    };
  }

  /**
   * Create or update a task
   */
  async createOrUpdateTask(task: Omit<Task, 'createdAt'>): Promise<Task> {
    const existingIndex = this.state.tasks.findIndex((t) => t.id === task.id);
    const now = new Date();

    const newTask: Task = {
      ...task,
      createdAt: existingIndex >= 0 ? this.state.tasks[existingIndex].createdAt : now,
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
   * Delete a task and its outcomes
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
  getCompletionStats(startDate: Date, endDate: Date): CompletionStats {
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

  /**
   * Generate a unique outcome ID
   */
  private getOutcomeId(taskId: string, occurrence: { scheduledDate: Date; index: number }): string {
    return `${taskId}-${occurrence.index}-${occurrence.scheduledDate.getTime()}`;
  }
}
