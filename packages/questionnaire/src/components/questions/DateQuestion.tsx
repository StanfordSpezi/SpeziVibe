import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FormikProps } from 'formik';
import { Question, QuestionnaireTheme } from '../../types';

// Conditional import for DateTimePicker
let DateTimePicker: any = null;
try {
  DateTimePicker = require('react-native-ui-datepicker').DateTimePicker;
} catch (e) {
  // DateTimePicker not installed
  console.warn('react-native-ui-datepicker is not installed. DateQuestion will not work.');
}

interface DateQuestionProps {
  question: Question;
  formik: FormikProps<Record<string, unknown>>;
  theme: QuestionnaireTheme;
}

export function DateQuestion({ question, formik, theme }: DateQuestionProps) {
  const hasError = formik.touched[question.id] && formik.errors[question.id];
  const currentValue = formik.values[question.id];
  const selectedDate = currentValue instanceof Date ? currentValue : currentValue ? new Date(currentValue as string) : undefined;

  const handleDateChange = (params: { date: Date }) => {
    formik.setFieldValue(question.id, params.date);
    formik.setFieldTouched(question.id, true);
  };

  if (!DateTimePicker) {
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
        <Text style={{ color: theme.colors.error, fontSize: theme.fontSize.sm }}>
          DateTimePicker not available. Please install react-native-ui-datepicker
        </Text>
      </View>
    );
  }

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

      <View
        style={[
          styles.pickerContainer,
          {
            borderColor: hasError ? theme.colors.error : theme.colors.border,
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.colors.cardBackground,
            padding: theme.spacing.sm,
          },
        ]}>
        <DateTimePicker
          mode="single"
          date={selectedDate}
          onChange={handleDateChange}
          selectedItemColor={theme.colors.primary}
          headerButtonColor={theme.colors.primary}
          calendarTextStyle={{ color: theme.colors.text }}
          headerTextStyle={{ color: theme.colors.text }}
          weekDaysTextStyle={{ color: theme.colors.textSecondary }}
          todayTextStyle={{ color: theme.colors.primary }}
        />
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
  pickerContainer: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  error: {},
});
