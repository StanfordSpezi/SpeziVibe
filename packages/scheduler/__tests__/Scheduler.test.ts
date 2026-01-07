/**
 * Tests for the Scheduler service
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Scheduler } from '../src/services/Scheduler';
import { Task } from '../src/types';

describe('Scheduler', () => {
  let scheduler: Scheduler;

  beforeEach(async () => {
    jest.clearAllMocks();
    scheduler = new Scheduler('@test_scheduler');
    await scheduler.initialize();
  });

  describe('Task Management', () => {
    it('should create a new task', async () => {
      const task = await scheduler.createOrUpdateTask({
        id: 'test-task-1',
        title: 'Test Task',
        instructions: 'Test instructions',
        category: 'task',
        schedule: {
          startDate: new Date('2024-01-01'),
          recurrence: {
            type: 'daily',
            hour: 9,
            minute: 0,
          },
        },
        completionPolicy: {
          type: 'anytime',
        },
      });

      expect(task.id).toBe('test-task-1');
      expect(task.title).toBe('Test Task');
      expect(task.createdAt).toBeInstanceOf(Date);
    });

    it('should update an existing task', async () => {
      await scheduler.createOrUpdateTask({
        id: 'test-task-1',
        title: 'Original Title',
        instructions: 'Original instructions',
        category: 'task',
        schedule: {
          startDate: new Date('2024-01-01'),
          recurrence: {
            type: 'daily',
            hour: 9,
            minute: 0,
          },
        },
        completionPolicy: {
          type: 'anytime',
        },
      });

      const updatedTask = await scheduler.createOrUpdateTask({
        id: 'test-task-1',
        title: 'Updated Title',
        instructions: 'Updated instructions',
        category: 'task',
        schedule: {
          startDate: new Date('2024-01-01'),
          recurrence: {
            type: 'daily',
            hour: 10,
            minute: 0,
          },
        },
        completionPolicy: {
          type: 'anytime',
        },
      });

      expect(updatedTask.title).toBe('Updated Title');
      expect(scheduler.getTasks()).toHaveLength(1);
    });

    it('should get all tasks', async () => {
      await scheduler.createOrUpdateTask({
        id: 'task-1',
        title: 'Task 1',
        instructions: 'Instructions 1',
        category: 'task',
        schedule: {
          startDate: new Date('2024-01-01'),
          recurrence: { type: 'daily', hour: 9, minute: 0 },
        },
        completionPolicy: { type: 'anytime' },
      });

      await scheduler.createOrUpdateTask({
        id: 'task-2',
        title: 'Task 2',
        instructions: 'Instructions 2',
        category: 'questionnaire',
        questionnaireId: 'q1',
        schedule: {
          startDate: new Date('2024-01-01'),
          recurrence: { type: 'weekly', weekday: 1, hour: 10, minute: 0 },
        },
        completionPolicy: { type: 'anytime' },
      });

      const tasks = scheduler.getTasks();
      expect(tasks).toHaveLength(2);
      expect(tasks.find(t => t.id === 'task-1')).toBeDefined();
      expect(tasks.find(t => t.id === 'task-2')).toBeDefined();
    });

    it('should get a specific task by ID', async () => {
      await scheduler.createOrUpdateTask({
        id: 'task-1',
        title: 'Task 1',
        instructions: 'Instructions',
        category: 'task',
        schedule: {
          startDate: new Date('2024-01-01'),
          recurrence: { type: 'daily', hour: 9, minute: 0 },
        },
        completionPolicy: { type: 'anytime' },
      });

      const task = scheduler.getTask('task-1');
      expect(task).toBeDefined();
      expect(task?.title).toBe('Task 1');
    });

    it('should delete a task', async () => {
      await scheduler.createOrUpdateTask({
        id: 'task-to-delete',
        title: 'Delete Me',
        instructions: 'Instructions',
        category: 'task',
        schedule: {
          startDate: new Date('2024-01-01'),
          recurrence: { type: 'daily', hour: 9, minute: 0 },
        },
        completionPolicy: { type: 'anytime' },
      });

      expect(scheduler.getTasks()).toHaveLength(1);

      await scheduler.deleteTask('task-to-delete');

      expect(scheduler.getTasks()).toHaveLength(0);
      expect(scheduler.getTask('task-to-delete')).toBeUndefined();
    });

    it('should clear all tasks', async () => {
      await scheduler.createOrUpdateTask({
        id: 'task-1',
        title: 'Task 1',
        instructions: 'Instructions',
        category: 'task',
        schedule: {
          startDate: new Date('2024-01-01'),
          recurrence: { type: 'daily', hour: 9, minute: 0 },
        },
        completionPolicy: { type: 'anytime' },
      });

      await scheduler.createOrUpdateTask({
        id: 'task-2',
        title: 'Task 2',
        instructions: 'Instructions',
        category: 'task',
        schedule: {
          startDate: new Date('2024-01-01'),
          recurrence: { type: 'daily', hour: 9, minute: 0 },
        },
        completionPolicy: { type: 'anytime' },
      });

      expect(scheduler.getTasks()).toHaveLength(2);

      await scheduler.clearAll();

      expect(scheduler.getTasks()).toHaveLength(0);
    });
  });

  describe('Event Queries', () => {
    beforeEach(async () => {
      await scheduler.createOrUpdateTask({
        id: 'daily-task',
        title: 'Daily Task',
        instructions: 'Do this daily',
        category: 'task',
        schedule: {
          startDate: new Date('2024-01-01'),
          recurrence: {
            type: 'daily',
            hour: 9,
            minute: 0,
          },
        },
        completionPolicy: { type: 'anytime' },
      });
    });

    it('should query events for a date range', () => {
      const startDate = new Date('2024-01-01T00:00:00');
      const endDate = new Date('2024-01-03T23:59:59');

      const events = scheduler.queryEvents(startDate, endDate);

      expect(events.length).toBeGreaterThan(0);
      expect(events[0].task.id).toBe('daily-task');
    });

    it('should return events sorted by date', () => {
      const startDate = new Date('2024-01-01T00:00:00');
      const endDate = new Date('2024-01-05T23:59:59');

      const events = scheduler.queryEvents(startDate, endDate);

      for (let i = 1; i < events.length; i++) {
        expect(events[i].occurrence.scheduledDate.getTime()).toBeGreaterThanOrEqual(
          events[i - 1].occurrence.scheduledDate.getTime()
        );
      }
    });
  });

  describe('Event Completion', () => {
    let testTask: Task;

    beforeEach(async () => {
      testTask = await scheduler.createOrUpdateTask({
        id: 'completion-task',
        title: 'Completion Task',
        instructions: 'Test completion',
        category: 'task',
        schedule: {
          startDate: new Date('2024-01-01'),
          recurrence: {
            type: 'daily',
            hour: 9,
            minute: 0,
          },
        },
        completionPolicy: { type: 'anytime' },
      });
    });

    it('should complete an event', async () => {
      const events = scheduler.queryEvents(
        new Date('2024-01-01T00:00:00'),
        new Date('2024-01-01T23:59:59')
      );

      expect(events[0].outcome).toBeUndefined();

      await scheduler.completeEvent(events[0]);

      const updatedEvents = scheduler.queryEvents(
        new Date('2024-01-01T00:00:00'),
        new Date('2024-01-01T23:59:59')
      );

      expect(updatedEvents[0].outcome).toBeDefined();
      expect(updatedEvents[0].outcome?.completedAt).toBeInstanceOf(Date);
    });

    it('should uncomplete an event', async () => {
      const events = scheduler.queryEvents(
        new Date('2024-01-01T00:00:00'),
        new Date('2024-01-01T23:59:59')
      );

      await scheduler.completeEvent(events[0]);

      let updatedEvents = scheduler.queryEvents(
        new Date('2024-01-01T00:00:00'),
        new Date('2024-01-01T23:59:59')
      );

      expect(updatedEvents[0].outcome).toBeDefined();

      await scheduler.uncompleteEvent(updatedEvents[0]);

      updatedEvents = scheduler.queryEvents(
        new Date('2024-01-01T00:00:00'),
        new Date('2024-01-01T23:59:59')
      );

      expect(updatedEvents[0].outcome).toBeUndefined();
    });
  });

  describe('State Management', () => {
    it('should persist state to AsyncStorage', async () => {
      await scheduler.createOrUpdateTask({
        id: 'persist-task',
        title: 'Persist Task',
        instructions: 'Test persistence',
        category: 'task',
        schedule: {
          startDate: new Date('2024-01-01'),
          recurrence: { type: 'daily', hour: 9, minute: 0 },
        },
        completionPolicy: { type: 'anytime' },
      });

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should notify listeners on state change', async () => {
      const listener = jest.fn();
      scheduler.subscribe(listener);

      await scheduler.createOrUpdateTask({
        id: 'notify-task',
        title: 'Notify Task',
        instructions: 'Test notification',
        category: 'task',
        schedule: {
          startDate: new Date('2024-01-01'),
          recurrence: { type: 'daily', hour: 9, minute: 0 },
        },
        completionPolicy: { type: 'anytime' },
      });

      expect(listener).toHaveBeenCalled();
    });

    it('should unsubscribe listeners', async () => {
      const listener = jest.fn();
      const unsubscribe = scheduler.subscribe(listener);

      unsubscribe();

      await scheduler.createOrUpdateTask({
        id: 'unsubscribe-task',
        title: 'Unsubscribe Task',
        instructions: 'Test unsubscribe',
        category: 'task',
        schedule: {
          startDate: new Date('2024-01-01'),
          recurrence: { type: 'daily', hour: 9, minute: 0 },
        },
        completionPolicy: { type: 'anytime' },
      });

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
