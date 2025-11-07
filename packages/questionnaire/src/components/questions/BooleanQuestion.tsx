import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FormikProps } from 'formik';
import { Question, QuestionnaireTheme } from '../../types';

interface BooleanQuestionProps {
  question: Question;
  formik: FormikProps<any>;
  theme: QuestionnaireTheme;
}

export function BooleanQuestion({ question, formik, theme }: BooleanQuestionProps) {
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

      <View style={[styles.booleanContainer, { gap: theme.spacing.sm }]}>
        {[
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ].map((option) => {
          const isSelected = formik.values[question.id] === option.value;
          return (
            <Pressable
              key={option.label}
              style={[
                styles.booleanButton,
                {
                  backgroundColor: isSelected
                    ? theme.colors.primary
                    : theme.colors.cardBackground,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  borderRadius: theme.borderRadius.md,
                  paddingVertical: theme.spacing.sm,
                },
              ]}
              onPress={() => formik.setFieldValue(question.id, option.value)}>
              <Text
                style={[
                  styles.booleanText,
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
  booleanContainer: {
    flexDirection: 'row',
  },
  booleanButton: {
    flex: 1,
    borderWidth: 2,
    alignItems: 'center',
  },
  booleanText: {
    fontWeight: '600',
  },
  error: {},
});
