import { createValidationSchema } from '../../validation/schema-builder';
import { Question } from '../../types';

describe('createValidationSchema', () => {
  describe('text questions', () => {
    it('should require text input when required is true', async () => {
      const questions: Question[] = [
        {
          id: 'name',
          type: 'text',
          title: 'Your name',
          required: true,
        },
      ];

      const schema = createValidationSchema(questions);

      // Should fail with empty string
      await expect(schema.validate({ name: '' })).rejects.toThrow('This field is required');

      // Should pass with text
      await expect(schema.validate({ name: 'John' })).resolves.toEqual({ name: 'John' });
    });

    it('should allow empty text when required is false', async () => {
      const questions: Question[] = [
        {
          id: 'notes',
          type: 'text',
          title: 'Notes',
          required: false,
        },
      ];

      const schema = createValidationSchema(questions);
      await expect(schema.validate({ notes: '' })).resolves.toBeDefined();
    });
  });

  describe('scale questions', () => {
    it('should validate min and max range', async () => {
      const questions: Question[] = [
        {
          id: 'rating',
          type: 'scale',
          title: 'Rate this',
          min: 1,
          max: 5,
          required: true,
        },
      ];

      const schema = createValidationSchema(questions);

      // Should fail below min
      await expect(schema.validate({ rating: 0 })).rejects.toThrow('Must be at least 1');

      // Should fail above max
      await expect(schema.validate({ rating: 6 })).rejects.toThrow('Must be at most 5');

      // Should pass within range
      await expect(schema.validate({ rating: 3 })).resolves.toEqual({ rating: 3 });
    });

    it('should use default min/max if not specified', async () => {
      const questions: Question[] = [
        {
          id: 'rating',
          type: 'scale',
          title: 'Rate this',
          required: true,
        },
      ];

      const schema = createValidationSchema(questions);

      // Default should be 1-10
      await expect(schema.validate({ rating: 0 })).rejects.toThrow('Must be at least 1');
      await expect(schema.validate({ rating: 11 })).rejects.toThrow('Must be at most 10');
      await expect(schema.validate({ rating: 5 })).resolves.toEqual({ rating: 5 });
    });

    it('should require a value when required is true', async () => {
      const questions: Question[] = [
        {
          id: 'rating',
          type: 'scale',
          title: 'Rate this',
          required: true,
        },
      ];

      const schema = createValidationSchema(questions);
      await expect(schema.validate({ rating: undefined })).rejects.toThrow('This field is required');
    });
  });

  describe('multipleChoice questions', () => {
    it('should require a selection when required is true', async () => {
      const questions: Question[] = [
        {
          id: 'choice',
          type: 'multipleChoice',
          title: 'Choose one',
          options: [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
          ],
          required: true,
        },
      ];

      const schema = createValidationSchema(questions);

      await expect(schema.validate({ choice: undefined })).rejects.toThrow('Please select an option');
      await expect(schema.validate({ choice: 'a' })).resolves.toEqual({ choice: 'a' });
    });

    it('should accept any value type for options', async () => {
      const questions: Question[] = [
        {
          id: 'choice',
          type: 'multipleChoice',
          title: 'Choose one',
          options: [
            { label: 'Option 1', value: 1 },
            { label: 'Option 2', value: 2 },
          ],
          required: true,
        },
      ];

      const schema = createValidationSchema(questions);
      await expect(schema.validate({ choice: 1 })).resolves.toEqual({ choice: 1 });
      await expect(schema.validate({ choice: 'custom' })).resolves.toEqual({ choice: 'custom' });
    });
  });

  describe('boolean questions', () => {
    it('should require a boolean when required is true', async () => {
      const questions: Question[] = [
        {
          id: 'agree',
          type: 'boolean',
          title: 'Do you agree?',
          required: true,
        },
      ];

      const schema = createValidationSchema(questions);

      await expect(schema.validate({ agree: undefined })).rejects.toThrow('Please make a selection');
      await expect(schema.validate({ agree: true })).resolves.toEqual({ agree: true });
      await expect(schema.validate({ agree: false })).resolves.toEqual({ agree: false });
    });
  });

  describe('date questions', () => {
    it('should require a date when required is true', async () => {
      const questions: Question[] = [
        {
          id: 'birthdate',
          type: 'date',
          title: 'Your birthdate',
          required: true,
        },
      ];

      const schema = createValidationSchema(questions);

      await expect(schema.validate({ birthdate: undefined })).rejects.toThrow('This field is required');
      await expect(schema.validate({ birthdate: new Date() })).resolves.toBeDefined();
    });
  });

  describe('multiple questions', () => {
    it('should validate all questions in a questionnaire', async () => {
      const questions: Question[] = [
        {
          id: 'name',
          type: 'text',
          title: 'Name',
          required: true,
        },
        {
          id: 'rating',
          type: 'scale',
          title: 'Rating',
          min: 1,
          max: 5,
          required: true,
        },
        {
          id: 'notes',
          type: 'text',
          title: 'Notes',
          required: false,
        },
      ];

      const schema = createValidationSchema(questions);

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
      const questions: Question[] = [
        {
          id: 'optional',
          type: 'text',
          title: 'Optional',
          required: false,
        },
      ];

      const schema = createValidationSchema(questions);

      // Empty is fine
      await expect(schema.validate({ optional: '' })).resolves.toBeDefined();
      await expect(schema.validate({ optional: undefined })).resolves.toBeDefined();
      await expect(schema.validate({})).resolves.toBeDefined();
    });
  });
});
