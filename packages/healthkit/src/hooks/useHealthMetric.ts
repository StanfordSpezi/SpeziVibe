/**
 * useHealthMetric Hook
 *
 * Hook for subscribing to a specific health metric.
 * Automatically fetches and refreshes data.
 */

import { useState, useEffect, useCallback } from 'react';
import { useHealthKitContext } from '../providers';
import { HealthKitService } from '../services';
import type { HealthSample } from '../types';
import { SampleType, getUnitForType } from '../sample-types';

export interface UseHealthMetricReturn {
  /** Current value of the metric */
  value: number | null;
  /** Full sample data (for non-cumulative types) */
  sample: HealthSample | null;
  /** Unit for this metric */
  unit: string;
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** Manually refresh the data */
  refresh: () => void;
}

/**
 * Hook for subscribing to a specific health metric
 */
export function useHealthMetric(type: SampleType): UseHealthMetricReturn {
  const { isAvailable, isAuthorized } = useHealthKitContext();

  const [value, setValue] = useState<number | null>(null);
  const [sample, setSample] = useState<HealthSample | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const unit = getUnitForType(type);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      if (!isAvailable || !isAuthorized) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // For cumulative types (steps, energy), get today's total
        if (type === SampleType.stepCount || type === SampleType.activeEnergyBurned) {
          const todayValue =
            type === SampleType.stepCount
              ? await HealthKitService.getTodaySteps()
              : await HealthKitService.getTodayActiveEnergy();

          if (!cancelled) {
            setValue(todayValue);
            setSample(null);
          }
        } else {
          // For other types, get the most recent sample
          const latestSample = await HealthKitService.getMostRecentSample(type);

          if (!cancelled) {
            setValue(latestSample?.value ?? null);
            setSample(latestSample);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch health data'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [isAvailable, isAuthorized, type, refreshKey]);

  return { value, sample, unit, isLoading, error, refresh };
}
