import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Scheduler } from './scheduler';
import { Task, Event } from './types';
import { createSampleTasks } from './sample-tasks';
import { BackendFactory } from '../services/backend-factory';
import { getBackendConfig } from '../services/config';

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

  useEffect(() => {
    // Initialize scheduler with backend
    async function initializeScheduler() {
      try {
        // Load backend configuration
        const config = await getBackendConfig();
        const backend = BackendFactory.createBackend(config);

        // Create scheduler with backend
        const schedulerInstance = new Scheduler(backend);
        await schedulerInstance.initialize();

        // Check if tasks are already initialized
        const existingTasks = schedulerInstance.getTasks();

        if (existingTasks.length === 0) {
          // Initialize predefined tasks on first launch
          const predefinedTasks = createSampleTasks();
          for (const task of predefinedTasks) {
            await schedulerInstance.createOrUpdateTask(task);
          }
        }

        setScheduler(schedulerInstance);
        setTasks(schedulerInstance.getTasks());

        // Subscribe to changes
        const unsubscribe = schedulerInstance.subscribe(() => {
          setTasks(schedulerInstance.getTasks());
        });

        // Store unsubscribe function for cleanup
        return unsubscribe;
      } catch (error) {
        console.error('Failed to initialize scheduler:', error);
      } finally {
        setIsLoading(false);
      }
    }

    const unsubscribePromise = initializeScheduler();

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        if (unsubscribe) {
          unsubscribe();
        }
      });
    };
  }, []);

  const refreshTasks = () => {
    if (scheduler) {
      setTasks(scheduler.getTasks());
    }
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <SchedulerContext.Provider value={{ scheduler, tasks, refreshTasks, isLoading }}>
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
