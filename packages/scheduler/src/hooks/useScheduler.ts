/**
 * useScheduler hook
 * Provides access to the scheduler instance from context
 */

import React, { useContext, useEffect, useState } from 'react';
import { SchedulerContext, SchedulerContextValue } from '../providers';
import { Task } from '../types';

export interface UseSchedulerReturn {
  /** Scheduler instance (null if not initialized) */
  scheduler: SchedulerContextValue['scheduler'];
  /** Whether the scheduler is loading */
  isLoading: boolean;
  /** All tasks (reactive to changes) */
  tasks: Task[];
  /** Force refresh tasks from scheduler */
  refreshTasks: () => void;
}

/**
 * Hook to access the scheduler from context
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { scheduler, tasks, isLoading } = useScheduler();
 *
 *   if (isLoading) return <Loading />;
 *
 *   return (
 *     <View>
 *       {tasks.map(task => <TaskItem key={task.id} task={task} />)}
 *     </View>
 *   );
 * }
 * ```
 */
export function useScheduler(): UseSchedulerReturn {
  const context = useContext(SchedulerContext);

  if (!context) {
    throw new Error('useScheduler must be used within a SchedulerProvider');
  }

  const { scheduler, isLoading } = context;
  const [tasks, setTasks] = useState<Task[]>([]);

  const refreshTasks = React.useCallback(() => {
    if (scheduler) {
      setTasks(scheduler.getTasks());
    }
  }, [scheduler]);

  useEffect(() => {
    if (!scheduler) return;

    // Initial load
    refreshTasks();

    // Subscribe to changes
    const unsubscribe = scheduler.subscribe(() => {
      refreshTasks();
    });

    return unsubscribe;
  }, [scheduler, refreshTasks]);

  return {
    scheduler,
    isLoading,
    tasks,
    refreshTasks,
  };
}
