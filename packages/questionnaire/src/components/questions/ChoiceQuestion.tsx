import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FormikProps } from 'formik';
import type { QuestionnaireItem } from 'fhir/r4';
import { QuestionnaireTheme } from '../../types';

interface ChoiceQuestionProps {
  item: QuestionnaireItem;
  formik: FormikProps<Record<string, unknown>>;
  theme: QuestionnaireTheme;
}

/**
 * Renders a choice (single-select) question
 * Handles FHIR 'choice' type with answerOption
 */
export function ChoiceQuestion({ item, formik, theme }: ChoiceQuestionProps) {
  const linkId = item.linkId!;
  const hasError = formik.touched[linkId] && formik.errors[linkId];

  if (!item.answerOption || item.answerOption.length === 0) {
    return null;
  }

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

      <View style={{ gap: theme.spacing.sm }}>
        {item.answerOption.map((option, index) => {
          // Get the value - can be valueCoding, valueInteger, valueString, etc.
          const coding = option.valueCoding;
          const value = option.valueInteger ?? option.valueString ?? coding?.code;
          const display = coding?.display || value?.toString() || `Option ${index + 1}`;

          const isSelected = formik.values[linkId] === value;

          return (
            <Pressable
              key={value?.toString() || index}
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
              onPress={() => formik.setFieldValue(linkId, value)}
              accessibilityRole="button"
              accessibilityLabel={display}
              accessibilityHint={`Select ${display}`}
              accessibilityState={{ selected: isSelected }}>
              <Text
                style={[
                  styles.optionText,
                  {
                    color: isSelected ? theme.colors.selectedBackground : theme.colors.text,
                    fontSize: theme.fontSize.md,
                  },
                ]}>
                {display}
              </Text>
            </Pressable>
          );
        })}
      </View>

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
  optionButton: {
    borderWidth: 2,
  },
  optionText: {
    fontWeight: '500',
  },
});
