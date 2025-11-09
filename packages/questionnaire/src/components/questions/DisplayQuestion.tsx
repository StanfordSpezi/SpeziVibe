import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { QuestionnaireItem } from 'fhir/r4';
import { QuestionnaireTheme } from '../../types';

interface DisplayQuestionProps {
  item: QuestionnaireItem;
  theme: QuestionnaireTheme;
}

/**
 * Renders a display item (instructions, headers, etc.)
 * Does not collect user input
 */
export function DisplayQuestion({ item, theme }: DisplayQuestionProps) {
  return (
    <View style={[styles.container, { marginBottom: theme.spacing.lg }]}>
      <Text
        style={[
          styles.text,
          {
            color: theme.colors.text,
            fontSize: theme.fontSize.md,
          },
        ]}>
        {item.text}
      </Text>

      {item._text && (
        <Text
          style={[
            styles.description,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.fontSize.sm,
              marginTop: theme.spacing.xs,
            },
          ]}>
          {item._text.extension?.[0]?.valueString}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  text: {
    fontWeight: '500',
  },
  description: {
    opacity: 0.8,
  },
});
