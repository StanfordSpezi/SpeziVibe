import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { AccountService } from '@spezivibe/account';
import { BackendService, BackendType } from './types';
import { BackendFactory } from './backend-factory';
import { getBackendConfig } from './config';

/**
 * StandardContext - The Standard for SpeziVibe
 *
 * Inspired by Stanford Spezi's Standard pattern, this context serves as the central
 * orchestrator for data flow within the application. It provides the backend service
 * instance and account service to all modules and manages the core data layer.
 *
 * In Spezi terminology, the Standard is the key module that coordinates all other
 * modules and enforces architectural constraints.
 */

interface StandardContextValue {
  backend: BackendService | null;
  accountService: AccountService;
  backendType: BackendType | null;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
}

const StandardContext = createContext<StandardContextValue | null>(null);

interface StandardProviderProps {
  accountService: AccountService;
  children: ReactNode;
}

export function StandardProvider({ accountService, children }: StandardProviderProps) {
  const [backend, setBackend] = useState<BackendService | null>(null);
  const [backendType, setBackendType] = useState<BackendType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

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

        // Initialize both services
        await Promise.all([
          backendInstance.initialize(),
          accountService.initialize(),
        ]);

        if (cancelled) return;

        setBackend(backendInstance);
        setBackendType(config.type);
        setIsLoading(false);
      } catch (err) {
        if (cancelled) return;

        console.error('Failed to initialize Standard:', err);
        const error = err instanceof Error ? err : new Error('Failed to initialize backend');
        setError(error);
        setIsLoading(false);
      }
    }

    initializeStandard();

    return () => {
      cancelled = true;
    };
  }, [retryCount, accountService]);

  // Sync user ID from account service to backend
  useEffect(() => {
    if (!backend || !accountService) return;

    const unsubscribe = accountService.onAuthStateChanged((user) => {
      console.log('[StandardContext] Auth state changed, setting userId:', user?.uid || 'null');
      backend.setUserId(user?.uid || null);
    });

    return unsubscribe;
  }, [backend, accountService]);

  const retry = () => {
    setRetryCount(prev => prev + 1);
  };

  const value = useMemo(
    () => ({ backend, accountService, backendType, isLoading, error, retry }),
    [backend, accountService, backendType, isLoading, error]
  );

  return (
    <StandardContext.Provider value={value}>
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
