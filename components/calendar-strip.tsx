import { ScrollView, View, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CalendarDay {
  date: Date;
  dayOfWeek: string;
  dayOfMonth: number;
  isToday: boolean;
}

interface CalendarStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
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

export function CalendarStrip({ selectedDate, onSelectDate }: CalendarStripProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Generate 30 days starting from yesterday
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 1);
  startDate.setHours(0, 0, 0, 0);

  const days = generateDays(startDate, 30);

  const selectedDateKey = selectedDate.toDateString();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {days.map((day, index) => {
          const isSelected = day.date.toDateString() === selectedDateKey;

          return (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.dayContainer,
                {
                  backgroundColor: isSelected
                    ? isDark
                      ? '#B83A4B'
                      : '#8C1515'
                    : pressed
                    ? isDark
                      ? '#1D1D1D'
                      : '#F5F5F5'
                    : isDark
                    ? '#0D0D0D'
                    : '#fff',
                  borderColor: day.isToday
                    ? isDark
                      ? '#B83A4B'
                      : '#8C1515'
                    : isDark
                    ? '#2D2D2D'
                    : '#E5E5E5',
                },
              ]}
              onPress={() => onSelectDate(day.date)}>
              <ThemedText
                style={[
                  styles.dayOfWeek,
                  {
                    color: isSelected
                      ? isDark
                        ? '#000'
                        : '#fff'
                      : isDark
                      ? '#999'
                      : '#666',
                  },
                ]}>
                {day.dayOfWeek}
              </ThemedText>
              <ThemedText
                style={[
                  styles.dayOfMonth,
                  {
                    color: isSelected
                      ? isDark
                        ? '#000'
                        : '#fff'
                      : day.isToday
                      ? isDark
                        ? '#B83A4B'
                        : '#8C1515'
                      : isDark
                      ? '#fff'
                      : '#000',
                  },
                ]}>
                {day.dayOfMonth}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

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
