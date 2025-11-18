/**
 * SchedulerProvider - React Context provider for the Scheduler
 */

import React, { createContext, useEffect, useState, useMemo } from 'react';
import { Scheduler } from '../services';

export interface SchedulerContextValue {
  /** Scheduler instance */
  scheduler: Scheduler | null;
  /** Whether the scheduler is loading */
  isLoading: boolean;
}

export interface SchedulerProviderProps {
  /** Storage key for AsyncStorage (default: '@scheduler_state') */
  storageKey?: string;
  /** Child components */
  children: React.ReactNode;
}

export const SchedulerContext = createContext<SchedulerContextValue | undefined>(undefined);

/**
 * SchedulerProvider component
 *
 * Initializes the scheduler with local AsyncStorage and provides it via context.
 *
 * Following the Spezi pattern, this provider is backend-agnostic. Task initialization
 * and backend synchronization should be handled by the app's orchestration layer.
 */
export function SchedulerProvider({
  storageKey = '@scheduler_state',
  children
}: SchedulerProviderProps) {
  const scheduler = useMemo(() => new Scheduler(storageKey), [storageKey]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    scheduler
      .initialize()
      .then(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('[SchedulerProvider] Failed to initialize:', error);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [scheduler]);

  const value = useMemo(
    () => ({
      scheduler,
      isLoading,
    }),
    [scheduler, isLoading]
  );

  return (
    <SchedulerContext.Provider value={value}>
      {children}
    </SchedulerContext.Provider>
  );
}
