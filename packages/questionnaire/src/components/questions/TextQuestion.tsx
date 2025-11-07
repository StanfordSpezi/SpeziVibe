import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { FormikProps } from 'formik';
import { Question, QuestionnaireTheme } from '../../types';

interface TextQuestionProps {
  question: Question;
  formik: FormikProps<any>;
  theme: QuestionnaireTheme;
}

export function TextQuestion({ question, formik, theme }: TextQuestionProps) {
  const hasError = formik.touched[question.id] && formik.errors[question.id];

  return (
    <View style={[styles.container, { marginBottom: theme.spacing.lg }]}>
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.text,
            fontSize: theme.fontSize.md,
            marginBottom: theme.spacing.xs,
          },
        ]}>
        {question.title}
        {question.required && <Text style={{ color: theme.colors.error }}> *</Text>}
      </Text>

      {question.description && (
        <Text
          style={[
            styles.description,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.fontSize.sm,
              marginBottom: theme.spacing.sm,
            },
          ]}>
          {question.description}
        </Text>
      )}

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.cardBackground,
            color: theme.colors.text,
            borderColor: hasError ? theme.colors.error : theme.colors.border,
            borderRadius: theme.borderRadius.md,
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            fontSize: theme.fontSize.md,
          },
        ]}
        placeholder={question.placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        value={formik.values[question.id] || ''}
        onChangeText={formik.handleChange(question.id)}
        onBlur={formik.handleBlur(question.id)}
        multiline
        numberOfLines={3}
      />

      {hasError && (
        <Text
          style={[
            styles.error,
            {
              color: theme.colors.error,
              fontSize: theme.fontSize.sm,
              marginTop: theme.spacing.xs,
            },
          ]}>
          {formik.errors[question.id] as string}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  title: {
    fontWeight: '600',
  },
  description: {
    opacity: 0.8,
  },
  input: {
    borderWidth: 1,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  error: {},
});
