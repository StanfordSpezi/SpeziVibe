/**
 * ExpoGoFallback Component
 *
 * Displayed when running in Expo Go where HealthKit is not available.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface ExpoGoFallbackProps {
  /** Custom message to display */
  message?: string;
  /** Custom title */
  title?: string;
}

export function ExpoGoFallback({
  title = 'HealthKit Unavailable',
  message = 'HealthKit requires a custom development build and is not available in Expo Go.',
}: ExpoGoFallbackProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.commandBox}>
        <Text style={styles.commandLabel}>Run this command to build:</Text>
        <Text style={styles.command}>npx expo run:ios</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  commandBox: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  commandLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  command: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#4ade80',
  },
});
