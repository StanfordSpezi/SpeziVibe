import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from 'react';
import type { AccountService } from '@spezivibe/account';
import { BackendService, BackendType } from './types';
import { BackendFactory } from './backend-factory';
import { getBackendConfig } from './config';
import { createLogger } from '../utils/logger';

const logger = createLogger('Standard');

/**
 * StandardContext - Medplum Mode
 *
 * Provides backend service for Medplum FHIR data storage and account service
 * for authentication. This version coordinates with @spezivibe/medplum.
 */

interface StandardContextValue {
  backend: BackendService | null;
  backendType: BackendType | null;
  accountService: AccountService;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
}

const StandardContext = createContext<StandardContextValue | null>(null);

interface StandardProviderProps {
  children: ReactNode;
  accountService: AccountService;
}

export function StandardProvider({ children, accountService }: StandardProviderProps) {
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

        logger.debug('Standard initialized successfully (medplum mode)');
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

  // Sync user ID to backend when auth state changes
  useEffect(() => {
    if (!backend) return;

    // Set initial user ID from current auth state (in case user is already signed in)
    const currentUser = accountService.getCurrentUser();
    if (currentUser) {
      backend.setUserId(currentUser.uid);
      logger.debug('Backend user ID set from initial state:', currentUser.uid);
    }

    // Listen for future auth state changes
    const unsubscribe = accountService.onAuthStateChanged((user) => {
      backend.setUserId(user?.uid || null);
      logger.debug('Backend user ID updated:', user?.uid || 'null');
    });

    return unsubscribe;
  }, [backend, accountService]);

  const retry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  const standardValue = useMemo(
    () => ({ backend, backendType, accountService, isLoading, error, retry }),
    [backend, backendType, accountService, isLoading, error, retry]
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
