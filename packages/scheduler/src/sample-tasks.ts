import { Task } from './types';

/**
 * Sample tasks for demonstration - varied schedule across the week
 */
export function createSampleTasks(): Omit<Task, 'createdAt'>[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return [
    {
      id: 'morning-wellness',
      title: 'Morning Wellness Check',
      instructions: 'Start your day with a quick wellness check-in.',
      category: 'questionnaire',
      questionnaireId: 'wellness-checkin',
      schedule: {
        startDate: today,
        recurrence: {
          type: 'daily',
          hour: 8,
          minute: 30,
        },
      },
      completionPolicy: {
        type: 'window',
        start: 0,
        end: 180, // 3 hours after
      },
    },
    {
      id: 'monday-goals',
      title: 'Weekly Goals Review',
      instructions: 'Review and set your goals for the week ahead.',
      category: 'task',
      schedule: {
        startDate: today,
        recurrence: {
          type: 'weekly',
          weekday: 1, // Monday
          hour: 9,
          minute: 0,
        },
      },
      completionPolicy: {
        type: 'anytime',
      },
    },
    {
      id: 'midweek-checkin',
      title: 'Mid-Week Progress Check',
      instructions: 'Assess your progress and adjust your approach if needed.',
      category: 'questionnaire',
      questionnaireId: 'wellness-checkin',
      schedule: {
        startDate: today,
        recurrence: {
          type: 'weekly',
          weekday: 3, // Wednesday
          hour: 14,
          minute: 0,
        },
      },
      completionPolicy: {
        type: 'anytime',
      },
    },
    {
      id: 'cardio-monday',
      title: 'Cardio Workout',
      instructions: 'Complete 30 minutes of cardiovascular exercise.',
      category: 'measurement',
      schedule: {
        startDate: today,
        recurrence: {
          type: 'weekly',
          weekday: 1, // Monday
          hour: 17,
          minute: 30,
        },
      },
      completionPolicy: {
        type: 'anytime',
      },
    },
    {
      id: 'mindfulness-tuesday',
      title: 'Mindfulness Meditation',
      instructions: 'Practice 10 minutes of mindfulness meditation.',
      category: 'task',
      schedule: {
        startDate: today,
        recurrence: {
          type: 'weekly',
          weekday: 2, // Tuesday
          hour: 12,
          minute: 0,
        },
      },
      completionPolicy: {
        type: 'anytime',
      },
    },
    {
      id: 'strength-tuesday',
      title: 'Strength Training',
      instructions: 'Complete strength training exercises focusing on major muscle groups.',
      category: 'measurement',
      schedule: {
        startDate: today,
        recurrence: {
          type: 'weekly',
          weekday: 2, // Tuesday
          hour: 18,
          minute: 0,
        },
      },
      completionPolicy: {
        type: 'anytime',
      },
    },
    {
      id: 'cardio-wednesday',
      title: 'Cardio Workout',
      instructions: 'Complete 30 minutes of cardiovascular exercise.',
      category: 'measurement',
      schedule: {
        startDate: today,
        recurrence: {
          type: 'weekly',
          weekday: 3, // Wednesday
          hour: 17,
          minute: 30,
        },
      },
      completionPolicy: {
        type: 'anytime',
      },
    },
    {
      id: 'mindfulness-thursday',
      title: 'Mindfulness Meditation',
      instructions: 'Practice 10 minutes of mindfulness meditation.',
      category: 'task',
      schedule: {
        startDate: today,
        recurrence: {
          type: 'weekly',
          weekday: 4, // Thursday
          hour: 12,
          minute: 0,
        },
      },
      completionPolicy: {
        type: 'anytime',
      },
    },
    {
      id: 'strength-thursday',
      title: 'Strength Training',
      instructions: 'Complete strength training exercises focusing on major muscle groups.',
      category: 'measurement',
      schedule: {
        startDate: today,
        recurrence: {
          type: 'weekly',
          weekday: 4, // Thursday
          hour: 18,
          minute: 0,
        },
      },
      completionPolicy: {
        type: 'anytime',
      },
    },
    {
      id: 'cardio-friday',
      title: 'Cardio Workout',
      instructions: 'Complete 30 minutes of cardiovascular exercise.',
      category: 'measurement',
      schedule: {
        startDate: today,
        recurrence: {
          type: 'weekly',
          weekday: 5, // Friday
          hour: 17,
          minute: 30,
        },
      },
      completionPolicy: {
        type: 'anytime',
      },
    },
    {
      id: 'friday-reflection',
      title: 'Weekly Reflection',
      instructions: 'Reflect on your achievements and challenges from this week.',
      category: 'questionnaire',
      questionnaireId: 'weekly-reflection',
      schedule: {
        startDate: today,
        recurrence: {
          type: 'weekly',
          weekday: 5, // Friday
          hour: 19,
          minute: 0,
        },
      },
      completionPolicy: {
        type: 'anytime',
      },
    },
    {
      id: 'weekend-planning',
      title: 'Weekend Planning',
      instructions: 'Plan activities and self-care for the weekend.',
      category: 'task',
      schedule: {
        startDate: today,
        recurrence: {
          type: 'weekly',
          weekday: 5, // Friday
          hour: 15,
          minute: 0,
        },
      },
      completionPolicy: {
        type: 'anytime',
      },
    },
    {
      id: 'sunday-prep',
      title: 'Week Preparation',
      instructions: 'Prepare for the upcoming week: review calendar, meal prep, and organize.',
      category: 'task',
      schedule: {
        startDate: today,
        recurrence: {
          type: 'weekly',
          weekday: 0, // Sunday
          hour: 16,
          minute: 0,
        },
      },
      completionPolicy: {
        type: 'anytime',
      },
    },
    {
      id: 'evening-gratitude',
      title: 'Evening Gratitude',
      instructions: 'Reflect on the positive moments of your day.',
      category: 'questionnaire',
      questionnaireId: 'gratitude-reflection',
      schedule: {
        startDate: today,
        recurrence: {
          type: 'daily',
          hour: 21,
          minute: 0,
        },
      },
      completionPolicy: {
        type: 'anytime',
      },
    },
  ];
}
