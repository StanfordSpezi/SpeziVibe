import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FormikProps } from 'formik';
import type { QuestionnaireItem, QuestionnaireResponse } from 'fhir/r4';
import { QuestionnaireTheme } from '../../types';
import { QuestionRenderer } from '../QuestionRenderer';

interface GroupQuestionProps {
  item: QuestionnaireItem;
  formik: FormikProps<Record<string, unknown>>;
  theme: QuestionnaireTheme;
  questionnaire: any; // Will be typed properly in QuestionnaireForm
  questionnaireResponse: QuestionnaireResponse;
}

/**
 * Renders a group question (container for nested questions)
 * Recursively renders child items
 */
export function GroupQuestion({ item, formik, theme, questionnaire, questionnaireResponse }: GroupQuestionProps) {
  if (!item.item || item.item.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { marginBottom: theme.spacing.lg }]}>
      {item.text && (
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.text,
              fontSize: theme.fontSize.lg,
              marginBottom: theme.spacing.md,
            },
          ]}>
          {item.text}
        </Text>
      )}

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

      <View style={[styles.groupContent, { paddingLeft: theme.spacing.md }]}>
        {item.item.map((childItem) => (
          <QuestionRenderer
            key={childItem.linkId}
            item={childItem}
            formik={formik}
            theme={theme}
            questionnaire={questionnaire}
            questionnaireResponse={questionnaireResponse}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  title: {
    fontWeight: '700',
  },
  description: {
    opacity: 0.8,
  },
  groupContent: {
    borderLeftWidth: 2,
  },
});
