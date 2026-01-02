import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from 'react';
import { BackendService, BackendType } from './types';
import { BackendFactory } from './backend-factory';
import { getBackendConfig } from './config';
import { createLogger } from '../utils/logger';

const logger = createLogger('Standard');

/**
 * StandardContext - Local Mode
 *
 * Provides backend service for local data storage.
 * No authentication is configured in this mode.
 *
 * For authentication support, select the Firebase backend when generating
 * your app. The Firebase feature provides a version of this context that
 * includes account service coordination.
 */

interface StandardContextValue {
  backend: BackendService | null;
  backendType: BackendType | null;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
}

const StandardContext = createContext<StandardContextValue | null>(null);

interface StandardProviderProps {
  children: ReactNode;
}

export function StandardProvider({ children }: StandardProviderProps) {
  const [backend, setBackend] = useState<BackendService | null>(null);
  const [backendType, setBackendType] = useState<BackendType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Initialize backend service
  useEffect(() => {
    let cancelled = false;

    async function initializeStandard() {
      if (cancelled) return;

      try {
        const config = getBackendConfig();
        const backendInstance = BackendFactory.createBackend(config);

        await backendInstance.initialize();

        if (cancelled) return;

        setBackend(backendInstance);
        setBackendType(config.type);
        setIsLoading(false);

        logger.debug('Standard initialized successfully (local mode)');
      } catch (err) {
        if (cancelled) return;

        logger.error('Failed to initialize Standard', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize'));
        setIsLoading(false);
      }
    }

    initializeStandard();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const retry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  const standardValue = useMemo(
    () => ({ backend, backendType, isLoading, error, retry }),
    [backend, backendType, isLoading, error, retry]
  );

  return (
    <StandardContext.Provider value={standardValue}>
      {children}
    </StandardContext.Provider>
  );
}

export function useStandard(): StandardContextValue {
  const context = useContext(StandardContext);
  if (!context) {
    throw new Error('useStandard must be used within a StandardProvider');
  }
  return context;
}
