import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { Scheduler } from './scheduler';
import { Task, Event } from './types';
import { createSampleTasks } from './sample-tasks';
import { useStandard } from '../services/standard-context';

interface SchedulerContextValue {
  scheduler: Scheduler | null;
  tasks: Task[];
  refreshTasks: () => void;
  isLoading: boolean;
}

const SchedulerContext = createContext<SchedulerContextValue | null>(null);

interface SchedulerProviderProps {
  children: ReactNode;
}

export function SchedulerProvider({ children }: SchedulerProviderProps) {
  const [scheduler, setScheduler] = useState<Scheduler | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { backend, backendType, isLoading: backendLoading } = useStandard();

  useEffect(() => {
    // Wait for backend to be ready
    if (backendLoading || !backend) {
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    async function initializeScheduler() {
      try {
        // Backend is guaranteed to be non-null due to check above
        if (!backend) return;

        // Create scheduler with backend from context
        const schedulerInstance = new Scheduler(backend);
        await schedulerInstance.initialize();

        if (cancelled) return;

        // Check if tasks are already initialized
        const existingTasks = schedulerInstance.getTasks();

        // Only create sample tasks for local backend (development)
        // For Firebase, wait until user is authenticated to load/create tasks
        if (existingTasks.length === 0 && backendType === 'local') {
          const predefinedTasks = createSampleTasks();
          for (const task of predefinedTasks) {
            if (cancelled) return;
            await schedulerInstance.createOrUpdateTask(task);
          }
        }

        if (cancelled) return;

        setScheduler(schedulerInstance);
        setTasks(schedulerInstance.getTasks());

        // Subscribe to changes
        unsubscribe = schedulerInstance.subscribe(() => {
          setTasks(schedulerInstance.getTasks());
        });
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to initialize scheduler:', error);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    initializeScheduler();

    return () => {
      cancelled = true;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [backend, backendLoading]);

  const refreshTasks = () => {
    if (scheduler) {
      setTasks(scheduler.getTasks());
    }
  };

  const value = useMemo(
    () => ({ scheduler, tasks, refreshTasks, isLoading }),
    [scheduler, tasks, isLoading]
  );

  return (
    <SchedulerContext.Provider value={value}>
      {children}
    </SchedulerContext.Provider>
  );
}

export function useScheduler(): SchedulerContextValue {
  const context = useContext(SchedulerContext);
  if (!context) {
    throw new Error('useScheduler must be used within a SchedulerProvider');
  }
  return context;
}
