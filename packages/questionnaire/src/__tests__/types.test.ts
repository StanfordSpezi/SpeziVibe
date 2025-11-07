import {
  QuestionType,
  Question,
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireTheme,
} from '../types';

describe('Type Definitions', () => {
  describe('Question Types', () => {
    it('should allow valid question types', () => {
      const types: QuestionType[] = ['text', 'multipleChoice', 'scale', 'date', 'boolean'];
      expect(types).toHaveLength(5);
    });
  });

  describe('Question Interface', () => {
    it('should accept valid text question', () => {
      const question: Question = {
        id: 'test',
        type: 'text',
        title: 'Test Question',
        required: true,
        placeholder: 'Enter text',
      };

      expect(question.type).toBe('text');
      expect(question.placeholder).toBe('Enter text');
    });

    it('should accept valid scale question', () => {
      const question: Question = {
        id: 'rating',
        type: 'scale',
        title: 'Rate this',
        required: true,
        min: 1,
        max: 10,
      };

      expect(question.min).toBe(1);
      expect(question.max).toBe(10);
    });

    it('should accept valid multipleChoice question', () => {
      const question: Question = {
        id: 'choice',
        type: 'multipleChoice',
        title: 'Choose',
        required: true,
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      };

      expect(question.options).toHaveLength(2);
    });

    it('should accept optional fields', () => {
      const question: Question = {
        id: 'optional',
        type: 'text',
        title: 'Optional',
        description: 'Some description',
      };

      expect(question.required).toBeUndefined();
      expect(question.description).toBe('Some description');
    });
  });

  describe('Questionnaire Interface', () => {
    it('should accept valid questionnaire', () => {
      const questionnaire: Questionnaire = {
        id: 'survey-1',
        title: 'Test Survey',
        description: 'A test survey',
        questions: [
          {
            id: 'q1',
            type: 'text',
            title: 'Question 1',
          },
        ],
      };

      expect(questionnaire.questions).toHaveLength(1);
    });

    it('should accept empty questions array', () => {
      const questionnaire: Questionnaire = {
        id: 'empty',
        title: 'Empty',
        description: 'No questions',
        questions: [],
      };

      expect(questionnaire.questions).toHaveLength(0);
    });
  });

  describe('QuestionnaireResponse Interface', () => {
    it('should accept valid response', () => {
      const response: QuestionnaireResponse = {
        id: 'response-1',
        questionnaireId: 'survey-1',
        completedAt: new Date(),
        answers: {
          q1: 'Answer 1',
          q2: 5,
        },
      };

      expect(response.id).toBe('response-1');
      expect(response.answers.q1).toBe('Answer 1');
    });

    it('should accept metadata field', () => {
      const response: QuestionnaireResponse = {
        id: 'response-1',
        questionnaireId: 'survey-1',
        completedAt: new Date(),
        answers: {},
        metadata: {
          userId: 'user-123',
          taskId: 'task-456',
          custom: 'data',
        },
      };

      expect(response.metadata?.userId).toBe('user-123');
      expect(response.metadata?.custom).toBe('data');
    });

    it('should allow metadata to be undefined', () => {
      const response: QuestionnaireResponse = {
        id: 'response-1',
        questionnaireId: 'survey-1',
        completedAt: new Date(),
        answers: {},
      };

      expect(response.metadata).toBeUndefined();
    });
  });

  describe('QuestionnaireTheme Interface', () => {
    it('should accept valid theme', () => {
      const theme: QuestionnaireTheme = {
        colors: {
          background: '#FFF',
          text: '#000',
          textSecondary: '#666',
          primary: '#F00',
          primaryLight: '#F66',
          border: '#DDD',
          error: '#F00',
          cardBackground: '#F9F9F9',
          selectedBackground: '#EEE',
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32,
        },
        borderRadius: {
          sm: 4,
          md: 8,
          lg: 12,
        },
        fontSize: {
          sm: 12,
          md: 16,
          lg: 18,
          xl: 24,
        },
      };

      expect(theme.colors.primary).toBe('#F00');
      expect(theme.spacing.md).toBe(16);
    });
  });
});
