/**
 * HealthKit Configuration
 *
 * Configure which health data types to collect and display.
 * Modify this file to customize the health metrics for your app.
 */

import { HealthKitConfig, SampleType } from '@spezivibe/healthkit';

export const healthKitConfig: HealthKitConfig = {
  // Health data types to collect (request read/write access)
  collect: [
    SampleType.stepCount,
    SampleType.heartRate,
    SampleType.activeEnergyBurned,
    SampleType.sleepAnalysis,
  ],

  // Health data types to read only (no write access)
  readOnly: [
    SampleType.bodyMass,
    SampleType.height,
  ],

  // Enable background delivery for these types (optional)
  // backgroundDelivery: [
  //   SampleType.stepCount,
  // ],

  // Whether to sync health data to the backend (optional)
  syncToBackend: false,
};
