/**
 * Calculation utilities for scheduler
 * Handles recurrence logic, occurrence generation, and completion policies
 */

import { Schedule, Occurrence, Event } from '../types';

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

  // Handle one-time events
  if (schedule.recurrence.type === 'once') {
    const scheduledDate = new Date(schedule.recurrence.date);
    if (scheduledDate >= startDate && scheduledDate <= endDate) {
      occurrences.push({ scheduledDate, index: 0 });
    }
    return occurrences;
  }

  // Handle recurring events
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

/**
 * Get the next occurrence for a recurring schedule
 */
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
