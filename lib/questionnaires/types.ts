export type QuestionType =
  | 'text'
  | 'multipleChoice'
  | 'scale'
  | 'date'
  | 'boolean';

export interface QuestionOption {
  label: string;
  value: string | number;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required?: boolean;
  options?: QuestionOption[]; // For multipleChoice
  min?: number; // For scale
  max?: number; // For scale
  placeholder?: string; // For text
}

export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface QuestionnaireResponse {
  questionnaireId: string;
  taskId: string;
  completedAt: Date;
  answers: Record<string, any>;
}
