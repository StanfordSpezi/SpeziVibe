/**
 * Core types for the @spezivibe/questionnaire package
 * These types are decoupled from any specific app integration
 */

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

/**
 * Decoupled response type - removed taskId coupling
 * Apps can add their own metadata via the metadata field
 */
export interface QuestionnaireResponse {
  id: string; // Unique response ID
  questionnaireId: string;
  completedAt: Date;
  answers: Record<string, any>;
  metadata?: Record<string, any>; // Flexible field for app-specific data (taskId, userId, etc.)
}

/**
 * Theme configuration for questionnaire components
 */
export interface QuestionnaireTheme {
  colors: {
    background: string;
    text: string;
    textSecondary: string;
    primary: string;
    primaryLight: string;
    border: string;
    error: string;
    cardBackground: string;
    selectedBackground: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  fontSize: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

/**
 * Storage interface that apps must implement
 */
export interface QuestionnaireStorage {
  save(response: QuestionnaireResponse): Promise<void>;
  getAll(): Promise<QuestionnaireResponse[]>;
  getByQuestionnaireId(questionnaireId: string): Promise<QuestionnaireResponse[]>;
  getById(id: string): Promise<QuestionnaireResponse | null>;
}

/**
 * Props for the main QuestionnaireForm component
 */
export interface QuestionnaireFormProps {
  questionnaire: Questionnaire;
  onSubmit: (answers: Record<string, any>) => Promise<void> | void;
  onCancel?: () => void;
  theme?: Partial<QuestionnaireTheme>;
  initialValues?: Record<string, any>;
  submitButtonText?: string;
  cancelButtonText?: string;
}
