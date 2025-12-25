import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FormikProps } from 'formik';
import type { QuestionnaireItem } from 'fhir/r4';
import { QuestionnaireTheme } from '../../types';

let DateTimePicker: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  DateTimePicker = require('react-native-ui-datepicker').DateTimePicker;
} catch {
  console.warn('react-native-ui-datepicker is not installed. DateQuestion will not work.');
}

interface DateQuestionProps {
  item: QuestionnaireItem;
  formik: FormikProps<Record<string, unknown>>;
  theme: QuestionnaireTheme;
}

/**
 * Renders a date question (date only, no time)
 */
export function DateQuestion({ item, formik, theme }: DateQuestionProps) {
  const linkId = item.linkId!;
  const hasError = formik.touched[linkId] && formik.errors[linkId];
  const currentValue = formik.values[linkId];
  const selectedDate = currentValue instanceof Date ? currentValue : currentValue ? new Date(currentValue as string) : undefined;

  const handleDateChange = (params: { date: Date }) => {
    formik.setFieldValue(linkId, params.date);
    formik.setFieldTouched(linkId, true);
  };

  if (!DateTimePicker) {
    return (
      <View style={[styles.container, { marginBottom: theme.spacing.lg }]}>
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
        {item.text}
        {item.required && <Text style={{ color: theme.colors.error }}> *</Text>}
      </Text>

      {item._text && (
        <Text
          style={[
            styles.description,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.fontSize.sm,
              marginBottom: theme.spacing.sm,
            },
          ]}>
          {item._text.extension?.[0]?.valueString}
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
          accessibilityRole="alert">
          {formik.errors[linkId] as string}
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
