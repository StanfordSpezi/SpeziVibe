import * as Yup from 'yup';
import { Question } from '../types';

/**
 * Creates a Yup validation schema from questionnaire questions
 */
export function createValidationSchema(questions: Question[]) {
  const schema: Record<string, any> = {};

  questions.forEach((question) => {
    if (question.required) {
      switch (question.type) {
        case 'text':
          schema[question.id] = Yup.string().required('This field is required');
          break;
        case 'scale':
          schema[question.id] = Yup.number()
            .min(question.min || 1, `Must be at least ${question.min || 1}`)
            .max(question.max || 10, `Must be at most ${question.max || 10}`)
            .required('This field is required');
          break;
        case 'multipleChoice':
          schema[question.id] = Yup.mixed().required('Please select an option');
          break;
        case 'boolean':
          schema[question.id] = Yup.boolean().required('Please make a selection');
          break;
        case 'date':
          schema[question.id] = Yup.date().required('This field is required');
          break;
      }
    }
  });

  return Yup.object().shape(schema);
}
