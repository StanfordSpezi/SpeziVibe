import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from 'react';
import { AccountService, User } from '@spezivibe/account';
import { Scheduler, SchedulerContext, createSampleTasks } from '@spezivibe/scheduler';
import { BackendService, BackendType } from './types';
import { BackendFactory } from './backend-factory';
import { getBackendConfig } from './config';
import { createLogger } from '../utils/logger';

const logger = createLogger('Standard');

/**
 * StandardContext - The Standard for SpeziVibe
 *
 * Inspired by Stanford Spezi's Standard pattern, this context serves as the central
 * orchestrator for data flow within the application. It coordinates:
 * - Backend service (data persistence)
 * - Account service (authentication)
 * - Scheduler (task management)
 *
 * In Spezi terminology, the Standard is the key module that coordinates all other
 * modules and enforces architectural constraints.
 */

interface StandardContextValue {
  backend: BackendService | null;
  accountService: AccountService;
  scheduler: Scheduler | null;
  backendType: BackendType | null;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
}

const StandardContext = createContext<StandardContextValue | null>(null);

interface StandardProviderProps {
  accountService: AccountService;
  /** Storage key for scheduler (default: '@scheduler_state') */
  schedulerStorageKey?: string;
  children: ReactNode;
}

export function StandardProvider({
  accountService,
  schedulerStorageKey = '@scheduler_state',
  children,
}: StandardProviderProps) {
  // Core state
  const [backend, setBackend] = useState<BackendService | null>(null);
  const [backendType, setBackendType] = useState<BackendType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Scheduler - created once, managed by Standard
  const scheduler = useMemo(() => new Scheduler(schedulerStorageKey), [schedulerStorageKey]);
  const [schedulerLoading, setSchedulerLoading] = useState(true);
  const [schedulerInitializedForUser, setSchedulerInitializedForUser] = useState<string | null>(null);

  // Initialize all services
  useEffect(() => {
    let cancelled = false;

    async function initializeStandard() {
      if (cancelled) return;

      setIsLoading(true);
      setError(null);

      try {
        // Load backend configuration
        const config = getBackendConfig();

        // Create backend instance for data operations
        const backendInstance = BackendFactory.createBackend(config);

        // Initialize all services in parallel
        await Promise.all([
          backendInstance.initialize(),
          accountService.initialize(),
          scheduler.initialize(),
        ]);

        if (cancelled) return;

        setBackend(backendInstance);
        setBackendType(config.type);
        setSchedulerLoading(false);
        setIsLoading(false);

        logger.debug('Standard initialized successfully');
      } catch (err) {
        if (cancelled) return;

        logger.error('Failed to initialize Standard', err);
        const initError = err instanceof Error ? err : new Error('Failed to initialize');
        setError(initError);
        setIsLoading(false);
        setSchedulerLoading(false);
      }
    }

    initializeStandard();

    return () => {
      cancelled = true;
    };
  }, [retryCount, accountService, scheduler]);

  // Handle auth state changes - sync user ID and initialize scheduler data
  useEffect(() => {
    if (!backend || !accountService || isLoading) return;

    const unsubscribe = accountService.onAuthStateChanged(async (user) => {
      logger.debug('Auth state changed:', user?.uid || 'signed out');

      // Sync user ID to backend
      backend.setUserId(user?.uid || null);

      // Initialize scheduler for this user
      if (user) {
        await initializeSchedulerForUser(user);
      } else {
        setSchedulerInitializedForUser(null);
      }
    });

    return unsubscribe;
  }, [backend, accountService, isLoading]);

  // Initialize scheduler with user's tasks or sample tasks
  const initializeSchedulerForUser = useCallback(async (user: User) => {
    if (!backend || !scheduler || schedulerLoading) return;

    // Skip if already initialized for this user
    if (schedulerInitializedForUser === user.uid) return;

    try {
      if (backendType === 'firebase') {
        // Sync from backend to local scheduler
        const remoteState = await backend.loadSchedulerState();

        if (remoteState && remoteState.tasks.length > 0) {
          logger.debug('Syncing', remoteState.tasks.length, 'tasks from backend');
          for (const task of remoteState.tasks) {
            await scheduler.createOrUpdateTask(task);
          }
        } else {
          // New user with no tasks - load sample tasks
          logger.debug('No remote tasks, loading sample tasks for new user');
          await loadSampleTasks(scheduler);
          // Save to backend so they persist
          await backend.saveSchedulerState({
            tasks: scheduler.getTasks(),
            outcomes: [],
          });
        }
      } else {
        // Local development - load sample tasks if empty
        const existingTasks = scheduler.getTasks();
        if (existingTasks.length === 0) {
          await loadSampleTasks(scheduler);
        }
      }

      setSchedulerInitializedForUser(user.uid);
    } catch (err) {
      logger.error('Failed to initialize scheduler for user', err);
    }
  }, [backend, scheduler, schedulerLoading, backendType, schedulerInitializedForUser]);

  // Also initialize for local backend without auth
  useEffect(() => {
    if (backendType !== 'local' || schedulerLoading || isLoading) return;

    const existingTasks = scheduler.getTasks();
    if (existingTasks.length === 0) {
      loadSampleTasks(scheduler).catch((err) => {
        logger.error('Failed to load sample tasks', err);
      });
    }
  }, [backendType, scheduler, schedulerLoading, isLoading]);

  const retry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  // Standard context value
  const standardValue = useMemo(
    () => ({ backend, accountService, scheduler, backendType, isLoading, error, retry }),
    [backend, accountService, scheduler, backendType, isLoading, error, retry]
  );

  // Scheduler context value (for useScheduler() hook compatibility)
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

/**
 * Load sample tasks into the scheduler
 */
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
