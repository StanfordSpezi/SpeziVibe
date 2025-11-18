/**
 * EventList - Scrollable list of events with empty state
 */

import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, ViewStyle, ScrollViewProps } from 'react-native';
import { Event } from '../../types';
import { SchedulerUITheme, defaultLightTheme } from '../theme';
import { EventCard, EventCardProps } from './EventCard';

export interface EventListProps {
  events: Event[];
  onEventPress?: (event: Event) => void;
  theme?: SchedulerUITheme;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  EmptyComponent?: React.ComponentType;
  renderEvent?: (event: Event, index: number) => React.ReactNode;
  eventCardProps?: Partial<EventCardProps>;
  scrollViewProps?: Partial<ScrollViewProps>;
}

export const EventList = React.memo(function EventList({
  events,
  onEventPress,
  theme = defaultLightTheme,
  style,
  contentContainerStyle,
  EmptyComponent,
  renderEvent,
  eventCardProps,
  scrollViewProps,
}: EventListProps) {
  // Sort events by scheduled time - memoized for performance
  const sortedEvents = useMemo(
    () => [...events].sort(
      (a, b) => a.occurrence.scheduledDate.getTime() - b.occurrence.scheduledDate.getTime()
    ),
    [events]
  );

  return (
    <ScrollView
      style={[styles.scrollView, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      {...scrollViewProps}>
      {sortedEvents.length === 0 ? (
        EmptyComponent ? (
          <EmptyComponent />
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyIcon, { color: theme.colors.secondaryText }]}>
              📅
            </Text>
            <Text style={[styles.emptyText, { color: theme.colors.secondaryText }]}>
              No scheduled tasks for this day
            </Text>
          </View>
        )
      ) : (
        sortedEvents.map((event, index) =>
          renderEvent ? (
            <View key={`event-${event.task.id}-${event.occurrence.index}-${index}`}>
              {renderEvent(event, index)}
            </View>
          ) : (
            <EventCard
              key={`event-${event.task.id}-${event.occurrence.index}-${index}`}
              event={event}
              onPress={onEventPress}
              theme={theme}
              {...eventCardProps}
            />
          )
        )
      )}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
