/**
 * @spezivibe/healthkit
 *
 * Apple HealthKit integration for React Native applications.
 * Provides configurable health metrics collection and display.
 *
 * @example
 * ```tsx
 * import { HealthKitProvider, HealthView, SampleType } from '@spezivibe/healthkit';
 *
 * const config = {
 *   collect: [SampleType.stepCount, SampleType.heartRate],
 *   syncToBackend: false,
 * };
 *
 * function HealthScreen() {
 *   return (
 *     <HealthKitProvider config={config}>
 *       <HealthView />
 *     </HealthKitProvider>
 *   );
 * }
 * ```
 */

// Types
export type {
  HealthKitConfig,
  HealthSample,
  HealthStatistics,
  HealthQueryOptions,
  AuthorizationStatus,
  HealthTheme,
  HealthThemeColors,
  PartialHealthTheme,
  HealthViewProps,
  MetricCardProps,
  HealthObservation,
  HealthKitContextValue,
} from './types';

// Sample Types
export {
  SampleType,
  SAMPLE_TYPE_UNITS,
  SAMPLE_TYPE_LABELS,
  getUnitForType,
  getLabelForType,
} from './sample-types';

// Services
export { HealthKitService } from './services';
export type { IHealthKitService } from './services';

// Providers
export { HealthKitProvider, useHealthKitContext } from './providers';
export type { HealthKitProviderProps } from './providers';

// Hooks
export { useHealthKit, useHealthMetric } from './hooks';
export type { UseHealthKitReturn, UseHealthMetricReturn } from './hooks';

// UI Components
export {
  HealthView,
  MetricCard,
  ExpoGoFallback,
  defaultLightHealthTheme,
  defaultDarkHealthTheme,
  mergeHealthTheme,
} from './ui';
export type { ExpoGoFallbackProps } from './ui';

// Utils
export { isExpoGo, isStandalone, getExpoGoMessage } from './utils';
