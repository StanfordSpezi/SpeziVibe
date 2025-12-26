/**
 * EventCard - Card display for a scheduled event
 */

import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Event } from '../../types';
import { formatTime, isAllowedToComplete } from '../../utils';
import { SchedulerUITheme, defaultLightTheme } from '../theme';
import { CompletionBadge } from './CompletionBadge';

export interface EventCardProps {
  event: Event;
  onPress?: (event: Event) => void;
  theme?: SchedulerUITheme;
  style?: ViewStyle;
  renderIcon?: (event: Event, isCompleted: boolean) => React.ReactNode;
  renderTime?: (event: Event) => React.ReactNode;
  showCompletionBadge?: boolean;
}

export const EventCard = React.memo(function EventCard({
  event,
  onPress,
  theme = defaultLightTheme,
  style,
  renderIcon,
  renderTime,
  showCompletionBadge = true,
}: EventCardProps) {
  const isCompleted = !!event.outcome;
  const canComplete = isAllowedToComplete(event);
  const isDisabled = !isCompleted && !canComplete;

  const handlePress = useCallback(() => {
    onPress?.(event);
  }, [onPress, event]);

  return (
    <Pressable
      onPress={handlePress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${event.task.title}. ${isCompleted ? 'Completed' : canComplete ? 'Tap to complete' : 'Not yet available'}`}
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.cardBorder,
          opacity: pressed ? 0.7 : isDisabled ? theme.colors.disabledOpacity : 1,
        },
        style,
      ]}>
      <View style={styles.header}>
        {renderIcon ? (
          renderIcon(event, isCompleted)
        ) : (
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: isCompleted
                  ? theme.colors.iconBackgroundCompleted
                  : theme.colors.iconBackgroundPending,
              },
            ]}>
            <Text
              style={[
                styles.iconText,
                {
                  color: isCompleted
                    ? theme.colors.iconColorCompleted
                    : theme.colors.iconColorPending,
                },
              ]}>
              {getCategoryIcon(event.task.category)}
            </Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={[styles.title, { color: theme.colors.primaryText }]}>
            {event.task.title}
          </Text>
          <Text style={[styles.description, { color: theme.colors.secondaryText }]}>
            {event.task.instructions}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        {renderTime ? (
          renderTime(event)
        ) : (
          <View style={styles.timeContainer}>
            <Text style={[styles.time, { color: theme.colors.accentText }]}>
              {formatTime(event.occurrence.scheduledDate)}
            </Text>
          </View>
        )}
        {showCompletionBadge && <CompletionBadge event={event} theme={theme} />}
      </View>
    </Pressable>
  );
});

function getCategoryIcon(category: string): string {
  switch (category) {
    case 'questionnaire':
      return '📋';
    case 'task':
      return '✓';
    case 'reminder':
      return '🔔';
    case 'measurement':
      return '❤️';
    default:
      return '📅';
  }
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
  },
});
