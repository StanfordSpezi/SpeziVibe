/**
 * Formatting utilities for scheduler
 * Handles date/time formatting and grouping
 */

import { Event } from '../types';

/**
 * Group events by date for display
 */
export function groupEventsByDate(events: Event[]): Map<string, Event[]> {
  const grouped = new Map<string, Event[]>();

  for (const event of events) {
    const dateKey = getDateKey(event.occurrence.scheduledDate);
    const existing = grouped.get(dateKey) || [];
    existing.push(event);
    grouped.set(dateKey, existing);
  }

  // Sort events within each date group by time
  for (const eventList of grouped.values()) {
    eventList.sort((a, b) =>
      a.occurrence.scheduledDate.getTime() - b.occurrence.scheduledDate.getTime()
    );
  }

  return grouped;
}

/**
 * Get a date key for grouping (YYYY-MM-DD format)
 */
function getDateKey(date: Date): string {
  // Use local date string to avoid timezone issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get relative date label (Today, Tomorrow, etc.)
 */
export function getRelativeDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.floor(
    (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return targetDate.toLocaleDateString('en-US', { weekday: 'long' });

  return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format time for display
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Get a comprehensive date label for display
 * Returns "Today" if the date is today, otherwise returns full formatted date
 */
export function getDateLabel(date: Date): string {
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
}
