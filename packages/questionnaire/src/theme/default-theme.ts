import { QuestionnaireTheme, PartialQuestionnaireTheme } from '../types';

export const defaultLightTheme: QuestionnaireTheme = {
  colors: {
    background: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    primary: '#8C1515',
    primaryLight: '#B83A4B',
    border: '#E0E0E0',
    error: '#DC3545',
    cardBackground: '#F5F5F5',
    selectedBackground: '#FFFFFF',
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
    lg: 24,
  },
  fontSize: {
    sm: 13,
    md: 16,
    lg: 17,
    xl: 28,
  },
};

export const defaultDarkTheme: QuestionnaireTheme = {
  colors: {
    background: '#000000',
    text: '#FFFFFF',
    textSecondary: '#999999',
    primary: '#B83A4B',
    primaryLight: '#D84A5C',
    border: '#333333',
    error: '#DC3545',
    cardBackground: '#1D1D1D',
    selectedBackground: '#000000',
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
    lg: 24,
  },
  fontSize: {
    sm: 13,
    md: 16,
    lg: 17,
    xl: 28,
  },
};

/**
 * Merges user theme with default theme
 */
export function mergeTheme(
  userTheme?: PartialQuestionnaireTheme,
  baseTheme: QuestionnaireTheme = defaultLightTheme
): QuestionnaireTheme {
  if (!userTheme) return baseTheme;

  return {
    colors: { ...baseTheme.colors, ...userTheme.colors },
    spacing: { ...baseTheme.spacing, ...userTheme.spacing },
    borderRadius: { ...baseTheme.borderRadius, ...userTheme.borderRadius },
    fontSize: { ...baseTheme.fontSize, ...userTheme.fontSize },
  };
}
