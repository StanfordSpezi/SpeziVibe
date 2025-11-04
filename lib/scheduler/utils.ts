import { Schedule, Occurrence, Task, Event, AllowedCompletionPolicy } from './types';

/**
 * Calculate occurrences for a task within a date range
 */
export function calculateOccurrences(
  schedule: Schedule,
  startDate: Date,
  endDate: Date
): Occurrence[] {
  const occurrences: Occurrence[] = [];
  const current = new Date(Math.max(schedule.startDate.getTime(), startDate.getTime()));
  const end = schedule.endDate
    ? new Date(Math.min(schedule.endDate.getTime(), endDate.getTime()))
    : endDate;

  let index = 0;

  if (schedule.recurrence.type === 'once') {
    const scheduledDate = new Date(schedule.recurrence.date);
    if (scheduledDate >= startDate && scheduledDate <= endDate) {
      occurrences.push({ scheduledDate, index: 0 });
    }
    return occurrences;
  }

  while (current <= end) {
    const occurrence = getNextOccurrence(schedule, current, index);
    if (!occurrence || occurrence.scheduledDate > end) {
      break;
    }
    occurrences.push(occurrence);
    current.setTime(occurrence.scheduledDate.getTime() + 1); // Move to next millisecond
    index++;
  }

  return occurrences;
}

function getNextOccurrence(
  schedule: Schedule,
  fromDate: Date,
  index: number
): Occurrence | null {
  const scheduledDate = new Date(fromDate);

  switch (schedule.recurrence.type) {
    case 'daily':
      scheduledDate.setHours(schedule.recurrence.hour, schedule.recurrence.minute, 0, 0);
      if (scheduledDate < fromDate) {
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      }
      break;

    case 'weekly': {
      const targetDay = schedule.recurrence.weekday;
      const currentDay = scheduledDate.getDay();
      const daysToAdd = (targetDay - currentDay + 7) % 7;
      scheduledDate.setDate(scheduledDate.getDate() + daysToAdd);
      scheduledDate.setHours(schedule.recurrence.hour, schedule.recurrence.minute, 0, 0);
      if (scheduledDate < fromDate) {
        scheduledDate.setDate(scheduledDate.getDate() + 7);
      }
      break;
    }

    case 'monthly':
      scheduledDate.setDate(schedule.recurrence.day);
      scheduledDate.setHours(schedule.recurrence.hour, schedule.recurrence.minute, 0, 0);
      if (scheduledDate < fromDate) {
        scheduledDate.setMonth(scheduledDate.getMonth() + 1);
      }
      break;

    case 'once':
      return null;
  }

  if (schedule.endDate && scheduledDate > schedule.endDate) {
    return null;
  }

  return { scheduledDate, index };
}

/**
 * Check if an event is allowed to be completed based on its completion policy
 */
export function isAllowedToComplete(event: Event, now: Date = new Date()): boolean {
  const policy = event.task.completionPolicy;

  if (policy.type === 'anytime') {
    return true;
  }

  if (policy.type === 'window') {
    const scheduledTime = event.occurrence.scheduledDate.getTime();
    const currentTime = now.getTime();
    const startWindow = scheduledTime + policy.start * 60 * 1000; // minutes to ms
    const endWindow = scheduledTime + policy.end * 60 * 1000;

    return currentTime >= startWindow && currentTime <= endWindow;
  }

  return true;
}

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
  for (const [key, eventList] of grouped.entries()) {
    eventList.sort((a, b) =>
      a.occurrence.scheduledDate.getTime() - b.occurrence.scheduledDate.getTime()
    );
  }

  return grouped;
}

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
