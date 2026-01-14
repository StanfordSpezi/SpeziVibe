/**
 * MetricCard Component
 *
 * Displays a single health metric with value, unit, and icon.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import type { MetricCardProps } from '../types';
import { SampleType, getLabelForType } from '../sample-types';

/**
 * Format a number for display (with thousands separator)
 */
function formatValue(value: number, decimals: number = 0): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Get icon for a sample type
 */
function getIconForType(type: SampleType): string {
  const icons: Partial<Record<SampleType, string>> = {
    [SampleType.stepCount]: '👟',
    [SampleType.heartRate]: '❤️',
    [SampleType.activeEnergyBurned]: '🔥',
    [SampleType.sleepAnalysis]: '😴',
    [SampleType.bodyMass]: '⚖️',
    [SampleType.height]: '📏',
    [SampleType.bloodGlucose]: '🩸',
    [SampleType.bloodPressureSystolic]: '💓',
    [SampleType.oxygenSaturation]: '💨',
    [SampleType.respiratoryRate]: '🌬️',
    [SampleType.bodyTemperature]: '🌡️',
    [SampleType.mindfulSession]: '🧘',
    [SampleType.distanceWalkingRunning]: '🏃',
    [SampleType.flightsClimbed]: '🪜',
  };
  return icons[type] || '📊';
}

/**
 * Get the number of decimal places for a type
 */
function getDecimalsForType(type: SampleType): number {
  switch (type) {
    case SampleType.stepCount:
    case SampleType.flightsClimbed:
      return 0;
    case SampleType.heartRate:
    case SampleType.bloodPressureSystolic:
    case SampleType.bloodPressureDiastolic:
      return 0;
    case SampleType.bodyMass:
    case SampleType.activeEnergyBurned:
      return 1;
    default:
      return 1;
  }
}

export function MetricCard({
  type,
  value,
  unit,
  label,
  icon,
  color = '#007AFF',
  isLoading = false,
  onPress,
}: MetricCardProps) {
  const displayLabel = label || getLabelForType(type);
  const displayIcon = icon || getIconForType(type);
  const decimals = getDecimalsForType(type);

  const content = (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{displayIcon}</Text>
        <Text style={styles.label}>{displayLabel}</Text>
      </View>
      <View style={styles.valueContainer}>
        {isLoading || value === null ? (
          <ActivityIndicator
            testID="metric-loading"
            size="small"
            color={color}
          />
        ) : (
          <>
            <Text style={[styles.value, { color }]}>
              {formatValue(value, decimals)}
            </Text>
            <Text style={styles.unit}>{unit}</Text>
          </>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    minHeight: 32,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
  },
  unit: {
    fontSize: 14,
    color: '#999',
    marginLeft: 4,
  },
});
