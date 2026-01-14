/**
 * HealthKit Types
 *
 * Type definitions for HealthKit integration.
 */

import { SampleType } from './sample-types';

/**
 * Configuration for the HealthKit provider
 */
export interface HealthKitConfig {
  /** Sample types to collect (request read/write access) */
  collect: SampleType[];
  /** Sample types to read only (no write access) */
  readOnly?: SampleType[];
  /** Sample types to enable background delivery for */
  backgroundDelivery?: SampleType[];
  /** Whether to sync collected data to backend */
  syncToBackend?: boolean;
}

/**
 * A single health data sample
 */
export interface HealthSample {
  value: number;
  unit: string;
  startDate: Date;
  endDate: Date;
  sourceName?: string;
  sourceId?: string;
}

/**
 * Aggregated health statistics
 */
export interface HealthStatistics {
  sum?: number;
  average?: number;
  min?: number;
  max?: number;
  count: number;
  unit: string;
}

/**
 * Query options for fetching health data
 */
export interface HealthQueryOptions {
  startDate: Date;
  endDate: Date;
  limit?: number;
  ascending?: boolean;
}

/**
 * Authorization status for a sample type
 */
export type AuthorizationStatus =
  | 'notDetermined'
  | 'sharingDenied'
  | 'sharingAuthorized';

/**
 * Theme colors for health UI components
 */
export interface HealthThemeColors {
  background: string;
  cardBackground: string;
  text: string;
  secondaryText: string;
  accent: string;
  border: string;
  // Metric-specific colors
  steps: string;
  heartRate: string;
  activeEnergy: string;
  sleep: string;
}

/**
 * Theme for health UI components
 */
export interface HealthTheme {
  colors: HealthThemeColors;
  borderRadius: number;
  spacing: {
    cardPadding: number;
    cardGap: number;
  };
}

/**
 * Partial theme for customization
 */
export type PartialHealthTheme = {
  colors?: Partial<HealthThemeColors>;
  borderRadius?: number;
  spacing?: Partial<HealthTheme['spacing']>;
};

/**
 * Props for HealthView component
 */
export interface HealthViewProps {
  /** Health metrics to display */
  metrics?: SampleType[];
  /** Custom theme */
  theme?: PartialHealthTheme;
  /** Whether to show the header */
  showHeader?: boolean;
  /** Custom title for the header */
  title?: string;
  /** Callback when authorization is requested */
  onAuthorizationRequested?: () => void;
  /** Callback when data is refreshed */
  onRefresh?: () => void;
}

/**
 * Props for MetricCard component
 */
export interface MetricCardProps {
  type: SampleType;
  value: number | null;
  unit: string;
  label?: string;
  icon?: string;
  color?: string;
  isLoading?: boolean;
  onPress?: () => void;
}

/**
 * Health observation for backend sync (FHIR-compatible)
 */
export interface HealthObservation {
  type: SampleType;
  value: number;
  unit: string;
  effectiveDateTime: string;
  sourceName?: string;
}

/**
 * Context value for HealthKit provider
 */
export interface HealthKitContextValue {
  /** Whether HealthKit is available on this device */
  isAvailable: boolean;
  /** Whether authorization has been granted */
  isAuthorized: boolean;
  /** Whether initialization is in progress */
  isLoading: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** The current configuration */
  config: HealthKitConfig;
  /** Request authorization for configured types */
  requestAuthorization: () => Promise<boolean>;
  /** Refresh all data */
  refresh: () => void;
}
