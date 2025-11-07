import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FormikProps } from 'formik';
import { Question, QuestionnaireTheme } from '../../types';

interface ScaleQuestionProps {
  question: Question;
  formik: FormikProps<Record<string, unknown>>;
  theme: QuestionnaireTheme;
}

export function ScaleQuestion({ question, formik, theme }: ScaleQuestionProps) {
  const min = question.min || 1;
  const max = question.max || 10;
  const values = useMemo(
    () => Array.from({ length: max - min + 1 }, (_, i) => min + i),
    [min, max]
  );
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

      <View style={[styles.scaleContainer, { gap: theme.spacing.xs }]}>
        {values.map((value) => {
          const isSelected = formik.values[question.id] === value;
          return (
            <Pressable
              key={value}
              style={({ pressed }) => [
                styles.scaleButton,
                {
                  backgroundColor: isSelected
                    ? theme.colors.primary
                    : theme.colors.cardBackground,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  borderRadius: theme.borderRadius.lg,
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                },
              ]}
              onPress={() => formik.setFieldValue(question.id, value)}
              accessibilityRole="button"
              accessibilityLabel={`${question.title}, value ${value}`}
              accessibilityHint={`Selects ${value} on a scale from ${min} to ${max}`}
              accessibilityState={{ selected: isSelected }}>
              <Text
                style={[
                  styles.scaleButtonText,
                  {
                    color: isSelected ? theme.colors.selectedBackground : theme.colors.text,
                    fontSize: theme.fontSize.md,
                  },
                ]}>
                {value}
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
  scaleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  scaleButton: {
    width: 48,
    height: 48,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scaleButtonText: {
    fontWeight: '600',
  },
  error: {},
});
