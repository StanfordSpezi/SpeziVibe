/**
 * Scheduler Module Types
 * Based on Stanford Spezi SpeziScheduler
 */

export type RecurrenceRule =
  | { type: 'daily'; hour: number; minute: number }
  | { type: 'weekly'; weekday: number; hour: number; minute: number }
  | { type: 'monthly'; day: number; hour: number; minute: number }
  | { type: 'once'; date: Date };

export interface Schedule {
  startDate: Date;
  endDate?: Date;
  recurrence: RecurrenceRule;
}

export type TaskCategory = 'questionnaire' | 'task' | 'reminder' | 'measurement';

export type AllowedCompletionPolicy =
  | { type: 'anytime' }
  | { type: 'window'; start: number; end: number }; // minutes before/after scheduled time

export interface Task {
  id: string;
  title: string;
  instructions: string;
  category: TaskCategory;
  schedule: Schedule;
  completionPolicy: AllowedCompletionPolicy;
  tags?: string[];
  questionnaireId?: string; // Link to questionnaire for questionnaire-type tasks
  createdAt: Date;
  effectiveFrom: Date;
}

export interface Occurrence {
  scheduledDate: Date;
  index: number; // nth occurrence of this task
}

export interface Outcome {
  id: string;
  completedAt: Date;
  data?: Record<string, any>; // Custom outcome data
}

export interface Event {
  task: Task;
  occurrence: Occurrence;
  outcome?: Outcome;
}

export interface SchedulerState {
  tasks: Task[];
  outcomes: Outcome[];
}
