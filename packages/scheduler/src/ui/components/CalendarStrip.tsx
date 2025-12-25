import React, { useMemo } from 'react';
import { ScrollView, View, Pressable, StyleSheet, Text, Platform } from 'react-native';
import { SchedulerUITheme, defaultLightTheme } from '../theme';

interface CalendarDay {
  date: Date;
  dayOfWeek: string;
  dayOfMonth: number;
  isToday: boolean;
}

interface CalendarStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  theme?: SchedulerUITheme;
  /** Number of days to show (default: 30) */
  daysCount?: number;
  /** Starting offset in days from today (default: -1, starts from yesterday) */
  startOffset?: number;
}

function generateDays(startDate: Date, count: number): CalendarDay[] {
  const days: CalendarDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    date.setHours(0, 0, 0, 0);

    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayOfMonth = date.getDate();
    const isToday = date.getTime() === today.getTime();

    days.push({ date, dayOfWeek, dayOfMonth, isToday });
  }

  return days;
}

export const CalendarStrip = React.memo(function CalendarStrip({
  selectedDate,
  onSelectDate,
  theme = defaultLightTheme,
  daysCount = 30,
  startOffset = -1,
}: CalendarStripProps) {
  // Generate days starting from the specified offset - memoized for performance
  const startDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + startOffset);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [startOffset]);

  const days = useMemo(
    () => generateDays(startDate, daysCount),
    [startDate, daysCount]
  );

  const selectedDateKey = selectedDate.toDateString();


  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={Platform.OS === 'web'}
        contentContainerStyle={styles.scrollContent}>
        {days.map((day, index) => {
          const isSelected = day.date.toDateString() === selectedDateKey;

          return (
            <Pressable
              key={index}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`${day.dayOfWeek} ${day.dayOfMonth}${day.isToday ? ', today' : ''}${isSelected ? ', selected' : ''}`}
              accessibilityState={{ selected: isSelected }}
              style={({ pressed }) => [
                styles.dayContainer,
                {
                  backgroundColor: isSelected
                    ? theme.colors.primary
                    : pressed
                    ? theme.colors.cardPressed
                    : theme.colors.cardBackground,
                  borderColor: day.isToday
                    ? theme.colors.primary
                    : theme.colors.border,
                },
              ]}
              onPress={() => onSelectDate(day.date)}>
              <Text
                style={[
                  styles.dayOfWeek,
                  {
                    color: isSelected
                      ? theme.colors.selectedText
                      : theme.colors.mutedText,
                  },
                ]}>
                {day.dayOfWeek}
              </Text>
              <Text
                style={[
                  styles.dayOfMonth,
                  {
                    color: isSelected
                      ? theme.colors.selectedText
                      : day.isToday
                      ? theme.colors.primary
                      : theme.colors.secondaryText,
                  },
                ]}>
                {day.dayOfMonth}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dayContainer: {
    width: 56,
    height: 70,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  dayOfWeek: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dayOfMonth: {
    fontSize: 20,
    fontWeight: '700',
  },
});
