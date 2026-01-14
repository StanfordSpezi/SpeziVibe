/**
 * Health Theme
 *
 * Default themes for health UI components.
 */

import type { HealthTheme, PartialHealthTheme } from '../types';

export const defaultLightHealthTheme: HealthTheme = {
  colors: {
    background: '#f5f5f5',
    cardBackground: '#ffffff',
    text: '#000000',
    secondaryText: '#666666',
    accent: '#007AFF',
    border: '#e0e0e0',
    steps: '#34C759',
    heartRate: '#FF3B30',
    activeEnergy: '#FF9500',
    sleep: '#5856D6',
  },
  borderRadius: 12,
  spacing: {
    cardPadding: 16,
    cardGap: 12,
  },
};

export const defaultDarkHealthTheme: HealthTheme = {
  colors: {
    background: '#000000',
    cardBackground: '#1c1c1e',
    text: '#ffffff',
    secondaryText: '#8e8e93',
    accent: '#0A84FF',
    border: '#38383a',
    steps: '#30D158',
    heartRate: '#FF453A',
    activeEnergy: '#FF9F0A',
    sleep: '#5E5CE6',
  },
  borderRadius: 12,
  spacing: {
    cardPadding: 16,
    cardGap: 12,
  },
};

/**
 * Merge a partial theme with a base theme
 */
export function mergeHealthTheme(
  base: HealthTheme,
  partial: PartialHealthTheme
): HealthTheme {
  return {
    colors: {
      ...base.colors,
      ...partial.colors,
    },
    borderRadius: partial.borderRadius ?? base.borderRadius,
    spacing: {
      ...base.spacing,
      ...partial.spacing,
    },
  };
}
