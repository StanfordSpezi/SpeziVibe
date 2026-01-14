/**
 * HealthKit Service
 *
 * Abstraction layer over @kingstinct/react-native-healthkit.
 * Handles platform detection and provides a clean API.
 */

import { Platform } from 'react-native';
import type {
  HealthSample,
  HealthStatistics,
  HealthQueryOptions,
} from '../types';
import { SampleType, getUnitForType } from '../sample-types';
import type {
  QuantityTypeIdentifier,
  SampleTypeIdentifierWriteable,
  ObjectTypeIdentifier,
  QuantitySample,
} from '@kingstinct/react-native-healthkit';

// Dynamically import HealthKit only on iOS
let healthKit: typeof import('@kingstinct/react-native-healthkit') | null = null;

if (Platform.OS === 'ios') {
  try {
    healthKit = require('@kingstinct/react-native-healthkit');
  } catch {
    // HealthKit not available (e.g., in tests or Expo Go)
    healthKit = null;
  }
}

/**
 * HealthKit Service Interface
 */
export interface IHealthKitService {
  isAvailable(): boolean;
  requestAuthorization(
    readTypes: SampleType[],
    writeTypes?: SampleType[]
  ): Promise<boolean>;
  getMostRecentSample(type: SampleType): Promise<HealthSample | null>;
  querySamples(
    type: SampleType,
    options: HealthQueryOptions
  ): Promise<HealthSample[]>;
  getStatistics(
    type: SampleType,
    options: HealthQueryOptions
  ): Promise<HealthStatistics | null>;
  getTodaySteps(): Promise<number>;
  getTodayActiveEnergy(): Promise<number>;
}

class HealthKitServiceImpl implements IHealthKitService {
  /**
   * Check if HealthKit is available on this device
   */
  isAvailable(): boolean {
    return Platform.OS === 'ios' && healthKit !== null;
  }

  /**
   * Request authorization for the specified sample types
   */
  async requestAuthorization(
    readTypes: SampleType[],
    writeTypes: SampleType[] = []
  ): Promise<boolean> {
    if (!this.isAvailable() || !healthKit) {
      return false;
    }

    try {
      // requestAuthorization(toShare, toRead) - write types first, then read types
      const write = writeTypes as unknown as SampleTypeIdentifierWriteable[];
      const read = readTypes as unknown as ObjectTypeIdentifier[];

      await healthKit.requestAuthorization(write, read);
      return true;
    } catch (error) {
      console.error('HealthKit authorization failed:', error);
      return false;
    }
  }

  /**
   * Get the most recent sample for a given type
   */
  async getMostRecentSample(type: SampleType): Promise<HealthSample | null> {
    if (!this.isAvailable() || !healthKit) {
      return null;
    }

    try {
      const sample = await healthKit.getMostRecentQuantitySample(
        type as QuantityTypeIdentifier
      );

      if (!sample) {
        return null;
      }

      return {
        value: sample.quantity,
        unit: sample.unit || getUnitForType(type),
        startDate: new Date(sample.startDate),
        endDate: new Date(sample.endDate),
        sourceName: sample.sourceRevision?.source?.name,
        sourceId: sample.sourceRevision?.source?.bundleIdentifier,
      };
    } catch (error) {
      console.error(`Failed to get sample for ${type}:`, error);
      return null;
    }
  }

  /**
   * Query samples within a date range
   */
  async querySamples(
    type: SampleType,
    options: HealthQueryOptions
  ): Promise<HealthSample[]> {
    if (!this.isAvailable() || !healthKit) {
      return [];
    }

    try {
      const samples = await healthKit.queryQuantitySamples(
        type as QuantityTypeIdentifier,
        {
          filter: {
            startDate: options.startDate,
            endDate: options.endDate,
          },
          limit: options.limit,
          ascending: options.ascending,
        }
      );

      return samples.map((sample: QuantitySample) => ({
        value: sample.quantity,
        unit: sample.unit || getUnitForType(type),
        startDate: new Date(sample.startDate),
        endDate: new Date(sample.endDate),
        sourceName: sample.sourceRevision?.source?.name,
        sourceId: sample.sourceRevision?.source?.bundleIdentifier,
      }));
    } catch (error) {
      console.error(`Failed to query samples for ${type}:`, error);
      return [];
    }
  }

  /**
   * Get aggregated statistics for a date range
   */
  async getStatistics(
    type: SampleType,
    options: HealthQueryOptions
  ): Promise<HealthStatistics | null> {
    if (!this.isAvailable() || !healthKit) {
      return null;
    }

    try {
      const stats = await healthKit.queryStatisticsForQuantity(
        type as QuantityTypeIdentifier,
        ['cumulativeSum', 'discreteAverage', 'discreteMin', 'discreteMax'],
        {
          filter: {
            startDate: options.startDate,
            endDate: options.endDate,
          },
        }
      );

      return {
        sum: stats.sumQuantity?.quantity,
        average: stats.averageQuantity?.quantity,
        min: stats.minimumQuantity?.quantity,
        max: stats.maximumQuantity?.quantity,
        count: 0, // Not directly available from this API
        unit: stats.sumQuantity?.unit || getUnitForType(type),
      };
    } catch (error) {
      console.error(`Failed to get statistics for ${type}:`, error);
      return null;
    }
  }

  /**
   * Get today's total step count
   */
  async getTodaySteps(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();

    const stats = await this.getStatistics(SampleType.stepCount, {
      startDate: today,
      endDate: now,
    });

    return stats?.sum || 0;
  }

  /**
   * Get today's total active energy burned
   */
  async getTodayActiveEnergy(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();

    const stats = await this.getStatistics(SampleType.activeEnergyBurned, {
      startDate: today,
      endDate: now,
    });

    return stats?.sum || 0;
  }
}

/**
 * Singleton instance of the HealthKit service
 */
export const HealthKitService = new HealthKitServiceImpl();
