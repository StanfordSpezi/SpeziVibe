/**
 * Tests for utility functions
 */

import { calculateOccurrences, isAllowedToComplete } from '../src/utils/calculations';
import { getDateLabel, getRelativeDateLabel, formatTime } from '../src/utils/formatting';
import { Task, Event, Schedule } from '../src/types';

describe('Utility Functions', () => {
  describe('calculateOccurrences', () => {
    it('should calculate daily recurrences', () => {
      const schedule: Schedule = {
        startDate: new Date('2024-01-01'),
        recurrence: {
          type: 'daily',
          hour: 9,
          minute: 0,
        },
      };

      const startDate = new Date('2024-01-01T00:00:00');
      const endDate = new Date('2024-01-03T23:59:59');

      const occurrences = calculateOccurrences(schedule, startDate, endDate);

      expect(occurrences.length).toBe(3);
      expect(occurrences[0].scheduledDate.getHours()).toBe(9);
      expect(occurrences[0].scheduledDate.getMinutes()).toBe(0);
    });

    it('should calculate weekly recurrences', () => {
      const schedule: Schedule = {
        startDate: new Date('2024-01-01'),
        recurrence: {
          type: 'weekly',
          weekday: 1, // Monday
          hour: 10,
          minute: 30,
        },
      };

      const startDate = new Date('2024-01-01T00:00:00');
      const endDate = new Date('2024-01-31T23:59:59');

      const occurrences = calculateOccurrences(schedule, startDate, endDate);

      // Should have all Mondays in January 2024
      expect(occurrences.length).toBeGreaterThan(0);
      occurrences.forEach(occ => {
        expect(occ.scheduledDate.getDay()).toBe(1); // Monday
        expect(occ.scheduledDate.getHours()).toBe(10);
        expect(occ.scheduledDate.getMinutes()).toBe(30);
      });
    });

    it('should calculate one-time occurrences', () => {
      const specificDate = new Date('2024-06-15T14:30:00');
      const schedule: Schedule = {
        startDate: new Date('2024-01-01'),
        recurrence: {
          type: 'once',
          date: specificDate,
        },
      };

      const startDate = new Date('2024-01-01T00:00:00');
      const endDate = new Date('2024-12-31T23:59:59');

      const occurrences = calculateOccurrences(schedule, startDate, endDate);

      expect(occurrences.length).toBe(1);
      expect(occurrences[0].scheduledDate.getTime()).toBe(specificDate.getTime());
    });

    it('should respect endDate on schedule', () => {
      const schedule: Schedule = {
        startDate: new Date('2024-01-01T00:00:00'),
        endDate: new Date('2024-01-05T00:00:00'),
        recurrence: {
          type: 'daily',
          hour: 9,
          minute: 0,
        },
      };

      const startDate = new Date('2024-01-01T00:00:00');
      const endDate = new Date('2024-01-31T23:59:59');

      const occurrences = calculateOccurrences(schedule, startDate, endDate);

      // Should have occurrences from Jan 1-4 (endDate is exclusive)
      expect(occurrences.length).toBe(4);
      expect(occurrences[0].scheduledDate.getDate()).toBe(1);
      expect(occurrences[occurrences.length - 1].scheduledDate.getDate()).toBe(4);
    });
  });

  describe('isAllowedToComplete', () => {
    it('should allow completion for "anytime" policy', () => {
      const event: Event = {
        task: {
          id: 'test-task',
          title: 'Test',
          instructions: 'Test',
          category: 'task',
          schedule: {
            startDate: new Date(),
            recurrence: { type: 'daily', hour: 9, minute: 0 },
          },
          completionPolicy: { type: 'anytime' },
          createdAt: new Date(),
        },
        occurrence: {
          scheduledDate: new Date('2024-01-01T09:00:00'),
          index: 0,
        },
      };

      expect(isAllowedToComplete(event)).toBe(true);
    });

    it('should enforce window completion policy', () => {
      const scheduledTime = new Date();
      scheduledTime.setHours(scheduledTime.getHours() - 5); // 5 hours ago

      const event: Event = {
        task: {
          id: 'test-task',
          title: 'Test',
          instructions: 'Test',
          category: 'task',
          schedule: {
            startDate: new Date(),
            recurrence: { type: 'daily', hour: 9, minute: 0 },
          },
          completionPolicy: {
            type: 'window',
            start: 0,
            end: 180, // 3 hours after
          },
          createdAt: new Date(),
        },
        occurrence: {
          scheduledDate: scheduledTime,
          index: 0,
        },
      };

      // More than 3 hours past, should not allow
      expect(isAllowedToComplete(event)).toBe(false);
    });
  });

  describe('Formatting Functions', () => {
    it('should format date label for today', () => {
      const today = new Date();
      const label = getDateLabel(today);
      expect(label).toBe('Today');
    });

    it('should format date label for other dates', () => {
      const date = new Date(2024, 5, 15, 12, 0, 0); // June 15, 2024 at noon
      const label = getDateLabel(date);
      // Just check that it contains the date parts, not the specific day name (timezone-dependent)
      expect(label).toMatch(/June/);
      expect(label).toMatch(/15/);
    });

    it('should format relative date labels', () => {
      const today = new Date();
      expect(getRelativeDateLabel(today)).toBe('Today');

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(getRelativeDateLabel(tomorrow)).toBe('Tomorrow');

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      expect(getRelativeDateLabel(yesterday)).toBe('Yesterday');
    });

    it('should format time correctly', () => {
      const date = new Date('2024-01-01T14:30:00');
      const time = formatTime(date);
      expect(time).toMatch(/2:30/);
      expect(time).toMatch(/PM/);
    });
  });
});
