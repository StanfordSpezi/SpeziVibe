import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FormikProps } from 'formik';
import type { QuestionnaireItem } from 'fhir/r4';
import { QuestionnaireTheme } from '../../types';

interface BooleanQuestionProps {
  item: QuestionnaireItem;
  formik: FormikProps<Record<string, unknown>>;
  theme: QuestionnaireTheme;
}

export function BooleanQuestion({ item, formik, theme }: BooleanQuestionProps) {
  const linkId = item.linkId!;
  const hasError = formik.touched[linkId] && formik.errors[linkId];

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

      <View style={[styles.booleanContainer, { gap: theme.spacing.sm }]}>
        {[
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ].map((option) => {
          const isSelected = formik.values[linkId] === option.value;
          return (
            <Pressable
              key={option.label}
              style={({ pressed }) => [
                styles.booleanButton,
                {
                  backgroundColor: isSelected
                    ? theme.colors.primary
                    : theme.colors.cardBackground,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  borderRadius: theme.borderRadius.md,
                  paddingVertical: theme.spacing.sm,
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
              onPress={() => formik.setFieldValue(linkId, option.value)}
              accessibilityRole="button"
              accessibilityLabel={`${option.label} for ${item.text}`}
              accessibilityHint={`Select ${option.label.toLowerCase()} as answer`}
              accessibilityState={{ selected: isSelected }}>
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
});
