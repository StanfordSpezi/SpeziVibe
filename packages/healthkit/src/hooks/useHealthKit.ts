/**
 * useHealthKit Hook
 *
 * Main hook for accessing HealthKit functionality.
 */

import { useCallback } from 'react';
import { useHealthKitContext } from '../providers';
import { HealthKitService } from '../services';
import type { HealthSample } from '../types';
import { SampleType } from '../sample-types';

export interface UseHealthKitReturn {
  /** Whether HealthKit is available on this device */
  isAvailable: boolean;
  /** Whether authorization has been granted */
  isAuthorized: boolean;
  /** Whether initialization is in progress */
  isLoading: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** Request HealthKit authorization */
  requestAuthorization: () => Promise<boolean>;
  /** Refresh all health data */
  refresh: () => void;
  /** Get today's value for a cumulative metric (steps, energy) */
  getTodayValue: (type: SampleType) => Promise<number | null>;
  /** Get the most recent sample for a metric */
  getMostRecent: (type: SampleType) => Promise<HealthSample | null>;
}

/**
 * Hook for accessing HealthKit functionality
 */
export function useHealthKit(): UseHealthKitReturn {
  const context = useHealthKitContext();

  const getTodayValue = useCallback(
    async (type: SampleType): Promise<number | null> => {
      if (!context.isAvailable || !context.isAuthorized) {
        return null;
      }

      switch (type) {
        case SampleType.stepCount:
          return HealthKitService.getTodaySteps();
        case SampleType.activeEnergyBurned:
          return HealthKitService.getTodayActiveEnergy();
        default: {
          const sample = await HealthKitService.getMostRecentSample(type);
          return sample?.value ?? null;
        }
      }
    },
    [context.isAvailable, context.isAuthorized]
  );

  const getMostRecent = useCallback(
    async (type: SampleType): Promise<HealthSample | null> => {
      if (!context.isAvailable || !context.isAuthorized) {
        return null;
      }
      return HealthKitService.getMostRecentSample(type);
    },
    [context.isAvailable, context.isAuthorized]
  );

  return {
    isAvailable: context.isAvailable,
    isAuthorized: context.isAuthorized,
    isLoading: context.isLoading,
    error: context.error,
    requestAuthorization: context.requestAuthorization,
    refresh: context.refresh,
    getTodayValue,
    getMostRecent,
  };
}
