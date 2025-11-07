import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FormikProps } from 'formik';
import { Question, QuestionnaireTheme } from '../../types';

interface MultipleChoiceQuestionProps {
  question: Question;
  formik: FormikProps<Record<string, unknown>>;
  theme: QuestionnaireTheme;
}

export function MultipleChoiceQuestion({ question, formik, theme }: MultipleChoiceQuestionProps) {
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

      <View style={[styles.optionsContainer, { gap: theme.spacing.sm }]}>
        {question.options?.map((option) => {
          const isSelected = formik.values[question.id] === option.value;
          return (
            <Pressable
              key={option.value.toString()}
              style={({ pressed }) => [
                styles.optionButton,
                {
                  backgroundColor: isSelected
                    ? theme.colors.primary
                    : theme.colors.cardBackground,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  borderRadius: theme.borderRadius.md,
                  paddingVertical: theme.spacing.sm,
                  paddingHorizontal: theme.spacing.md,
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
              onPress={() => formik.setFieldValue(question.id, option.value)}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityHint={`Select ${option.label} for ${question.title}`}
              accessibilityState={{ selected: isSelected }}>
              <Text
                style={[
                  styles.optionText,
                  {
                    color: isSelected ? theme.colors.selectedBackground : theme.colors.text,
                    fontSize: theme.fontSize.md,
                  },
                ]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {hasError && (
        <Text
          style={[
            styles.error,
            {
              color: theme.colors.error,
              fontSize: theme.fontSize.sm,
              marginTop: theme.spacing.xs,
            },
          ]}
          accessibilityRole="alert"
          accessibilityLive="polite">
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
  optionsContainer: {},
  optionButton: {
    borderWidth: 2,
  },
  optionText: {
    fontWeight: '500',
  },
  error: {},
});
