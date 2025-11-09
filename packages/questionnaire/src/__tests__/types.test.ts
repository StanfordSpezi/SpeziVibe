import type {
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireItem,
  QuestionnaireTheme,
  QuestionnaireResult,
  CancelBehavior,
  QuestionnaireItemType,
  EnableWhenOperator,
  EnableBehavior,
} from '../types';

describe('Type Definitions', () => {
  describe('FHIR Types Re-export', () => {
    it('should re-export Questionnaire from FHIR', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'q1',
            type: 'string',
            text: 'Question 1',
          },
        ],
      };

      expect(questionnaire.resourceType).toBe('Questionnaire');
      expect(questionnaire.item).toHaveLength(1);
    });

    it('should re-export QuestionnaireResponse from FHIR', () => {
      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        questionnaire: 'Questionnaire/test',
        authored: '2025-01-15T10:00:00Z',
        item: [
          {
            linkId: 'q1',
            text: 'Question 1',
            answer: [{ valueString: 'Answer 1' }],
          },
        ],
      };

      expect(response.resourceType).toBe('QuestionnaireResponse');
      expect(response.status).toBe('completed');
    });

    it('should re-export QuestionnaireItem from FHIR', () => {
      const item: QuestionnaireItem = {
        linkId: 'q1',
        type: 'boolean',
        text: 'Do you agree?',
        required: true,
      };

      expect(item.linkId).toBe('q1');
      expect(item.type).toBe('boolean');
    });
  });

  describe('Custom Types', () => {
    describe('QuestionnaireTheme', () => {
      it('should accept valid theme', () => {
        const theme: QuestionnaireTheme = {
          colors: {
            background: '#FFFFFF',
            text: '#000000',
            textSecondary: '#666666',
            primary: '#FF0000',
            primaryLight: '#FF6666',
            border: '#DDDDDD',
            error: '#FF0000',
            cardBackground: '#F9F9F9',
            selectedBackground: '#EEEEEE',
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

        expect(theme.colors.primary).toBe('#FF0000');
        expect(theme.spacing.md).toBe(16);
        expect(theme.borderRadius.md).toBe(8);
        expect(theme.fontSize.xl).toBe(24);
      });
    });

    describe('QuestionnaireResult', () => {
      it('should accept completed result', () => {
        const result: QuestionnaireResult = {
          status: 'completed',
          response: {
            resourceType: 'QuestionnaireResponse',
            status: 'completed',
            questionnaire: 'Questionnaire/test',
            authored: '2025-01-15T10:00:00Z',
            item: [],
          },
        };

        expect(result.status).toBe('completed');
        if (result.status === 'completed') {
          expect(result.response.resourceType).toBe('QuestionnaireResponse');
        }
      });

      it('should accept cancelled result', () => {
        const result: QuestionnaireResult = {
          status: 'cancelled',
        };

        expect(result.status).toBe('cancelled');
      });

      it('should accept failed result', () => {
        const error = new Error('Test error');
        const result: QuestionnaireResult = {
          status: 'failed',
          error,
        };

        expect(result.status).toBe('failed');
        if (result.status === 'failed') {
          expect(result.error.message).toBe('Test error');
        }
      });
    });

    describe('CancelBehavior', () => {
      it('should accept valid cancel behaviors', () => {
        const behaviors: CancelBehavior[] = ['confirm', 'immediate', 'disabled'];

        expect(behaviors).toHaveLength(3);
        expect(behaviors).toContain('confirm');
        expect(behaviors).toContain('immediate');
        expect(behaviors).toContain('disabled');
      });
    });

    describe('Helper Types', () => {
      it('should define QuestionnaireItemType', () => {
        const types: QuestionnaireItemType[] = [
          'group',
          'display',
          'boolean',
          'decimal',
          'integer',
          'date',
          'dateTime',
          'time',
          'string',
          'text',
          'url',
          'choice',
          'open-choice',
          'attachment',
          'reference',
          'quantity',
        ];

        expect(types.length).toBeGreaterThan(10);
        expect(types).toContain('boolean');
        expect(types).toContain('choice');
        expect(types).toContain('group');
      });

      it('should define EnableWhenOperator', () => {
        const operators: EnableWhenOperator[] = [
          'exists',
          '=',
          '!=',
          '>',
          '<',
          '>=',
          '<=',
        ];

        expect(operators).toHaveLength(7);
        expect(operators).toContain('=');
        expect(operators).toContain('>');
        expect(operators).toContain('exists');
      });

      it('should define EnableBehavior', () => {
        const behaviors: EnableBehavior[] = ['all', 'any'];

        expect(behaviors).toHaveLength(2);
        expect(behaviors).toContain('all');
        expect(behaviors).toContain('any');
      });
    });
  });

  describe('Type Compatibility', () => {
    it('should allow FHIR Questionnaire with all supported item types', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          { linkId: 'bool', type: 'boolean', text: 'Boolean?' },
          { linkId: 'int', type: 'integer', text: 'Integer?' },
          { linkId: 'dec', type: 'decimal', text: 'Decimal?' },
          { linkId: 'str', type: 'string', text: 'String?' },
          { linkId: 'txt', type: 'text', text: 'Text?' },
          { linkId: 'dt', type: 'date', text: 'Date?' },
          { linkId: 'dtt', type: 'dateTime', text: 'DateTime?' },
          { linkId: 'tm', type: 'time', text: 'Time?' },
          { linkId: 'ch', type: 'choice', text: 'Choice?', answerOption: [] },
          { linkId: 'disp', type: 'display', text: 'Display' },
          { linkId: 'grp', type: 'group', text: 'Group', item: [] },
        ],
      };

      expect(questionnaire.item).toHaveLength(11);
    });

    it('should allow FHIR Questionnaire with enableWhen', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'q1',
            type: 'boolean',
            text: 'Have symptoms?',
          },
          {
            linkId: 'q2',
            type: 'text',
            text: 'Describe symptoms',
            enableWhen: [
              {
                question: 'q1',
                operator: '=',
                answerBoolean: true,
              },
            ],
          },
        ],
      };

      expect(questionnaire.item![1].enableWhen).toBeDefined();
      expect(questionnaire.item![1].enableWhen![0].operator).toBe('=');
    });

    it('should allow QuestionnaireResponse with various answer types', () => {
      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        questionnaire: 'Questionnaire/test',
        authored: '2025-01-15T10:00:00Z',
        item: [
          {
            linkId: 'bool',
            text: 'Boolean',
            answer: [{ valueBoolean: true }],
          },
          {
            linkId: 'int',
            text: 'Integer',
            answer: [{ valueInteger: 42 }],
          },
          {
            linkId: 'dec',
            text: 'Decimal',
            answer: [{ valueDecimal: 3.14 }],
          },
          {
            linkId: 'str',
            text: 'String',
            answer: [{ valueString: 'Hello' }],
          },
          {
            linkId: 'date',
            text: 'Date',
            answer: [{ valueDate: '2025-01-15' }],
          },
          {
            linkId: 'coding',
            text: 'Coding',
            answer: [{ valueCoding: { code: 'code1', display: 'Code 1' } }],
          },
        ],
      };

      expect(response.item).toHaveLength(6);
    });
  });
});
