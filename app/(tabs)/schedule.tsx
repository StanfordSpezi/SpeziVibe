import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Pressable, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useScheduler, Event, formatTime } from '@/lib/scheduler';
import { CalendarStrip } from '@/components/calendar-strip';

export default function ScheduleScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { scheduler, tasks } = useScheduler();
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadEvents();
  }, [tasks, refreshKey, selectedDate]);

  // Refresh when screen comes into focus (returning from questionnaire)
  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [selectedDate])
  );

  const loadEvents = () => {
    // Get events for the selected date only
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const queriedEvents = scheduler.queryEvents(startOfDay, endOfDay);
    setEvents(queriedEvents);
  };

  const handleEventPress = async (event: Event) => {
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
              await scheduler.uncompleteEvent(event);
              setRefreshKey((k) => k + 1);
            },
          },
        ]
      );
    } else {
      // Check if this is a questionnaire task
      if (event.task.category === 'questionnaire' && event.task.questionnaireId) {
        // Check completion policy before allowing navigation
        try {
          // Test if we can complete (will throw error if outside window)
          const { isAllowedToComplete } = await import('@/lib/scheduler');
          if (!isAllowedToComplete(event)) {
            throw new Error('Outside completion window');
          }

          // Navigate to questionnaire screen
          router.push({
            pathname: '/questionnaire/[id]',
            params: {
              id: event.task.questionnaireId,
              taskId: event.task.id,
              eventId: event.occurrence.index.toString(),
            },
          });
        } catch (error) {
          Alert.alert('Cannot Complete', 'This task can only be completed within its scheduled time window.');
        }
      } else {
        // Complete the event directly
        try {
          await scheduler.completeEvent(event);
          setRefreshKey((k) => k + 1);
        } catch (error) {
          Alert.alert('Cannot Complete', 'This task cannot be completed at this time.');
        }
      }
    }
  };


  const getEventIcon = (event: Event) => {
    if (event.outcome) {
      return 'checkmark.circle.fill';
    }

    switch (event.task.category) {
      case 'questionnaire':
        return 'doc.text.fill';
      case 'task':
        return 'checkmark.circle.fill';
      case 'reminder':
        return 'bell.fill';
      case 'measurement':
        return 'heart.text.square.fill';
      default:
        return 'calendar';
    }
  };

  const getDateLabel = (date: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);

    if (selected.getTime() === today.getTime()) {
      return 'Today';
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  // Sort events by time
  const sortedEvents = [...events].sort(
    (a, b) => a.occurrence.scheduledDate.getTime() - b.occurrence.scheduledDate.getTime()
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Schedule
        </ThemedText>
      </View>

      <CalendarStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <View style={styles.dateInfo}>
        <ThemedText style={styles.dateLabel}>{getDateLabel(selectedDate)}</ThemedText>
        <ThemedText style={styles.completionText}>
          {events.filter((e) => e.outcome).length} of {events.length} completed
        </ThemedText>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {sortedEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="calendar.badge.checkmark" size={48} color={isDark ? '#666' : '#999'} />
            <ThemedText style={styles.emptyText}>No scheduled tasks for this day</ThemedText>
          </View>
        ) : (
          sortedEvents.map((event, eventIndex) => (
            <Pressable
              key={`event-${event.task.id}-${event.occurrence.index}-${eventIndex}`}
              style={({ pressed }) => [
                styles.eventCard,
                {
                  backgroundColor: isDark ? '#1D1D1D' : '#fff',
                  opacity: pressed ? 0.7 : 1,
                  borderColor: isDark ? '#333' : '#e0e0e0',
                },
              ]}
              onPress={() => handleEventPress(event)}>
              <View style={styles.eventHeader}>
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: event.outcome
                        ? isDark
                          ? '#2D5F3F'
                          : '#D4EDDA'
                        : isDark
                        ? '#B83A4B'
                        : '#8C1515',
                    },
                  ]}>
                  <IconSymbol
                    name={getEventIcon(event)}
                    size={24}
                    color={
                      event.outcome
                        ? isDark
                          ? '#7FD99B'
                          : '#28A745'
                        : isDark
                        ? '#000'
                        : '#fff'
                    }
                  />
                </View>
                <View style={styles.eventInfo}>
                  <ThemedText type="defaultSemiBold" style={styles.eventTitle}>
                    {event.task.title}
                  </ThemedText>
                  <ThemedText style={styles.eventDescription}>
                    {event.task.instructions}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.eventFooter}>
                <View style={styles.timeContainer}>
                  <IconSymbol name="clock.fill" size={16} color={isDark ? '#B83A4B' : '#8C1515'} />
                  <ThemedText type="defaultSemiBold" style={styles.timeText}>
                    {formatTime(event.occurrence.scheduledDate)}
                  </ThemedText>
                </View>
                {!event.outcome && (
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: isDark ? '#4A3B1C' : '#FFF3CD' },
                    ]}>
                    <ThemedText
                      style={[styles.statusText, { color: isDark ? '#FFD966' : '#856404' }]}>
                      Pending
                    </ThemedText>
                  </View>
                )}
                {event.outcome && (
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: isDark ? '#2D5F3F' : '#D4EDDA' },
                    ]}>
                    <ThemedText
                      style={[styles.statusText, { color: isDark ? '#7FD99B' : '#155724' }]}>
                      Completed
                    </ThemedText>
                  </View>
                )}
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 12,
  },
  title: {
    fontSize: 34,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
  eventCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 17,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 15,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
