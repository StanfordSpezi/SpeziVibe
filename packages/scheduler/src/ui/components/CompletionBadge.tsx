/**
 * CompletionBadge - Status indicator for events
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Event } from '../../types';
import { SchedulerUITheme, defaultLightTheme } from '../theme';

export interface CompletionBadgeProps {
  event: Event;
  theme?: SchedulerUITheme;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const CompletionBadge = React.memo(function CompletionBadge({
  event,
  theme = defaultLightTheme,
  style,
  textStyle,
}: CompletionBadgeProps) {
  const isCompleted = !!event.outcome;

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={isCompleted ? 'Completed' : 'Pending'}
      style={[
        styles.badge,
        {
          backgroundColor: isCompleted
            ? theme.colors.completedBackground
            : theme.colors.pendingBackground,
        },
        style,
      ]}>
      <Text
        style={[
          styles.text,
          {
            color: isCompleted
              ? theme.colors.completedText
              : theme.colors.pendingText,
          },
          textStyle,
        ]}>
        {isCompleted ? 'Completed' : 'Pending'}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
