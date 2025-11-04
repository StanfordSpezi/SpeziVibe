import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Scheduler, getScheduler } from './scheduler';
import { Task, Event } from './types';
import { createSampleTasks } from './sample-tasks';

interface SchedulerContextValue {
  scheduler: Scheduler;
  tasks: Task[];
  refreshTasks: () => void;
}

const SchedulerContext = createContext<SchedulerContextValue | null>(null);

interface SchedulerProviderProps {
  children: ReactNode;
}

export function SchedulerProvider({ children }: SchedulerProviderProps) {
  const [scheduler] = useState(() => getScheduler());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize scheduler and predefined tasks
    async function initializeScheduler() {
      await scheduler.initialize();

      // Check if tasks are already initialized
      const existingTasks = scheduler.getTasks();

      if (existingTasks.length === 0) {
        // Initialize predefined tasks on first launch
        const predefinedTasks = createSampleTasks();
        for (const task of predefinedTasks) {
          await scheduler.createOrUpdateTask(task);
        }
      }

      setTasks(scheduler.getTasks());
      setInitialized(true);
    }

    initializeScheduler();

    // Subscribe to changes
    const unsubscribe = scheduler.subscribe(() => {
      setTasks(scheduler.getTasks());
    });

    return unsubscribe;
  }, [scheduler]);

  const refreshTasks = () => {
    setTasks(scheduler.getTasks());
  };

  if (!initialized) {
    return null; // Or a loading spinner
  }

  return (
    <SchedulerContext.Provider value={{ scheduler, tasks, refreshTasks }}>
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
