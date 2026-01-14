import React, { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react-native';
import { HealthKitProvider } from '../providers';
import type { HealthKitConfig } from '../types';
import { SampleType } from '../sample-types';

export const defaultTestConfig: HealthKitConfig = {
  collect: [SampleType.stepCount, SampleType.heartRate],
  readOnly: [],
  backgroundDelivery: [],
  syncToBackend: false,
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  config?: HealthKitConfig;
  autoRequest?: boolean;
}

export function renderWithHealthKit(
  ui: ReactElement,
  { config = defaultTestConfig, autoRequest = false, ...options }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <HealthKitProvider config={config} autoRequest={autoRequest}>
        {children}
      </HealthKitProvider>
    );
  }
  return render(ui, { wrapper: Wrapper, ...options });
}

export function createWrapper(options: { autoRequest?: boolean; config?: HealthKitConfig } = {}) {
  const { autoRequest = false, config = defaultTestConfig } = options;

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <HealthKitProvider config={config} autoRequest={autoRequest}>
        {children}
      </HealthKitProvider>
    );
  };
}

export function createMockSample(type: SampleType, value: number) {
  return {
    value,
    unit: 'count',
    startDate: new Date(),
    endDate: new Date(),
    sourceName: 'Test App',
  };
}
