import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { FormikProps } from 'formik';
import type { QuestionnaireItem } from 'fhir/r4';
import { QuestionnaireTheme } from '../../types';

interface TextQuestionProps {
  item: QuestionnaireItem;
  formik: FormikProps<Record<string, unknown>>;
  theme: QuestionnaireTheme;
}

/**
 * Renders a text input question
 * Handles both 'string' (single-line) and 'text' (multi-line) FHIR types
 */
export function TextQuestion({ item, formik, theme }: TextQuestionProps) {
  const linkId = item.linkId!;
  const hasError = formik.touched[linkId] && formik.errors[linkId];
  const isMultiline = item.type === 'text';

  return (
    <View style={{ marginBottom: theme.spacing.lg }}>
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
        testID={`text-input-${linkId}`}
        style={[
          styles.input,
          isMultiline && styles.multilineInput,
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
        onChangeText={formik.handleChange(linkId)}
        onBlur={formik.handleBlur(linkId)}
        multiline={isMultiline}
        numberOfLines={isMultiline ? 3 : 1}
        maxLength={item.maxLength}
        accessibilityLabel={item.text}
        accessibilityHint={`Enter your response for ${item.text}`}
      />

      {hasError && (
        <Text
          style={{
            color: theme.colors.error,
            fontSize: theme.fontSize.sm,
            marginTop: theme.spacing.xs,
          }}
          accessibilityRole="alert">
          {formik.errors[linkId] as string}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
