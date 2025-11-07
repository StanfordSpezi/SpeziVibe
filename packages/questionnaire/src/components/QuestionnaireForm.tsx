import React from 'react';
import { View, Text, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { Formik } from 'formik';
import { QuestionnaireFormProps } from '../types';
import { createValidationSchema } from '../validation/schema-builder';
import { defaultLightTheme, mergeTheme } from '../theme/default-theme';
import {
  TextQuestion,
  ScaleQuestion,
  MultipleChoiceQuestion,
  BooleanQuestion,
} from './questions';

export function QuestionnaireForm({
  questionnaire,
  onSubmit,
  onCancel,
  theme: userTheme,
  initialValues: userInitialValues,
  submitButtonText = 'Submit',
  cancelButtonText = 'Cancel',
}: QuestionnaireFormProps) {
  const theme = mergeTheme(userTheme, defaultLightTheme);
  const validationSchema = createValidationSchema(questionnaire.questions);

  // Create initial values for form
  const initialValues: Record<string, any> = userInitialValues || {};
  questionnaire.questions.forEach((question) => {
    if (initialValues[question.id] === undefined) {
      initialValues[question.id] = '';
    }
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        try {
          await onSubmit(values);
        } catch (error) {
          Alert.alert('Error', 'Failed to submit questionnaire');
        }
      }}>
      {(formik) => (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingHorizontal: theme.spacing.lg,
                paddingTop: theme.spacing.xl * 2,
                paddingBottom: theme.spacing.lg,
              },
            ]}>
            <View style={{ marginBottom: theme.spacing.xl }}>
              <Text
                style={[
                  styles.title,
                  {
                    color: theme.colors.text,
                    fontSize: theme.fontSize.xl,
                    marginBottom: theme.spacing.xs,
                  },
                ]}>
                {questionnaire.title}
              </Text>
              <Text
                style={[
                  styles.description,
                  {
                    color: theme.colors.textSecondary,
                    fontSize: theme.fontSize.sm,
                  },
                ]}>
                {questionnaire.description}
              </Text>
            </View>

            {questionnaire.questions.map((question) => {
              switch (question.type) {
                case 'text':
                  return (
                    <TextQuestion key={question.id} question={question} formik={formik} theme={theme} />
                  );
                case 'scale':
                  return (
                    <ScaleQuestion key={question.id} question={question} formik={formik} theme={theme} />
                  );
                case 'multipleChoice':
                  return (
                    <MultipleChoiceQuestion
                      key={question.id}
                      question={question}
                      formik={formik}
                      theme={theme}
                    />
                  );
                case 'boolean':
                  return (
                    <BooleanQuestion key={question.id} question={question} formik={formik} theme={theme} />
                  );
                default:
                  return null;
              }
            })}
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                padding: theme.spacing.lg,
                paddingBottom: theme.spacing.xl * 1.5,
                gap: theme.spacing.sm,
              },
            ]}>
            {onCancel && (
              <Pressable
                style={[
                  styles.button,
                  styles.cancelButton,
                  {
                    backgroundColor: theme.colors.cardBackground,
                    borderRadius: theme.borderRadius.md,
                    paddingVertical: theme.spacing.md,
                  },
                ]}
                onPress={onCancel}>
                <Text
                  style={[
                    styles.buttonText,
                    { color: theme.colors.text, fontSize: theme.fontSize.lg },
                  ]}>
                  {cancelButtonText}
                </Text>
              </Pressable>
            )}
            <Pressable
              style={[
                styles.button,
                styles.submitButton,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.borderRadius.md,
                  paddingVertical: theme.spacing.md,
                  flex: onCancel ? 2 : undefined,
                },
              ]}
              onPress={() => {
                formik.handleSubmit();
                if (Object.keys(formik.errors).length > 0) {
                  Alert.alert('Incomplete Form', 'Please fill in all required fields');
                }
              }}>
              <Text
                style={[
                  styles.buttonText,
                  { color: theme.colors.selectedBackground, fontSize: theme.fontSize.lg },
                ]}>
                {submitButtonText}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </Formik>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {},
  title: {
    fontWeight: '700',
  },
  description: {
    lineHeight: 21,
    opacity: 0.8,
  },
  footer: {
    flexDirection: 'row',
  },
  button: {
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
  buttonText: {
    fontWeight: '600',
  },
});
