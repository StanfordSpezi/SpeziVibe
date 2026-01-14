# @spezivibe/healthkit

A React Native package for Apple HealthKit integration in Expo apps. Provides configurable health data collection, React hooks, and pre-built UI components. Built on [@kingstinct/react-native-healthkit](https://github.com/kingstinct/react-native-healthkit).

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Components](#components)
- [Hooks](#hooks)
- [Theming](#theming)
- [API Reference](#api-reference)
- [Sample Types](#sample-types)
- [Platform Support](#platform-support)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Features

- **50+ Health Metrics** - Steps, heart rate, sleep, blood glucose, and more
- **Configurable Collection** - Declarative API to specify which data to collect
- **React Hooks** - `useHealthKit` and `useHealthMetric` for easy data access
- **Pre-built UI** - Ready-to-use `HealthView` dashboard and `MetricCard` components
- **Expo Go Detection** - Automatic fallback UI when running in Expo Go
- **TypeScript** - Full TypeScript support with exported types
- **Theming** - Customizable theme system

## Requirements

> **Important:** HealthKit requires a **custom development build**. It will NOT work in Expo Go.

- **iOS only** - HealthKit is an Apple-only framework
- **Expo SDK 52+** - Uses native modules
- **Custom dev client** - Requires `npx expo run:ios` or EAS Build
- **Physical device recommended** - Simulator has limited HealthKit support

## Installation

```bash
npm install @spezivibe/healthkit @kingstinct/react-native-healthkit react-native-nitro-modules
```

### Peer Dependencies

```json
{
  "react": ">=18.0.0",
  "react-native": ">=0.70.0",
  "expo": ">=52.0.0",
  "expo-constants": ">=17.0.0"
}
```

### Expo Configuration

Add the HealthKit plugin to your `app.config.js` or `app.json`:

```javascript
// app.config.js
export default {
  expo: {
    // ... other config
    plugins: [
      [
        "@kingstinct/react-native-healthkit",
        {
          NSHealthShareUsageDescription: "This app needs access to your health data to display your fitness metrics.",
          NSHealthUpdateUsageDescription: "This app needs permission to save health data."
        }
      ]
    ]
  }
};
```

### Building for iOS

Since HealthKit requires native code, you must create a custom development build:

```bash
# Create native iOS project and run on device/simulator
npx expo prebuild --platform ios
npx expo run:ios

# Or use EAS Build for cloud builds
eas build --platform ios --profile development
```

## Quick Start

### 1. Create Configuration

Create a configuration file specifying which health data to collect:

```typescript
// lib/healthkit-config.ts
import { HealthKitConfig, SampleType } from '@spezivibe/healthkit';

export const healthKitConfig: HealthKitConfig = {
  // Health data to actively collect and display
  collect: [
    SampleType.stepCount,
    SampleType.heartRate,
    SampleType.activeEnergyBurned,
    SampleType.sleepAnalysis,
  ],
  // Read-only access (request permission but don't display by default)
  readOnly: [],
  // Enable background delivery for specific types
  backgroundDelivery: [],
  // Optional: sync to backend (requires backend integration)
  syncToBackend: false,
};
```

### 2. Add Provider

Wrap your app (or relevant screens) with `HealthKitProvider`:

```tsx
// App.tsx or _layout.tsx
import { HealthKitProvider } from '@spezivibe/healthkit';
import { healthKitConfig } from './lib/healthkit-config';

export default function RootLayout() {
  return (
    <HealthKitProvider config={healthKitConfig}>
      {/* Your app content */}
    </HealthKitProvider>
  );
}
```

### 3. Display Health Data

Use the pre-built `HealthView` component:

```tsx
// app/(tabs)/health.tsx
import { HealthView } from '@spezivibe/healthkit';
import { healthKitConfig } from '../lib/healthkit-config';

export default function HealthScreen() {
  return <HealthView config={healthKitConfig} />;
}
```

That's it! The `HealthView` component handles authorization prompts, displays configured metrics, and shows a fallback UI if running in Expo Go.

## Configuration

### HealthKitConfig

The configuration object controls which health data your app collects:

```typescript
interface HealthKitConfig {
  /** Health data types to collect and display */
  collect: SampleType[];

  /** Types with read-only access (permission requested but not displayed) */
  readOnly: SampleType[];

  /** Types to receive background delivery updates */
  backgroundDelivery: SampleType[];

  /** Whether to sync health data to backend */
  syncToBackend: boolean;
}
```

### Example Configurations

#### Fitness App

```typescript
const fitnessConfig: HealthKitConfig = {
  collect: [
    SampleType.stepCount,
    SampleType.activeEnergyBurned,
    SampleType.distanceWalkingRunning,
    SampleType.flightsClimbed,
    SampleType.workoutType,
  ],
  readOnly: [],
  backgroundDelivery: [SampleType.stepCount],
  syncToBackend: false,
};
```

#### Health Monitoring App

```typescript
const healthMonitorConfig: HealthKitConfig = {
  collect: [
    SampleType.heartRate,
    SampleType.bloodPressureSystolic,
    SampleType.bloodPressureDiastolic,
    SampleType.oxygenSaturation,
    SampleType.respiratoryRate,
  ],
  readOnly: [SampleType.bodyMass, SampleType.height],
  backgroundDelivery: [SampleType.heartRate],
  syncToBackend: true,
};
```

#### Diabetes Management App

```typescript
const diabetesConfig: HealthKitConfig = {
  collect: [
    SampleType.bloodGlucose,
    SampleType.insulinDelivery,
    SampleType.dietaryCarbohydrates,
  ],
  readOnly: [],
  backgroundDelivery: [SampleType.bloodGlucose],
  syncToBackend: true,
};
```

## Components

### HealthView

The main dashboard component that displays all configured health metrics.

```tsx
import { HealthView } from '@spezivibe/healthkit';

<HealthView
  config={healthKitConfig}        // Required: configuration object
  theme={customTheme}             // Optional: custom theme
  containerStyle={{ padding: 16 }} // Optional: container style
  onAuthorizationComplete={(success) => console.log('Auth:', success)} // Optional
/>
```

**Features:**
- Handles HealthKit authorization prompt
- Displays metric cards for all configured types
- Shows Expo Go fallback automatically
- Supports pull-to-refresh

### MetricCard

Individual metric display card.

```tsx
import { MetricCard } from '@spezivibe/healthkit';
import { SampleType } from '@spezivibe/healthkit';

<MetricCard
  type={SampleType.stepCount}     // Required: sample type
  value={5432}                    // Current value (null = loading)
  theme={customTheme}             // Optional: custom theme
  style={{ marginBottom: 12 }}   // Optional: card style
  onPress={() => console.log('tapped')} // Optional: tap handler
/>
```

### ExpoGoFallback

Fallback UI shown when running in Expo Go.

```tsx
import { ExpoGoFallback } from '@spezivibe/healthkit';

<ExpoGoFallback
  message="Custom message here"   // Optional: custom message
  style={{ padding: 24 }}        // Optional: container style
/>
```

Or provide a custom fallback to `HealthKitProvider`:

```tsx
<HealthKitProvider
  config={healthKitConfig}
  expoGoFallback={<MyCustomFallback />}
>
  {children}
</HealthKitProvider>
```

## Hooks

### useHealthKit

Main hook for HealthKit operations.

```tsx
import { useHealthKit } from '@spezivibe/healthkit';

function MyComponent() {
  const {
    isAvailable,        // boolean: HealthKit available on this device
    isAuthorized,       // boolean: user has granted permission
    isLoading,          // boolean: authorization in progress
    error,              // Error | null: any error that occurred
    requestAuthorization, // () => Promise<boolean>: request permission
    getTodayValue,      // (type: SampleType) => Promise<number>
    getMostRecent,      // (type: SampleType) => Promise<HealthSample | null>
  } = useHealthKit();

  const handlePress = async () => {
    const success = await requestAuthorization();
    if (success) {
      const steps = await getTodayValue(SampleType.stepCount);
      console.log('Today steps:', steps);
    }
  };

  if (!isAvailable) {
    return <Text>HealthKit not available</Text>;
  }

  return (
    <Button
      title={isAuthorized ? "Authorized" : "Request Access"}
      onPress={handlePress}
      disabled={isLoading}
    />
  );
}
```

### useHealthMetric

Hook for a single health metric with automatic updates.

```tsx
import { useHealthMetric } from '@spezivibe/healthkit';
import { SampleType } from '@spezivibe/healthkit';

function StepsDisplay() {
  const {
    value,      // number | null: current value
    unit,       // string: unit for this type (e.g., "count", "count/min")
    label,      // string: display label (e.g., "Steps", "Heart Rate")
    isLoading,  // boolean: data loading
    error,      // Error | null: any error
    refresh,    // () => void: manually refresh data
  } = useHealthMetric(SampleType.stepCount);

  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <Text>
      {label}: {value?.toLocaleString() ?? '--'} {unit}
    </Text>
  );
}
```

**With refresh interval:**

```tsx
// Refresh every 30 seconds
const { value } = useHealthMetric(SampleType.heartRate, {
  refreshInterval: 30000,
});
```

## Theming

### Using Default Theme

```tsx
import { HealthView, defaultHealthTheme } from '@spezivibe/healthkit';

<HealthView config={config} theme={defaultHealthTheme} />
```

### Custom Theme

```tsx
import { HealthView, mergeHealthTheme } from '@spezivibe/healthkit';

const customTheme = mergeHealthTheme({
  colors: {
    primary: '#007AFF',
    background: '#F5F5F5',
    cardBackground: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    success: '#34C759',
    error: '#FF3B30',
  },
  borderRadius: 16,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  },
});

<HealthView config={config} theme={customTheme} />
```

### Theme Structure

```typescript
interface HealthTheme {
  colors: {
    primary: string;
    background: string;
    cardBackground: string;
    text: string;
    textSecondary: string;
    success: string;
    error: string;
    border: string;
  };
  borderRadius: number;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
  };
  fontSize: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}
```

## API Reference

### HealthKitService

Low-level service for direct HealthKit access (used internally by hooks).

```typescript
import { HealthKitService } from '@spezivibe/healthkit';

// Check availability
const available = HealthKitService.isAvailable();

// Request authorization
const authorized = await HealthKitService.requestAuthorization([
  SampleType.stepCount,
  SampleType.heartRate,
]);

// Get most recent sample
const sample = await HealthKitService.getMostRecentSample(SampleType.heartRate);
// Returns: { value: 72, unit: 'count/min', startDate: Date, endDate: Date }

// Get today's total for cumulative types
const steps = await HealthKitService.getTodaySteps();
const calories = await HealthKitService.getTodayActiveEnergy();
```

### Exported Types

```typescript
// Configuration
export interface HealthKitConfig { ... }

// Health sample data
export interface HealthSample {
  value: number;
  unit: string;
  startDate: Date;
  endDate: Date;
  sourceName?: string;
}

// Theme
export interface HealthTheme { ... }
export type PartialHealthTheme = DeepPartial<HealthTheme>;

// Sample type enum
export enum SampleType { ... }
```

### Utility Functions

```typescript
// Get unit for a sample type
import { getUnitForType } from '@spezivibe/healthkit';
getUnitForType(SampleType.stepCount); // 'count'
getUnitForType(SampleType.heartRate); // 'count/min'

// Get display label for a sample type
import { getLabelForType } from '@spezivibe/healthkit';
getLabelForType(SampleType.stepCount); // 'Steps'
getLabelForType(SampleType.heartRate); // 'Heart Rate'

// Check if running in Expo Go
import { isExpoGo, isStandalone } from '@spezivibe/healthkit';
if (isExpoGo()) {
  console.log('Running in Expo Go - HealthKit unavailable');
}
```

## Sample Types

The package supports 50+ HealthKit sample types. Here are the most common:

### Activity

| SampleType | Identifier | Unit |
|------------|------------|------|
| `stepCount` | `HKQuantityTypeIdentifierStepCount` | count |
| `activeEnergyBurned` | `HKQuantityTypeIdentifierActiveEnergyBurned` | kcal |
| `distanceWalkingRunning` | `HKQuantityTypeIdentifierDistanceWalkingRunning` | m |
| `flightsClimbed` | `HKQuantityTypeIdentifierFlightsClimbed` | count |
| `appleExerciseTime` | `HKQuantityTypeIdentifierAppleExerciseTime` | min |

### Vitals

| SampleType | Identifier | Unit |
|------------|------------|------|
| `heartRate` | `HKQuantityTypeIdentifierHeartRate` | count/min |
| `restingHeartRate` | `HKQuantityTypeIdentifierRestingHeartRate` | count/min |
| `bloodPressureSystolic` | `HKQuantityTypeIdentifierBloodPressureSystolic` | mmHg |
| `bloodPressureDiastolic` | `HKQuantityTypeIdentifierBloodPressureDiastolic` | mmHg |
| `oxygenSaturation` | `HKQuantityTypeIdentifierOxygenSaturation` | % |
| `respiratoryRate` | `HKQuantityTypeIdentifierRespiratoryRate` | count/min |
| `bodyTemperature` | `HKQuantityTypeIdentifierBodyTemperature` | degC |

### Body Measurements

| SampleType | Identifier | Unit |
|------------|------------|------|
| `bodyMass` | `HKQuantityTypeIdentifierBodyMass` | kg |
| `height` | `HKQuantityTypeIdentifierHeight` | m |
| `bodyMassIndex` | `HKQuantityTypeIdentifierBodyMassIndex` | count |
| `bodyFatPercentage` | `HKQuantityTypeIdentifierBodyFatPercentage` | % |

### Sleep & Mindfulness

| SampleType | Identifier | Unit |
|------------|------------|------|
| `sleepAnalysis` | `HKCategoryTypeIdentifierSleepAnalysis` | category |
| `mindfulSession` | `HKCategoryTypeIdentifierMindfulSession` | min |

### Lab Results

| SampleType | Identifier | Unit |
|------------|------------|------|
| `bloodGlucose` | `HKQuantityTypeIdentifierBloodGlucose` | mg/dL |
| `insulinDelivery` | `HKQuantityTypeIdentifierInsulinDelivery` | IU |

See `sample-types.ts` for the complete list.

## Platform Support

| Platform | Support | Notes |
|----------|---------|-------|
| iOS | ✅ Full | Requires custom dev build |
| Android | ❌ None | HealthKit is iOS-only |
| Web | ❌ None | HealthKit is iOS-only |
| Expo Go | ❌ None | Requires native modules |
| iOS Simulator | ⚠️ Limited | Basic testing only |

### Testing on Simulator

The iOS Simulator has limited HealthKit support:
- Some data types work, others don't
- You can add sample data via: Simulator → Features → Health → Health Data
- For full testing, use a physical iOS device

## Examples

### Basic Health Dashboard

```tsx
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HealthKitProvider, HealthView, SampleType } from '@spezivibe/healthkit';

const config = {
  collect: [SampleType.stepCount, SampleType.heartRate],
  readOnly: [],
  backgroundDelivery: [],
  syncToBackend: false,
};

export default function HealthScreen() {
  return (
    <HealthKitProvider config={config}>
      <SafeAreaView style={{ flex: 1 }}>
        <HealthView config={config} />
      </SafeAreaView>
    </HealthKitProvider>
  );
}
```

### Custom Metric Display

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useHealthMetric, SampleType } from '@spezivibe/healthkit';

function CustomStepsCard() {
  const { value, isLoading, label } = useHealthMetric(SampleType.stepCount);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {isLoading ? '...' : value?.toLocaleString() ?? '--'}
      </Text>
      <Text style={styles.goal}>Goal: 10,000</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, backgroundColor: '#fff', borderRadius: 12 },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 48, fontWeight: 'bold' },
  goal: { fontSize: 12, color: '#999' },
});
```

### Manual Authorization Flow

```tsx
import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useHealthKit, SampleType } from '@spezivibe/healthkit';

function AuthorizationScreen({ onComplete }) {
  const { isAvailable, isAuthorized, requestAuthorization, isLoading } = useHealthKit();

  if (!isAvailable) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>HealthKit is not available on this device</Text>
      </View>
    );
  }

  if (isAuthorized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>✅ HealthKit Access Granted</Text>
        <Button title="Continue" onPress={onComplete} />
      </View>
    );
  }

  const handleRequest = async () => {
    const success = await requestAuthorization();
    if (success) {
      onComplete();
    } else {
      Alert.alert('Permission Denied', 'Please enable HealthKit access in Settings.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        Health Data Access
      </Text>
      <Text style={{ textAlign: 'center', marginBottom: 24, color: '#666' }}>
        This app needs access to your health data to display your fitness metrics.
      </Text>
      <Button
        title={isLoading ? 'Requesting...' : 'Allow Access'}
        onPress={handleRequest}
        disabled={isLoading}
      />
    </View>
  );
}
```

### Multiple Metrics with Refresh

```tsx
import React from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { useHealthMetric, MetricCard, SampleType } from '@spezivibe/healthkit';

const METRICS = [
  SampleType.stepCount,
  SampleType.heartRate,
  SampleType.activeEnergyBurned,
  SampleType.distanceWalkingRunning,
];

function MetricsList() {
  const [refreshing, setRefreshing] = React.useState(false);
  const metrics = METRICS.map(type => ({
    type,
    ...useHealthMetric(type),
  }));

  const handleRefresh = async () => {
    setRefreshing(true);
    metrics.forEach(m => m.refresh());
    setRefreshing(false);
  };

  return (
    <FlatList
      data={metrics}
      keyExtractor={(item) => item.type}
      renderItem={({ item }) => (
        <MetricCard
          type={item.type}
          value={item.value}
          style={{ marginHorizontal: 16, marginVertical: 8 }}
        />
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    />
  );
}
```

## Troubleshooting

### "HealthKit is not available"

**Cause:** Running on Android, web, or iOS Simulator without HealthKit support.

**Solution:** Test on a physical iOS device or check `isAvailable` before accessing HealthKit.

### "This feature requires a custom development build"

**Cause:** Running in Expo Go, which doesn't include native HealthKit modules.

**Solution:** Build a custom development client:
```bash
npx expo prebuild --platform ios
npx expo run:ios
```

### Authorization Request Not Showing

**Cause:** HealthKit authorization dialog may have been dismissed previously.

**Solution:**
1. Check Settings → Privacy → Health → Your App
2. Reset authorization by deleting and reinstalling the app
3. Ensure the correct permission strings are in `app.config.js`

### No Data Showing

**Cause:** No health data exists for the requested types, or authorization was denied for specific types.

**Solution:**
1. Add sample data: Simulator → Features → Health → Health Data
2. On device: Use the Health app to add data
3. Check authorization status for specific types in Settings

### Type Errors with SampleType

**Cause:** Using string literals instead of the `SampleType` enum.

**Solution:**
```typescript
// ❌ Wrong
const steps = await getMostRecent('stepCount');

// ✅ Correct
import { SampleType } from '@spezivibe/healthkit';
const steps = await getMostRecent(SampleType.stepCount);
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT
