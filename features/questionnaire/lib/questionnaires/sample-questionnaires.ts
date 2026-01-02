import { Questionnaire, QuestionnaireBuilder } from '@spezivibe/questionnaire';

export const WELLNESS_QUESTIONNAIRE: Questionnaire = new QuestionnaireBuilder('wellness-checkin')
  .title('Daily Wellness Check-In')
  .description('Take a moment to reflect on your overall wellness today')
  .addInteger('mood', 'How would you rate your mood today?', {
    required: true,
    min: 1,
    max: 10,
  })
  .addInteger('energy', 'What is your energy level?', {
    required: true,
    min: 1,
    max: 10,
  })
  .addChoice('sleep_quality', 'How was your sleep last night?', {
    required: true,
    answerOption: [
      { value: 'excellent', display: 'Excellent' },
      { value: 'good', display: 'Good' },
      { value: 'fair', display: 'Fair' },
      { value: 'poor', display: 'Poor' },
    ],
  })
  .addInteger('stress_level', 'How stressed do you feel?', {
    required: true,
    min: 1,
    max: 10,
  })
  .addText('notes', 'Additional notes', {
    required: false,
  })
  .build();

export const GRATITUDE_QUESTIONNAIRE: Questionnaire = new QuestionnaireBuilder('gratitude-reflection')
  .title('Evening Gratitude')
  .description('Reflect on the positive moments of your day')
  .addText('grateful_for', 'What are you grateful for today?', {
    required: true,
  })
  .addText('positive_moment', 'Describe a positive moment from today', {
    required: true,
  })
  .addBoolean('helped_someone', 'Did you help someone today?', {
    required: true,
  })
  .addInteger('overall_satisfaction', 'How satisfied are you with today?', {
    required: true,
    min: 1,
    max: 10,
  })
  .build();

export const WEEKLY_REFLECTION_QUESTIONNAIRE: Questionnaire = new QuestionnaireBuilder('weekly-reflection')
  .title('Weekly Reflection')
  .description('Review your progress and set intentions for the week ahead')
  .addDate('reflection_date', 'Week ending date', {
    required: true,
  })
  .addInteger('week_rating', 'Overall, how was your week?', {
    required: true,
    min: 1,
    max: 10,
  })
  .addText('accomplishments', 'What did you accomplish this week?', {
    required: true,
  })
  .addText('challenges', 'What challenges did you face?', {
    required: false,
  })
  .addChoice('self_care', 'How well did you practice self-care?', {
    required: true,
    answerOption: [
      { value: 'excellent', display: 'Excellent - Made it a priority' },
      { value: 'good', display: 'Good - Regular practice' },
      { value: 'fair', display: 'Fair - Could improve' },
      { value: 'poor', display: 'Poor - Needs attention' },
    ],
  })
  .addText('next_week_goals', 'What are your goals for next week?', {
    required: true,
  })
  .build();

export const SAMPLE_QUESTIONNAIRES = [
  WELLNESS_QUESTIONNAIRE,
  GRATITUDE_QUESTIONNAIRE,
  WEEKLY_REFLECTION_QUESTIONNAIRE,
];

export function getQuestionnaireById(id: string): Questionnaire | undefined {
  return SAMPLE_QUESTIONNAIRES.find((q) => q.id === id);
}
