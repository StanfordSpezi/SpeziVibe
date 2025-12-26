/**
 * @spezivibe/scheduler
 *
 * Standalone scheduler module for React Native applications
 * Based on Stanford Spezi SpeziScheduler
 *
 * This package handles task scheduling and local storage only.
 * Backend synchronization should be handled by your app's orchestrator/Standard.
 */

// Types
export * from './types';

// Services
export { Scheduler } from './services';

// Providers and Hooks
export { SchedulerProvider, SchedulerContext } from './providers';
export type { SchedulerContextValue, SchedulerProviderProps } from './providers';
export { useScheduler, useScheduleScreen } from './hooks';
export type { UseSchedulerReturn, UseScheduleScreenReturn, UseScheduleScreenOptions } from './hooks';

// Utilities
export {
  calculateOccurrences,
  isAllowedToComplete,
  groupEventsByDate,
  getRelativeDateLabel,
  getDateLabel,
  formatTime,
} from './utils';

// UI Components
export * from './ui';

// Sample tasks (optional)
export { createSampleTasks } from './sample-tasks';
