import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef, ReactNode } from 'react';
import { Scheduler, SchedulerContext, createSampleTasks } from '@spezivibe/scheduler';
import type { AccountService } from '@spezivibe/account';
import { BackendService, BackendType } from './types';
import { BackendFactory } from './backend-factory';
import { getBackendConfig } from './config';
import { createLogger } from '../utils/logger';

const logger = createLogger('Standard');

/**
 * StandardContext - Medplum Mode with Scheduler
 *
 * Provides backend service, scheduler, and account service for Medplum FHIR
 * data storage with authentication. Scheduler state is synced to Medplum.
 */

interface StandardContextValue {
  backend: BackendService | null;
  scheduler: Scheduler | null;
  backendType: BackendType | null;
  accountService: AccountService;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
  syncSchedulerToMedplum: () => Promise<void>;
}

const StandardContext = createContext<StandardContextValue | null>(null);

interface StandardProviderProps {
  schedulerStorageKey?: string;
  children: ReactNode;
  accountService: AccountService;
}

export function StandardProvider({
  schedulerStorageKey = '@scheduler_state',
  children,
  accountService,
}: StandardProviderProps) {
  const [backend, setBackend] = useState<BackendService | null>(null);
  const [backendType, setBackendType] = useState<BackendType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [schedulerLoading, setSchedulerLoading] = useState(true);

  // Track if we've loaded from Medplum for this session
  const hasLoadedFromMedplum = useRef(false);
  const isSyncing = useRef(false);

  const scheduler = useMemo(() => new Scheduler(schedulerStorageKey), [schedulerStorageKey]);

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

        // Load sample tasks if scheduler is empty (for initial setup)
        const existingTasks = scheduler.getTasks();
        if (existingTasks.length === 0) {
          await loadSampleTasks(scheduler);
        }

        logger.debug('Standard initialized successfully (medplum mode with scheduler)');
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

  // Sync user ID to backend and load scheduler state from Medplum when auth changes
  useEffect(() => {
    if (!backend || !scheduler) return;

    const unsubscribe = accountService.onAuthStateChanged(async (user) => {
      backend.setUserId(user?.uid || null);
      logger.debug('Backend user ID updated:', user?.uid || 'null');

      if (user?.uid && !hasLoadedFromMedplum.current) {
        // User just logged in - load scheduler state from Medplum
        try {
          logger.debug('[Scheduler] Loading state from Medplum...');
          const medplumState = await backend.loadSchedulerState();

          if (medplumState && medplumState.tasks.length > 0) {
            // Merge Medplum tasks with local tasks
            for (const task of medplumState.tasks) {
              await scheduler.createOrUpdateTask(task);
            }
            logger.debug(`[Scheduler] Loaded ${medplumState.tasks.length} tasks from Medplum`);
          } else {
            // No tasks in Medplum yet - sync local tasks to Medplum
            const localState = scheduler.getState();
            if (localState.tasks.length > 0) {
              logger.debug('[Scheduler] Syncing local tasks to Medplum...');
              await backend.saveSchedulerState(localState);
              logger.debug(`[Scheduler] Synced ${localState.tasks.length} tasks to Medplum`);
            }
          }

          hasLoadedFromMedplum.current = true;
        } catch (err) {
          logger.error('[Scheduler] Failed to sync with Medplum:', err);
        }
      } else if (!user?.uid) {
        // User logged out - reset flag
        hasLoadedFromMedplum.current = false;
      }
    });

    return unsubscribe;
  }, [backend, scheduler, accountService]);

  // Subscribe to scheduler changes and sync to Medplum
  useEffect(() => {
    if (!backend || !scheduler) return;

    const unsubscribe = scheduler.subscribe(async () => {
      // Debounce and prevent recursive syncs
      if (isSyncing.current || !hasLoadedFromMedplum.current) return;

      isSyncing.current = true;
      try {
        const state = scheduler.getState();
        await backend.saveSchedulerState(state);
        logger.debug('[Scheduler] State synced to Medplum');
      } catch (err) {
        logger.error('[Scheduler] Failed to sync state to Medplum:', err);
      } finally {
        isSyncing.current = false;
      }
    });

    return unsubscribe;
  }, [backend, scheduler]);

  const retry = useCallback(() => {
    hasLoadedFromMedplum.current = false;
    setRetryCount((prev) => prev + 1);
  }, []);

  // Manual sync function
  const syncSchedulerToMedplum = useCallback(async () => {
    if (!backend || !scheduler) return;

    try {
      const state = scheduler.getState();
      await backend.saveSchedulerState(state);
      logger.debug('[Scheduler] Manual sync to Medplum completed');
    } catch (err) {
      logger.error('[Scheduler] Manual sync failed:', err);
      throw err;
    }
  }, [backend, scheduler]);

  const standardValue = useMemo(
    () => ({ backend, scheduler, backendType, accountService, isLoading, error, retry, syncSchedulerToMedplum }),
    [backend, scheduler, backendType, accountService, isLoading, error, retry, syncSchedulerToMedplum]
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
