import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Formik } from 'formik';
import { QuestionnaireFormProps, QuestionnaireResponse } from '../types';
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
  onResult,
  completionMessage,
  cancelBehavior = 'confirm',
  theme: userTheme,
  initialValues: userInitialValues,
  submitButtonText = 'Submit',
  cancelButtonText = 'Cancel',
}: QuestionnaireFormProps) {
  const [showCompletion, setShowCompletion] = useState(false);
  const [completedAnswers, setCompletedAnswers] = useState<Record<string, unknown> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoize theme to prevent unnecessary re-renders
  const theme = useMemo(
    () => mergeTheme(userTheme, defaultLightTheme),
    [userTheme]
  );

  // Memoize validation schema
  const validationSchema = useMemo(
    () => createValidationSchema(questionnaire.questions),
    [questionnaire.questions]
  );

  // Memoize initial values for form
  const initialValues = useMemo(() => {
    const values: Record<string, unknown> = { ...userInitialValues };
    questionnaire.questions.forEach((question) => {
      if (values[question.id] === undefined) {
        values[question.id] = '';
      }
    });
    return values;
  }, [questionnaire.questions, userInitialValues]);

  const handleCancel = () => {
    if (cancelBehavior === 'disabled') {
      return;
    }

    if (cancelBehavior === 'immediate') {
      onResult({ status: 'cancelled' });
      return;
    }

    // cancelBehavior === 'confirm'
    Alert.alert(
      'Cancel Questionnaire',
      'Are you sure you want to cancel? Your responses will not be saved.',
      [
        { text: 'Continue', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => onResult({ status: 'cancelled' }),
        },
      ]
    );
  };

  const handleSubmit = async (answers: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      // If there's a completion message, show it first
      if (completionMessage) {
        setCompletedAnswers(answers);
        setShowCompletion(true);
      } else {
        // Otherwise submit immediately
        await submitQuestionnaire(answers);
      }
    } catch (error) {
      onResult({
        status: 'failed',
        error: error instanceof Error ? error : new Error('Unknown error'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitQuestionnaire = async (answers: Record<string, unknown>) => {
    const response: QuestionnaireResponse = {
      id: `${questionnaire.id}-${Date.now()}`,
      questionnaireId: questionnaire.id,
      completedAt: new Date(),
      answers,
    };

    await onResult({ status: 'completed', response });
  };

  // Show completion message screen
  if (showCompletion && completedAnswers) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.completionContainer}>
          <Text
            style={[
              styles.completionTitle,
              {
                color: theme.colors.text,
                fontSize: theme.fontSize.xl,
                marginBottom: theme.spacing.lg,
              },
            ]}>
            Complete
          </Text>
          <Text
            style={[
              styles.completionMessage,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.fontSize.md,
                marginBottom: theme.spacing.xl,
              },
            ]}>
            {completionMessage}
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.borderRadius.md,
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.xl,
                opacity: pressed || isSubmitting ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
            onPress={() => submitQuestionnaire(completedAnswers)}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Done"
            accessibilityHint="Submits the completed questionnaire">
            {isSubmitting ? (
              <ActivityIndicator color={theme.colors.selectedBackground} />
            ) : (
              <Text
                style={[
                  styles.buttonText,
                  { color: theme.colors.selectedBackground, fontSize: theme.fontSize.lg },
                ]}>
                Done
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}>
      {(formik) => (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
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
              ]}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive">
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
              {cancelBehavior !== 'disabled' && (
                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    styles.cancelButton,
                    {
                      backgroundColor: theme.colors.cardBackground,
                      borderRadius: theme.borderRadius.md,
                      paddingVertical: theme.spacing.md,
                      opacity: pressed || isSubmitting ? 0.7 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                  onPress={handleCancel}
                  disabled={isSubmitting}
                  accessibilityRole="button"
                  accessibilityLabel={cancelButtonText}
                  accessibilityHint="Cancels the questionnaire without saving">
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
                style={({ pressed }) => [
                  styles.button,
                  styles.submitButton,
                  {
                    backgroundColor: theme.colors.primary,
                    borderRadius: theme.borderRadius.md,
                    paddingVertical: theme.spacing.md,
                    flex: cancelBehavior !== 'disabled' ? 2 : undefined,
                    opacity: pressed || isSubmitting ? 0.7 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
                onPress={() => {
                  formik.handleSubmit();
                  if (Object.keys(formik.errors).length > 0) {
                    Alert.alert('Incomplete Form', 'Please fill in all required fields');
                  }
                }}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel={submitButtonText}
                accessibilityHint="Submits the questionnaire with your answers">
                {isSubmitting ? (
                  <ActivityIndicator color={theme.colors.selectedBackground} />
                ) : (
                  <Text
                    style={[
                      styles.buttonText,
                      { color: theme.colors.selectedBackground, fontSize: theme.fontSize.lg },
                    ]}>
                    {submitButtonText}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  completionTitle: {
    fontWeight: '700',
    textAlign: 'center',
  },
  completionMessage: {
    textAlign: 'center',
    lineHeight: 24,
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
