/**
 * useScheduleScreen - Hook for managing schedule screen state and interactions
 *
 * Provides reusable logic for date selection, event loading, and event interactions
 * that are common across schedule screen implementations.
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Event } from '../types';
import { Scheduler } from '../services/Scheduler';

export interface UseScheduleScreenOptions {
  /** Scheduler instance (null during initialization) */
  scheduler: Scheduler | null;
  /** Tasks array (used as dependency for reloading events) */
  tasks: any[];
  /** Optional callback when an event needs custom handling (e.g., opening questionnaire) */
  onEventAction?: (event: Event) => Promise<void> | void;
  /** Initial selected date (defaults to today) */
  initialDate?: Date;
}

export interface UseScheduleScreenReturn {
  /** Currently selected date */
  selectedDate: Date;
  /** Set the selected date */
  setSelectedDate: (date: Date) => void;
  /** Events for the selected date */
  events: Event[];
  /** Reload events from scheduler */
  refreshEvents: () => void;
  /** Get completion count for selected date */
  completedCount: number;
  /** Total event count for selected date */
  totalCount: number;
}

/**
 * Hook for managing schedule screen state
 *
 * @example
 * ```tsx
 * function ScheduleScreen() {
 *   const { scheduler, tasks } = useScheduler();
 *   const {
 *     selectedDate,
 *     setSelectedDate,
 *     events,
 *     completedCount,
 *     totalCount,
 *   } = useScheduleScreen({ scheduler, tasks });
 *
 *   return (
 *     <>
 *       <CalendarStrip
 *         selectedDate={selectedDate}
 *         onSelectDate={setSelectedDate}
 *       />
 *       <Text>{completedCount} of {totalCount} completed</Text>
 *       <EventList events={events} />
 *     </>
 *   );
 * }
 * ```
 */
export function useScheduleScreen({
  scheduler,
  tasks,
  onEventAction,
  initialDate,
}: UseScheduleScreenOptions): UseScheduleScreenReturn {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (initialDate) return initialDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load events for selected date
  const loadEvents = useCallback(() => {
    if (!scheduler) {
      setEvents([]);
      return;
    }

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const queriedEvents = scheduler.queryEvents(startOfDay, endOfDay);
    setEvents(queriedEvents);
  }, [scheduler, selectedDate]);

  // Reload events when dependencies change
  useEffect(() => {
    loadEvents();
  }, [loadEvents, tasks, refreshKey]);

  // Force refresh events
  const refreshEvents = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Calculate completion stats - memoized for performance
  const completedCount = useMemo(
    () => events.filter((e) => e.outcome).length,
    [events]
  );

  const totalCount = events.length;

  return {
    selectedDate,
    setSelectedDate,
    events,
    refreshEvents,
    completedCount,
    totalCount,
  };
}
