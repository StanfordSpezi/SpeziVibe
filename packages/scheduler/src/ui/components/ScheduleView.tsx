/**
 * ScheduleView - Complete schedule screen component
 *
 * A ready-to-use schedule view that includes calendar, date info, and event list.
 * Handles all event interactions internally with optional callbacks for customization.
 */

import React, { useCallback, useEffect, useMemo, ReactNode } from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import Alert from '@blazejkustra/react-native-alert';
import { Event } from '../../types';
import { useScheduler } from '../../hooks/useScheduler';
import { useScheduleScreen } from '../../hooks/useScheduleScreen';
import { isAllowedToComplete } from '../../utils/calculations';
import { getDateLabel } from '../../utils/formatting';
import { SchedulerUITheme, defaultLightTheme, defaultDarkTheme } from '../theme';
import { CalendarStrip } from './CalendarStrip';
import { EventList } from './EventList';

export interface ScheduleViewProps {
  /** Theme to use (defaults to light theme) */
  theme?: SchedulerUITheme;
  /** Whether to use dark theme (auto-selects dark/light theme) */
  isDark?: boolean;
  /** Custom callback for handling questionnaire events */
  onQuestionnaireOpen?: (event: Event) => void | Promise<void>;
  /** Custom callback for handling any event press (overrides default behavior) */
  onEventPress?: (event: Event) => void | Promise<void>;
  /** Custom header component (replaces title) */
  renderHeader?: () => ReactNode;
  /** Additional content to show above the calendar */
  headerContent?: ReactNode;
  /** Additional content to show below the date info */
  subHeaderContent?: ReactNode;
  /** Container style */
  style?: ViewStyle;
  /** Text color for date label */
  textColor?: string;
  /** Text color for completion text */
  mutedTextColor?: string;
  /** Optional refresh key - increment to force refresh events */
  refreshKey?: number;
}

/**
 * Complete schedule view with calendar, date info, and event list
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ScheduleView isDark={colorScheme === 'dark'} />
 *
 * // With custom questionnaire handling
 * <ScheduleView
 *   isDark={colorScheme === 'dark'}
 *   onQuestionnaireOpen={(event) => {
 *     router.push({
 *       pathname: '/questionnaire/[id]',
 *       params: { id: event.task.questionnaireId }
 *     });
 *   }}
 * />
 * ```
 */
export function ScheduleView({
  theme: themeProp,
  isDark = false,
  onQuestionnaireOpen,
  onEventPress: onEventPressProp,
  renderHeader,
  headerContent,
  subHeaderContent,
  style,
  textColor,
  mutedTextColor,
  refreshKey,
}: ScheduleViewProps) {
  const { scheduler, tasks } = useScheduler();

  const {
    selectedDate,
    setSelectedDate,
    events,
    refreshEvents,
    completedCount,
    totalCount,
  } = useScheduleScreen({ scheduler, tasks });

  // Refresh when refreshKey changes
  useEffect(() => {
    if (refreshKey !== undefined) {
      refreshEvents();
    }
  }, [refreshKey, refreshEvents]);

  // Auto-select theme if not provided - memoized for performance
  const theme = useMemo(
    () => themeProp || (isDark ? defaultDarkTheme : defaultLightTheme),
    [themeProp, isDark]
  );

  // Default event press handler
  const handleEventPress = useCallback(
    async (event: Event) => {
      // Use custom handler if provided
      if (onEventPressProp) {
        await onEventPressProp(event);
        return;
      }

      // Capture scheduler to help with type narrowing
      const schedulerInstance = scheduler;
      if (!schedulerInstance) return;

      if (event.outcome) {
        // Already completed, ask to uncomplete
        Alert.alert(
          'Uncomplete Task',
          'Do you want to mark this task as incomplete?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Mark Incomplete',
              style: 'destructive',
              onPress: async () => {
                await schedulerInstance.uncompleteEvent(event);
                refreshEvents();
              },
            },
          ]
        );
      } else {
        // Check completion policy first
        const canComplete = isAllowedToComplete(event);

        if (!canComplete) {
          Alert.alert(
            'Cannot Complete Yet',
            'This task can only be completed within its scheduled time window.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Check if this is a questionnaire task
        if (event.task.category === 'questionnaire' && event.task.questionnaireId) {
          if (onQuestionnaireOpen) {
            // Use custom questionnaire handler
            await onQuestionnaireOpen(event);
          } else {
            // Default: just complete the event
            try {
              await schedulerInstance.completeEvent(event);
              refreshEvents();
            } catch {
              Alert.alert('Cannot Complete', 'This task cannot be completed at this time.');
            }
          }
        } else {
          // Complete the event directly
          try {
            await schedulerInstance.completeEvent(event);
            refreshEvents();
          } catch {
            Alert.alert('Cannot Complete', 'This task cannot be completed at this time.');
          }
        }
      }
    },
    [scheduler, onEventPressProp, onQuestionnaireOpen, refreshEvents]
  );

  return (
    <View style={[styles.container, style]}>
      {renderHeader ? (
        renderHeader()
      ) : null}

      {headerContent}

      <CalendarStrip
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        theme={theme}
      />

      <View style={styles.dateInfo}>
        <Text style={[styles.dateLabel, { color: textColor || theme.colors.primaryText }]}>
          {getDateLabel(selectedDate)}
        </Text>
        <Text style={[styles.completionText, { color: mutedTextColor || theme.colors.secondaryText }]}>
          {completedCount} of {totalCount} completed
        </Text>
      </View>

      {subHeaderContent}

      <EventList
        events={events}
        onEventPress={handleEventPress}
        theme={theme}
        style={styles.eventList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateInfo: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dateLabel: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  completionText: {
    fontSize: 14,
    opacity: 0.6,
  },
  eventList: {
    flex: 1,
  },
});
