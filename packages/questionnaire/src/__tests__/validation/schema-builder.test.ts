import { createValidationSchema } from '../../validation/schema-builder';
import type { QuestionnaireItem } from 'fhir/r4';

describe('createValidationSchema', () => {
  describe('text questions', () => {
    it('should require text input when required is true', async () => {
      const items: QuestionnaireItem[] = [
        {
          linkId: 'name',
          type: 'text',
          text: 'Your name',
          required: true,
        },
      ];

      const schema = createValidationSchema(items);

      // Should fail with empty string
      await expect(schema.validate({ name: '' })).rejects.toThrow('This field is required');

      // Should pass with text
      await expect(schema.validate({ name: 'John' })).resolves.toEqual({ name: 'John' });
    });

    it('should allow empty text when required is false', async () => {
      const items: QuestionnaireItem[] = [
        {
          linkId: 'notes',
          type: 'text',
          text: 'Notes',
          required: false,
        },
      ];

      const schema = createValidationSchema(items);
      await expect(schema.validate({ notes: '' })).resolves.toBeDefined();
    });

    it('should validate maxLength for string type', async () => {
      const items: QuestionnaireItem[] = [
        {
          linkId: 'short',
          type: 'string',
          text: 'Short text',
          maxLength: 10,
          required: true,
        },
      ];

      const schema = createValidationSchema(items);

      // Should fail if too long
      await expect(schema.validate({ short: 'This is too long' })).rejects.toThrow('Maximum length is 10 characters');

      // Should pass if within limit
      await expect(schema.validate({ short: 'Short' })).resolves.toEqual({ short: 'Short' });
    });
  });

  describe('integer questions', () => {
    it('should validate min and max range from extensions', async () => {
      const items: QuestionnaireItem[] = [
        {
          linkId: 'rating',
          type: 'integer',
          text: 'Rate this',
          required: true,
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/minValue',
              valueInteger: 1,
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
              valueInteger: 5,
            },
          ],
        },
      ];

      const schema = createValidationSchema(items);

      // Should fail below min
      await expect(schema.validate({ rating: 0 })).rejects.toThrow('Must be at least 1');

      // Should fail above max
      await expect(schema.validate({ rating: 6 })).rejects.toThrow('Must be at most 5');

      // Should pass within range
      await expect(schema.validate({ rating: 3 })).resolves.toEqual({ rating: 3 });
    });

    it('should require a value when required is true', async () => {
      const items: QuestionnaireItem[] = [
        {
          linkId: 'rating',
          type: 'integer',
          text: 'Rate this',
          required: true,
        },
      ];

      const schema = createValidationSchema(items);
      await expect(schema.validate({ rating: undefined })).rejects.toThrow('This field is required');
    });
  });

  describe('decimal questions', () => {
    it('should validate min and max range for decimals', async () => {
      const items: QuestionnaireItem[] = [
        {
          linkId: 'temperature',
          type: 'decimal',
          text: 'Temperature',
          required: true,
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/minValue',
              valueDecimal: 95.0,
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
              valueDecimal: 105.0,
            },
          ],
        },
      ];

      const schema = createValidationSchema(items);

      // Should fail below min
      await expect(schema.validate({ temperature: 94.5 })).rejects.toThrow('Must be at least 95');

      // Should fail above max
      await expect(schema.validate({ temperature: 105.5 })).rejects.toThrow('Must be at most 105');

      // Should pass within range
      await expect(schema.validate({ temperature: 98.6 })).resolves.toEqual({ temperature: 98.6 });
    });
  });

  describe('choice questions', () => {
    it('should require a selection when required is true', async () => {
      const items: QuestionnaireItem[] = [
        {
          linkId: 'choice',
          type: 'choice',
          text: 'Choose one',
          required: true,
          answerOption: [
            { valueCoding: { code: 'a', display: 'Option A' } },
            { valueCoding: { code: 'b', display: 'Option B' } },
          ],
        },
      ];

      const schema = createValidationSchema(items);

      await expect(schema.validate({ choice: undefined })).rejects.toThrow('Please select an option');
      await expect(schema.validate({ choice: 'a' })).resolves.toEqual({ choice: 'a' });
    });

    it('should allow any choice value', async () => {
      const items: QuestionnaireItem[] = [
        {
          linkId: 'choice',
          type: 'choice',
          text: 'Choose one',
          required: true,
          answerOption: [
            { valueCoding: { code: 'option1', display: 'Option 1' } },
            { valueCoding: { code: 'option2', display: 'Option 2' } },
          ],
        },
      ];

      const schema = createValidationSchema(items);
      await expect(schema.validate({ choice: 'option1' })).resolves.toEqual({ choice: 'option1' });
    });
  });

  describe('boolean questions', () => {
    it('should require a boolean when required is true', async () => {
      const items: QuestionnaireItem[] = [
        {
          linkId: 'agree',
          type: 'boolean',
          text: 'Do you agree?',
          required: true,
        },
      ];

      const schema = createValidationSchema(items);

      await expect(schema.validate({ agree: undefined })).rejects.toThrow('Please make a selection');
      await expect(schema.validate({ agree: true })).resolves.toEqual({ agree: true });
      await expect(schema.validate({ agree: false })).resolves.toEqual({ agree: false });
    });
  });

  describe('date questions', () => {
    it('should require a date when required is true', async () => {
      const items: QuestionnaireItem[] = [
        {
          linkId: 'birthdate',
          type: 'date',
          text: 'Your birthdate',
          required: true,
        },
      ];

      const schema = createValidationSchema(items);

      await expect(schema.validate({ birthdate: undefined })).rejects.toThrow('This field is required');
      await expect(schema.validate({ birthdate: new Date() })).resolves.toBeDefined();
    });
  });

  describe('dateTime questions', () => {
    it('should require a dateTime when required is true', async () => {
      const items: QuestionnaireItem[] = [
        {
          linkId: 'appointment',
          type: 'dateTime',
          text: 'Appointment time',
          required: true,
        },
      ];

      const schema = createValidationSchema(items);

      await expect(schema.validate({ appointment: undefined })).rejects.toThrow('This field is required');
      await expect(schema.validate({ appointment: new Date() })).resolves.toBeDefined();
    });
  });

  describe('time questions', () => {
    it('should require a time when required is true', async () => {
      const items: QuestionnaireItem[] = [
        {
          linkId: 'medication_time',
          type: 'time',
          text: 'Medication time',
          required: true,
        },
      ];

      const schema = createValidationSchema(items);

      await expect(schema.validate({ medication_time: undefined })).rejects.toThrow('This field is required');
      await expect(schema.validate({ medication_time: '09:00' })).resolves.toEqual({ medication_time: '09:00' });
    });
  });

  describe('group questions', () => {
    it('should validate nested items within groups', async () => {
      const items: QuestionnaireItem[] = [
        {
          linkId: 'demographics',
          type: 'group',
          text: 'Demographics',
          item: [
            {
              linkId: 'name',
              type: 'string',
              text: 'Name',
              required: true,
            },
            {
              linkId: 'age',
              type: 'integer',
              text: 'Age',
              required: true,
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/minValue',
                  valueInteger: 0,
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
                  valueInteger: 120,
                },
              ],
            },
          ],
        },
      ];

      const schema = createValidationSchema(items);

      // Should validate nested items
      await expect(
        schema.validate({
          name: 'John Doe',
          age: 30,
        })
      ).resolves.toBeDefined();

      // Should fail if nested required field is missing
      await expect(
        schema.validate({
          name: 'John Doe',
        })
      ).rejects.toThrow('This field is required');

      // Should fail if nested value is out of range
      await expect(
        schema.validate({
          name: 'John Doe',
          age: 150,
        })
      ).rejects.toThrow('Must be at most 120');
    });
  });

  describe('multiple questions', () => {
    it('should validate all questions in a questionnaire', async () => {
      const items: QuestionnaireItem[] = [
        {
          linkId: 'name',
          type: 'string',
          text: 'Name',
          required: true,
        },
        {
          linkId: 'rating',
          type: 'integer',
          text: 'Rating',
          required: true,
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/minValue',
              valueInteger: 1,
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
              valueInteger: 5,
            },
          ],
        },
        {
          linkId: 'notes',
          type: 'text',
          text: 'Notes',
          required: false,
        },
      ];

      const schema = createValidationSchema(items);

      // All required fields
      await expect(
        schema.validate({
          name: 'John',
          rating: 3,
          notes: '',
        })
      ).resolves.toBeDefined();

      // Missing required field
      await expect(
        schema.validate({
          name: 'John',
          notes: '',
        })
      ).rejects.toThrow();

      // Invalid rating
      await expect(
        schema.validate({
          name: 'John',
          rating: 10,
        })
      ).rejects.toThrow('Must be at most 5');
    });
  });

  describe('optional questions', () => {
    it('should not validate optional questions', async () => {
      const items: QuestionnaireItem[] = [
        {
          linkId: 'optional',
          type: 'text',
          text: 'Optional',
          required: false,
        },
      ];

      const schema = createValidationSchema(items);

      // Empty is fine
      await expect(schema.validate({ optional: '' })).resolves.toBeDefined();
      await expect(schema.validate({ optional: undefined })).resolves.toBeDefined();
      await expect(schema.validate({})).resolves.toBeDefined();
    });
  });
});
