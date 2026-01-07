/**
 * Scheduler Module Types
 * Based on Stanford Spezi SpeziScheduler
 *
 * This module provides a standalone scheduling system with local storage only.
 * Backend synchronization is handled by the app's Standard/orchestrator.
 */

/**
 * Recurrence rules for scheduled tasks
 */
export type RecurrenceRule =
  | { type: 'daily'; hour: number; minute: number }
  | { type: 'weekly'; weekday: number; hour: number; minute: number } // 0 = Sunday, 6 = Saturday
  | { type: 'monthly'; day: number; hour: number; minute: number } // 1-31
  | { type: 'once'; date: Date };

/**
 * Schedule definition for a task
 */
export interface Schedule {
  /** When the schedule starts */
  startDate: Date;
  /** When the schedule ends (optional - no end if omitted) */
  endDate?: Date;
  /** Recurrence pattern */
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
  | { type: 'anytime' } // Can be completed at any time
  | { type: 'window'; start: number; end: number }; // minutes before/after scheduled time

/**
 * A scheduled task
 */
export interface Task {
  /** Unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** Detailed instructions */
  instructions: string;
  /** Task category for filtering/grouping */
  category: TaskCategory;
  /** Schedule definition */
  schedule: Schedule;
  /** Completion policy */
  completionPolicy: AllowedCompletionPolicy;
  /** Link to questionnaire ID for questionnaire-type tasks */
  questionnaireId?: string;
  /** When the task was created */
  createdAt: Date;
}

/**
 * A specific occurrence of a recurring task
 */
export interface Occurrence {
  /** When this occurrence is scheduled */
  scheduledDate: Date;
  /** Index of this occurrence (0-based) */
  index: number;
}

/**
 * The result of completing a task occurrence
 */
export interface Outcome {
  /** Unique identifier for this outcome */
  id: string;
  /** When the task was completed */
  completedAt: Date;
  /** Optional data associated with completion (e.g., questionnaire responses) */
  data?: Record<string, any>;
}

/**
 * An event combines a task, its occurrence, and optional outcome
 * This is the main data structure for UI display
 */
export interface Event {
  /** The task definition */
  task: Task;
  /** The specific occurrence */
  occurrence: Occurrence;
  /** The outcome if completed */
  outcome?: Outcome;
}

/**
 * Internal scheduler state
 */
export interface SchedulerState {
  /** All tasks */
  tasks: Task[];
  /** All outcomes */
  outcomes: Outcome[];
}

/**
 * Serialized recurrence rule (dates as ISO strings)
 */
export type SerializedRecurrenceRule =
  | { type: 'daily'; hour: number; minute: number }
  | { type: 'weekly'; weekday: number; hour: number; minute: number }
  | { type: 'monthly'; day: number; hour: number; minute: number }
  | { type: 'once'; date: string };

/**
 * Serialized schedule (dates as ISO strings)
 */
export interface SerializedSchedule {
  startDate: string;
  endDate?: string;
  recurrence: SerializedRecurrenceRule;
}

/**
 * Serialized task (dates as ISO strings for JSON storage)
 */
export interface SerializedTask {
  id: string;
  title: string;
  instructions: string;
  category: TaskCategory;
  schedule: SerializedSchedule;
  completionPolicy: AllowedCompletionPolicy;
  questionnaireId?: string;
  createdAt: string;
}

/**
 * Serialized outcome (dates as ISO strings)
 */
export interface SerializedOutcome {
  id: string;
  completedAt: string;
  data?: Record<string, unknown>;
}

/**
 * Serialized scheduler state for JSON storage
 */
export interface SerializedSchedulerState {
  tasks: SerializedTask[];
  outcomes: SerializedOutcome[];
}

/**
 * Statistics for task completion
 */
export interface CompletionStats {
  /** Total number of events in range */
  total: number;
  /** Number of completed events */
  completed: number;
  /** Number of pending events */
  pending: number;
  /** Completion rate as percentage (0-100) */
  completionRate: number;
}
