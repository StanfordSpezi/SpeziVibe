import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PaginationDotsProps } from '../types';
import { DEFAULT_COLORS } from '../constants';

/**
 * Pagination dots indicator for multi-step onboarding flows.
 *
 * @example
 * ```tsx
 * <PaginationDots
 *   total={3}
 *   current={1}
 *   isDark={colorScheme === 'dark'}
 * />
 * ```
 */
export function PaginationDots({
  total,
  current,
  isDark = false,
  colors = DEFAULT_COLORS,
  style,
}: PaginationDotsProps) {
  const activeColor = isDark ? colors.primaryDark : colors.primaryLight;
  const inactiveColor = isDark ? colors.inactiveDark : colors.inactiveLight;

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: index === current ? activeColor : inactiveColor,
              width: index === current ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
