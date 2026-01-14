/**
 * HealthKit Provider
 *
 * Context provider for HealthKit functionality.
 * Handles authorization, configuration, and state management.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import { HealthKitService } from '../services';
import { isExpoGo } from '../utils';
import type { HealthKitConfig, HealthKitContextValue } from '../types';
import { ExpoGoFallback } from '../ui/ExpoGoFallback';

const HealthKitContext = createContext<HealthKitContextValue | null>(null);

export interface HealthKitProviderProps {
  children: ReactNode;
  /** Configuration for HealthKit */
  config: HealthKitConfig;
  /** Whether to automatically request authorization on mount */
  autoRequest?: boolean;
  /** Custom fallback component when running in Expo Go */
  expoGoFallback?: ReactNode;
}

export function HealthKitProvider({
  children,
  config,
  autoRequest = false,
  expoGoFallback,
}: HealthKitProviderProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const isAvailable = HealthKitService.isAvailable();

  // Check if running in Expo Go
  if (isExpoGo()) {
    return <>{expoGoFallback || <ExpoGoFallback />}</>;
  }

  const requestAuthorization = useCallback(async () => {
    if (!isAvailable) {
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const allTypes = [...config.collect, ...(config.readOnly || [])];
      const writeTypes = config.collect;

      const result = await HealthKitService.requestAuthorization(
        allTypes,
        writeTypes
      );
      setIsAuthorized(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Authorization failed');
      setError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAvailable, config.collect, config.readOnly]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Initialize on mount
  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      if (!isAvailable) {
        setIsLoading(false);
        return;
      }

      if (autoRequest) {
        await requestAuthorization();
      } else {
        setIsLoading(false);
      }

      if (cancelled) return;
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, [isAvailable, autoRequest, requestAuthorization]);

  const value = useMemo<HealthKitContextValue>(
    () => ({
      isAvailable,
      isAuthorized,
      isLoading,
      error,
      config,
      requestAuthorization,
      refresh,
    }),
    [isAvailable, isAuthorized, isLoading, error, config, requestAuthorization, refresh]
  );

  return (
    <HealthKitContext.Provider value={value}>
      {children}
    </HealthKitContext.Provider>
  );
}

/**
 * Hook to access the HealthKit context
 */
export function useHealthKitContext(): HealthKitContextValue {
  const context = useContext(HealthKitContext);
  if (!context) {
    throw new Error('useHealthKitContext must be used within a HealthKitProvider');
  }
  return context;
}
