import React from 'react';
import { StyleSheet, useColorScheme, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  HealthKitProvider,
  HealthView,
  ExpoGoFallback,
  defaultLightHealthTheme,
  defaultDarkHealthTheme,
} from '@spezivibe/healthkit';
import { healthKitConfig } from '@/lib/healthkit-config';

export default function HealthScreen() {
  const colorScheme = useColorScheme();
  const theme =
    colorScheme === 'dark' ? defaultDarkHealthTheme : defaultLightHealthTheme;

  // HealthKit is iOS only
  if (Platform.OS !== 'ios') {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <HealthView />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <HealthKitProvider
        config={healthKitConfig}
        expoGoFallback={<ExpoGoFallback />}
      >
        <HealthView showHeader title="Health" />
      </HealthKitProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
