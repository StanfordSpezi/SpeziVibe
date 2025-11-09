import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
export type { Questionnaire, QuestionnaireResponse };
export type {
  QuestionnaireItem,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  QuestionnaireItemEnableWhen,
  QuestionnaireItemAnswerOption,
  Coding,
  Extension,
} from 'fhir/r4';

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
 * The result of a questionnaire completion
 */
export type QuestionnaireResult =
  | { status: 'completed'; response: QuestionnaireResponse }
  | { status: 'cancelled' }
  | { status: 'failed'; error: Error };

/**
 * Cancel behavior configuration
 */
export type CancelBehavior =
  | 'confirm'
  | 'immediate'
  | 'disabled';

/**
 * Props for the main QuestionnaireForm component
 *
 * Storage is NOT handled by this module - handle persistence in the onResult callback
 */
export interface QuestionnaireFormProps {
  questionnaire: Questionnaire;
  onResult: (result: QuestionnaireResult) => Promise<void> | void;
  completionMessage?: string;
  cancelBehavior?: CancelBehavior;
  theme?: Partial<QuestionnaireTheme>;
  initialResponse?: QuestionnaireResponse;
  submitButtonText?: string;
  cancelButtonText?: string;
}

export type QuestionnaireItemType =
  | 'group'
  | 'display'
  | 'boolean'
  | 'decimal'
  | 'integer'
  | 'date'
  | 'dateTime'
  | 'time'
  | 'string'
  | 'text'
  | 'url'
  | 'choice'
  | 'open-choice'
  | 'attachment'
  | 'reference'
  | 'quantity';

export type EnableWhenOperator =
  | 'exists'
  | '='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<=';

export type EnableBehavior = 'all' | 'any';
