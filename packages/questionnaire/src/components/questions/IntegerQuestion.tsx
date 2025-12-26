import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { FormikProps } from 'formik';
import type { QuestionnaireItem } from 'fhir/r4';
import { QuestionnaireTheme } from '../../types';

interface IntegerQuestionProps {
  item: QuestionnaireItem;
  formik: FormikProps<Record<string, unknown>>;
  theme: QuestionnaireTheme;
}

/**
 * Get min/max values from extensions
 */
function getMinMax(item: QuestionnaireItem): { min?: number; max?: number } {
  if (!item.extension) return {};

  let min: number | undefined;
  let max: number | undefined;

  for (const ext of item.extension) {
    if (ext.url === 'http://hl7.org/fhir/StructureDefinition/minValue') {
      min = ext.valueInteger;
    }
    if (ext.url === 'http://hl7.org/fhir/StructureDefinition/maxValue') {
      max = ext.valueInteger;
    }
  }

  return { min, max };
}

/**
 * Check if item should render as a slider
 */
function isSlider(item: QuestionnaireItem): boolean {
  if (!item.extension) return false;

  return item.extension.some(
    (ext) =>
      ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl' &&
      ext.valueCodeableConcept?.coding?.some((coding) => coding.code === 'slider')
  );
}

/**
 * Renders an integer question
 * Can render as either a slider (if questionnaire-itemControl extension = 'slider')
 * or as buttons/input based on min/max range
 */
export function IntegerQuestion({ item, formik, theme }: IntegerQuestionProps) {
  const linkId = item.linkId!;
  const hasError = formik.touched[linkId] && formik.errors[linkId];
  const { min, max } = getMinMax(item);
  const shouldRenderSlider = isSlider(item);

  // If range is reasonable (1-20), show buttons; otherwise show input
  const shouldShowButtons = !shouldRenderSlider && min !== undefined && max !== undefined && max - min <= 20;

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

      {shouldShowButtons ? (
        <View style={[styles.buttonsContainer, { gap: theme.spacing.xs }]}>
          {Array.from({ length: max! - min! + 1 }, (_, i) => min! + i).map((value) => {
            const isSelected = formik.values[linkId] === value;
            return (
              <Pressable
                key={value}
                style={({ pressed }) => [
                  styles.numberButton,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.cardBackground,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    borderRadius: theme.borderRadius.md,
                    paddingVertical: theme.spacing.sm,
                    paddingHorizontal: theme.spacing.md,
                    opacity: pressed ? 0.7 : 1,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  },
                ]}
                onPress={() => formik.setFieldValue(linkId, value)}
                accessibilityRole="button"
                accessibilityLabel={`${value}`}
                accessibilityState={{ selected: isSelected }}>
                <Text
                  style={[
                    styles.numberText,
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
      ) : (
        <TextInput
          testID={shouldRenderSlider ? `slider-${linkId}` : `integer-input-${linkId}`}
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
          value={formik.values[linkId]?.toString() || ''}
          onChangeText={(text) => {
            const num = parseInt(text, 10);
            formik.setFieldValue(linkId, isNaN(num) ? undefined : num);
          }}
          onBlur={formik.handleBlur(linkId)}
          keyboardType="number-pad"
          accessibilityLabel={item.text}
          accessibilityHint="Enter a whole number"
        />
      )}

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
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  numberButton: {
    borderWidth: 2,
    minWidth: 44,
    alignItems: 'center',
  },
  numberText: {
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    minHeight: 44,
  },
});
