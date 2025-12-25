import React from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { FormikProps } from 'formik';
import type { QuestionnaireItem } from 'fhir/r4';
import { QuestionnaireTheme } from '../../types';

interface TimeQuestionProps {
  item: QuestionnaireItem;
  formik: FormikProps<Record<string, unknown>>;
  theme: QuestionnaireTheme;
}

/**
 * Renders a time question (HH:MM format)
 * Uses simple text input for cross-platform compatibility
 */
export function TimeQuestion({ item, formik, theme }: TimeQuestionProps) {
  const linkId = item.linkId!;
  const hasError = formik.touched[linkId] && formik.errors[linkId];

  const handleTimeChange = (text: string) => {
    const cleaned = text.replace(/[^0-9:]/g, '');
    formik.setFieldValue(linkId, cleaned);
  };

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
        value={(formik.values[linkId] as string) || ''}
        onChangeText={handleTimeChange}
        onBlur={formik.handleBlur(linkId)}
        placeholder="HH:MM"
        placeholderTextColor={theme.colors.textSecondary}
        keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
        maxLength={5}
        accessibilityLabel={item.text}
        accessibilityHint="Enter time in HH:MM format"
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
  input: {
    borderWidth: 1,
    minHeight: 44,
  },
  error: {},
});
