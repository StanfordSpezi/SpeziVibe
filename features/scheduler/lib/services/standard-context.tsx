import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from 'react';
import { Scheduler, SchedulerContext, createSampleTasks } from '@spezivibe/scheduler';
import { BackendService, BackendType } from './types';
import { BackendFactory } from './backend-factory';
import { getBackendConfig } from './config';
import { createLogger } from '../utils/logger';

const logger = createLogger('Standard');

/**
 * StandardContext - Local Mode with Scheduler
 *
 * Provides backend service and scheduler for local data storage.
 * No authentication is configured in this mode.
 */

interface StandardContextValue {
  backend: BackendService | null;
  scheduler: Scheduler | null;
  backendType: BackendType | null;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
}

const StandardContext = createContext<StandardContextValue | null>(null);

interface StandardProviderProps {
  schedulerStorageKey?: string;
  children: ReactNode;
}

export function StandardProvider({
  schedulerStorageKey = '@scheduler_state',
  children,
}: StandardProviderProps) {
  const [backend, setBackend] = useState<BackendService | null>(null);
  const [backendType, setBackendType] = useState<BackendType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const scheduler = useMemo(() => new Scheduler(schedulerStorageKey), [schedulerStorageKey]);
  const [schedulerLoading, setSchedulerLoading] = useState(true);

  // Initialize all services once
  useEffect(() => {
    let cancelled = false;

    async function initializeStandard() {
      if (cancelled) return;

      try {
        const config = getBackendConfig();
        const backendInstance = BackendFactory.createBackend(config);

        await Promise.all([
          backendInstance.initialize(),
          scheduler.initialize(),
        ]);

        if (cancelled) return;

        setBackend(backendInstance);
        setBackendType(config.type);
        setSchedulerLoading(false);
        setIsLoading(false);

        // Load sample tasks for local backend
        if (config.type === 'local') {
          const existingTasks = scheduler.getTasks();
          if (existingTasks.length === 0) {
            await loadSampleTasks(scheduler);
          }
        }

        logger.debug('Standard initialized successfully (local mode with scheduler)');
      } catch (err) {
        if (cancelled) return;

        logger.error('Failed to initialize Standard', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize'));
        setIsLoading(false);
        setSchedulerLoading(false);
      }
    }

    initializeStandard();

    return () => {
      cancelled = true;
    };
  }, [retryCount, scheduler]);

  const retry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  const standardValue = useMemo(
    () => ({ backend, scheduler, backendType, isLoading, error, retry }),
    [backend, scheduler, backendType, isLoading, error, retry]
  );

  const schedulerValue = useMemo(
    () => ({ scheduler, isLoading: schedulerLoading }),
    [scheduler, schedulerLoading]
  );

  return (
    <StandardContext.Provider value={standardValue}>
      <SchedulerContext.Provider value={schedulerValue}>
        {children}
      </SchedulerContext.Provider>
    </StandardContext.Provider>
  );
}

async function loadSampleTasks(scheduler: Scheduler): Promise<void> {
  const predefinedTasks = createSampleTasks();
  for (const task of predefinedTasks) {
    await scheduler.createOrUpdateTask(task);
  }
}

export function useStandard(): StandardContextValue {
  const context = useContext(StandardContext);
  if (!context) {
    throw new Error('useStandard must be used within a StandardProvider');
  }
  return context;
}
