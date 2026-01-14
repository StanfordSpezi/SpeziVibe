/**
 * HealthView Component
 *
 * Main dashboard view for displaying health metrics.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useHealthKit } from '../hooks/useHealthKit';
import { useHealthMetric } from '../hooks/useHealthMetric';
import { MetricCard } from './MetricCard';
import type { HealthViewProps } from '../types';
import { SampleType, getUnitForType, getLabelForType } from '../sample-types';

/**
 * Default metrics to display
 */
const DEFAULT_METRICS: SampleType[] = [
  SampleType.stepCount,
  SampleType.heartRate,
  SampleType.activeEnergyBurned,
  SampleType.sleepAnalysis,
];

/**
 * Colors for different metric types
 */
const METRIC_COLORS: Partial<Record<SampleType, string>> = {
  [SampleType.stepCount]: '#34C759',
  [SampleType.heartRate]: '#FF3B30',
  [SampleType.activeEnergyBurned]: '#FF9500',
  [SampleType.sleepAnalysis]: '#5856D6',
  [SampleType.bodyMass]: '#007AFF',
  [SampleType.bloodGlucose]: '#FF2D55',
  [SampleType.oxygenSaturation]: '#00C7BE',
};

/**
 * Individual metric display component
 */
function MetricDisplay({ type }: { type: SampleType }) {
  const { value, unit, isLoading } = useHealthMetric(type);
  const color = METRIC_COLORS[type] || '#007AFF';

  return (
    <MetricCard
      type={type}
      value={value}
      unit={unit}
      color={color}
      isLoading={isLoading}
    />
  );
}

/**
 * Authorization prompt component
 */
function AuthorizationPrompt({
  onAuthorize,
  isLoading,
}: {
  onAuthorize: () => void;
  isLoading: boolean;
}) {
  return (
    <View style={styles.authContainer}>
      <Text style={styles.authIcon}>🔒</Text>
      <Text style={styles.authTitle}>Health Data Access</Text>
      <Text style={styles.authMessage}>
        Tap the button below to grant access to your health data.
      </Text>
      <TouchableOpacity
        style={styles.authButton}
        onPress={onAuthorize}
        disabled={isLoading}
      >
        <Text style={styles.authButtonText}>
          {isLoading ? 'Requesting...' : 'Allow Access'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Platform unavailable message
 */
function PlatformUnavailable() {
  return (
    <View style={styles.unavailableContainer}>
      <Text style={styles.unavailableIcon}>📱</Text>
      <Text style={styles.unavailableTitle}>iOS Only</Text>
      <Text style={styles.unavailableMessage}>
        HealthKit is only available on iOS devices.
      </Text>
    </View>
  );
}

export function HealthView({
  metrics = DEFAULT_METRICS,
  showHeader = true,
  title = 'Health',
  onRefresh,
}: HealthViewProps) {
  const {
    isAvailable,
    isAuthorized,
    isLoading,
    requestAuthorization,
    refresh,
  } = useHealthKit();

  const handleRefresh = useCallback(() => {
    refresh();
    onRefresh?.();
  }, [refresh, onRefresh]);

  const handleAuthorize = useCallback(async () => {
    await requestAuthorization();
  }, [requestAuthorization]);

  // Not available on this platform
  if (Platform.OS !== 'ios' || !isAvailable) {
    return <PlatformUnavailable />;
  }

  // Not yet authorized
  if (!isAuthorized && !isLoading) {
    return (
      <AuthorizationPrompt
        onAuthorize={handleAuthorize}
        isLoading={isLoading}
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          tintColor="#007AFF"
        />
      }
    >
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Today</Text>
        </View>
      )}

      <View style={styles.metricsContainer}>
        {metrics.map((type) => (
          <MetricDisplay key={type} type={type} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000',
  },
  subtitle: {
    fontSize: 17,
    color: '#666',
    marginTop: 4,
  },
  metricsContainer: {
    gap: 12,
  },
  // Authorization prompt styles
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  authIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  authMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  authButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  // Platform unavailable styles
  unavailableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  unavailableIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  unavailableTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  unavailableMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
