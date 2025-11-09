import { Questionnaire } from './types';

export const WELLNESS_QUESTIONNAIRE: Questionnaire = {
  id: 'wellness-checkin',
  title: 'Daily Wellness Check-In',
  description: 'Take a moment to reflect on your overall wellness today',
  questions: [
    {
      id: 'mood',
      type: 'scale',
      title: 'How would you rate your mood today?',
      description: '1 = Very Poor, 10 = Excellent',
      required: true,
      min: 1,
      max: 10,
    },
    {
      id: 'energy',
      type: 'scale',
      title: 'What is your energy level?',
      description: '1 = Very Low, 10 = Very High',
      required: true,
      min: 1,
      max: 10,
    },
    {
      id: 'sleep_quality',
      type: 'multipleChoice',
      title: 'How was your sleep last night?',
      required: true,
      options: [
        { label: 'Excellent', value: 4 },
        { label: 'Good', value: 3 },
        { label: 'Fair', value: 2 },
        { label: 'Poor', value: 1 },
      ],
    },
    {
      id: 'stress_level',
      type: 'scale',
      title: 'How stressed do you feel?',
      description: '1 = Not Stressed, 10 = Extremely Stressed',
      required: true,
      min: 1,
      max: 10,
    },
    {
      id: 'notes',
      type: 'text',
      title: 'Additional notes',
      description: 'Any additional thoughts or observations?',
      required: false,
      placeholder: 'Enter your notes here...',
    },
  ],
};

export const GRATITUDE_QUESTIONNAIRE: Questionnaire = {
  id: 'gratitude-reflection',
  title: 'Evening Gratitude',
  description: 'Reflect on the positive moments of your day',
  questions: [
    {
      id: 'grateful_for',
      type: 'text',
      title: 'What are you grateful for today?',
      description: 'Name three things you appreciate',
      required: true,
      placeholder: 'I am grateful for...',
    },
    {
      id: 'positive_moment',
      type: 'text',
      title: 'Describe a positive moment from today',
      required: true,
      placeholder: 'Today, something great happened when...',
    },
    {
      id: 'helped_someone',
      type: 'boolean',
      title: 'Did you help someone today?',
      required: true,
    },
    {
      id: 'overall_satisfaction',
      type: 'scale',
      title: 'How satisfied are you with today?',
      description: '1 = Not Satisfied, 10 = Very Satisfied',
      required: true,
      min: 1,
      max: 10,
    },
  ],
};

export const WEEKLY_REFLECTION_QUESTIONNAIRE: Questionnaire = {
  id: 'weekly-reflection',
  title: 'Weekly Reflection',
  description: 'Review your progress and set intentions for the week ahead',
  questions: [
    {
      id: 'reflection_date',
      type: 'date',
      title: 'Week ending date',
      description: 'Select the last day of the week you are reflecting on',
      required: true,
    },
    {
      id: 'week_rating',
      type: 'scale',
      title: 'Overall, how was your week?',
      description: '1 = Very Challenging, 10 = Excellent',
      required: true,
      min: 1,
      max: 10,
    },
    {
      id: 'accomplishments',
      type: 'text',
      title: 'What did you accomplish this week?',
      required: true,
      placeholder: 'List your achievements...',
    },
    {
      id: 'challenges',
      type: 'text',
      title: 'What challenges did you face?',
      required: false,
      placeholder: 'Describe any difficulties...',
    },
    {
      id: 'self_care',
      type: 'multipleChoice',
      title: 'How well did you practice self-care?',
      required: true,
      options: [
        { label: 'Excellent - Made it a priority', value: 4 },
        { label: 'Good - Regular practice', value: 3 },
        { label: 'Fair - Could improve', value: 2 },
        { label: 'Poor - Needs attention', value: 1 },
      ],
    },
    {
      id: 'next_week_goals',
      type: 'text',
      title: 'What are your goals for next week?',
      required: true,
      placeholder: 'Next week, I plan to...',
    },
  ],
};

export const SAMPLE_QUESTIONNAIRES = [
  WELLNESS_QUESTIONNAIRE,
  GRATITUDE_QUESTIONNAIRE,
  WEEKLY_REFLECTION_QUESTIONNAIRE,
];

export function getQuestionnaireById(id: string): Questionnaire | undefined {
  return SAMPLE_QUESTIONNAIRES.find((q) => q.id === id);
}
