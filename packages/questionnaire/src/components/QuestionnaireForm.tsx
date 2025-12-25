/**
 * QuestionnaireForm - Main component for rendering FHIR Questionnaires
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Alert from '@blazejkustra/react-native-alert';
import { Formik, FormikProps } from 'formik';
import type { Questionnaire, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import { QuestionnaireFormProps } from '../types';
import { createValidationSchema } from '../validation/schema-builder';
import { defaultLightTheme, mergeTheme } from '../theme/default-theme';
import { QuestionRenderer } from './QuestionRenderer';

/**
 * Build initial FormikValues from FHIR QuestionnaireResponse or empty defaults
 */
function buildInitialValues(
  questionnaire: Questionnaire,
  initialResponse?: QuestionnaireResponse
): Record<string, unknown> {
  const values: Record<string, unknown> = {};

  // Initialize default values from questionnaire structure
  const initializeDefaults = (items: any[] | undefined) => {
    if (!items) return;

    for (const item of items) {
      if (item.linkId && item.type !== 'display' && item.type !== 'group') {
        // Initialize with undefined so Formik tracks the field
        values[item.linkId] = undefined;
      }

      // Process nested items
      if (item.item) {
        initializeDefaults(item.item);
      }
    }
  };

  // First, set up default structure
  initializeDefaults(questionnaire.item);

  // Then override with initial response values if provided
  if (initialResponse?.item) {
    const extractValues = (items: QuestionnaireResponseItem[]) => {
      for (const item of items) {
        if (item.linkId && item.answer && item.answer.length > 0) {
          // Take first answer for simplicity
          const answer = item.answer[0];

          if (answer.valueBoolean !== undefined) values[item.linkId] = answer.valueBoolean;
          else if (answer.valueInteger !== undefined) values[item.linkId] = answer.valueInteger;
          else if (answer.valueDecimal !== undefined) values[item.linkId] = answer.valueDecimal;
          else if (answer.valueString !== undefined) values[item.linkId] = answer.valueString;
          else if (answer.valueDate !== undefined) values[item.linkId] = new Date(answer.valueDate);
          else if (answer.valueDateTime !== undefined) values[item.linkId] = new Date(answer.valueDateTime);
          else if (answer.valueTime !== undefined) values[item.linkId] = answer.valueTime;
          else if (answer.valueCoding !== undefined) values[item.linkId] = answer.valueCoding.code;
        }

        if (item.item) extractValues(item.item);
      }
    };

    extractValues(initialResponse.item);
  }

  return values;
}

/**
 * Build FHIR QuestionnaireResponse from Formik values
 */
function buildQuestionnaireResponse(
  questionnaire: Questionnaire,
  values: Record<string, unknown>
): QuestionnaireResponse {
  const processItems = (items: any[] | undefined): QuestionnaireResponseItem[] => {
    if (!items) return [];

    return items
      .map((item: any): QuestionnaireResponseItem | null => {
        if (!item.linkId) return null;

        const value = values[item.linkId];

        // Skip if no value and not required
        if (value === undefined || value === '' || value === null) {
          // But still process nested items for groups
          if (item.type === 'group' && item.item) {
            const nestedItems: QuestionnaireResponseItem[] = processItems(item.item);
            if (nestedItems.length > 0) {
              return {
                linkId: item.linkId,
                text: item.text,
                item: nestedItems,
              };
            }
          }
          return null;
        }

        const responseItem: QuestionnaireResponseItem = {
          linkId: item.linkId,
          text: item.text,
        };

        if (item.type === 'boolean') {
          responseItem.answer = [{ valueBoolean: value as boolean }];
        } else if (item.type === 'integer') {
          responseItem.answer = [{ valueInteger: value as number }];
        } else if (item.type === 'decimal') {
          responseItem.answer = [{ valueDecimal: value as number }];
        } else if (item.type === 'string' || item.type === 'text') {
          responseItem.answer = [{ valueString: value as string }];
        } else if (item.type === 'date') {
          const date = value instanceof Date ? value : new Date(value as string);
          responseItem.answer = [{ valueDate: date.toISOString().split('T')[0] }];
        } else if (item.type === 'dateTime') {
          const date = value instanceof Date ? value : new Date(value as string);
          responseItem.answer = [{ valueDateTime: date.toISOString() }];
        } else if (item.type === 'time') {
          responseItem.answer = [{ valueTime: value as string }];
        } else if (item.type === 'choice' || item.type === 'open-choice') {
          const option = item.answerOption?.find((opt: any) => opt.valueCoding?.code === value);
          if (option?.valueCoding) {
            responseItem.answer = [{ valueCoding: option.valueCoding }];
          }
        }

        if (item.type === 'group' && item.item) {
          responseItem.item = processItems(item.item);
        }

        return responseItem;
      })
      .filter((item): item is QuestionnaireResponseItem => item !== null);
  };

  const items = processItems(questionnaire.item);

  return {
    resourceType: 'QuestionnaireResponse',
    status: 'completed',
    questionnaire: questionnaire.url || `Questionnaire/${questionnaire.id}`,
    authored: new Date().toISOString(),
    item: items,
  };
}

export function QuestionnaireForm({
  questionnaire,
  onResult,
  completionMessage,
  cancelBehavior = 'confirm',
  theme: userTheme,
  initialResponse,
  submitButtonText = 'Submit',
  cancelButtonText = 'Cancel',
}: QuestionnaireFormProps) {
  const [showCompletion, setShowCompletion] = useState(false);
  const [completedResponse, setCompletedResponse] = useState<QuestionnaireResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const theme = useMemo(() => mergeTheme(userTheme, defaultLightTheme), [userTheme]);

  const validationSchema = useMemo(
    () => createValidationSchema(questionnaire.item || []),
    [questionnaire.item]
  );

  const initialValues = useMemo(
    () => buildInitialValues(questionnaire, initialResponse),
    [questionnaire, initialResponse]
  );

  // Store reference to Formik instance for enableWhen evaluation
  const formikRef = useRef<FormikProps<Record<string, unknown>> | null>(null);

  // Track form values for enableWhen evaluation
  const [formValues, setFormValues] = useState<Record<string, unknown>>(initialValues);

  const currentResponse = useMemo(
    () => buildQuestionnaireResponse(questionnaire, formValues),
    [questionnaire, formValues]
  );

  const handleCancel = useCallback(() => {
    if (cancelBehavior === 'disabled') return;

    if (cancelBehavior === 'immediate') {
      onResult({ status: 'cancelled' });
      return;
    }

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
  }, [cancelBehavior, onResult]);

  const submitQuestionnaire = useCallback(async (response: QuestionnaireResponse) => {
    try {
      await onResult({
        status: 'completed',
        response,
      });
    } catch (error) {
      console.error('[QuestionnaireForm] Error in submitQuestionnaire:', error);
      onResult({
        status: 'failed',
        error: error instanceof Error ? error : new Error('Failed to submit questionnaire'),
      });
    }
  }, [onResult]);

  const handleSubmit = useCallback(async (values: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      const response = buildQuestionnaireResponse(questionnaire, values);

      if (completionMessage) {
        setCompletedResponse(response);
        setShowCompletion(true);
      } else {
        await submitQuestionnaire(response);
      }
    } catch (error) {
      console.error('[QuestionnaireForm] Error in handleSubmit:', error);
      onResult({
        status: 'failed',
        error: error instanceof Error ? error : new Error('Unknown error'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [completionMessage, questionnaire, submitQuestionnaire, onResult]);

  const handleCompletionDone = useCallback(async () => {
    if (completedResponse) {
      await submitQuestionnaire(completedResponse);
    }
  }, [completedResponse, submitQuestionnaire]);

  // Update formValues when Formik values change (for enableWhen evaluation)
  // This effect intentionally runs on every render to sync with Formik's internal state
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (formikRef.current && formikRef.current.values !== formValues) {
      setFormValues(formikRef.current.values);
    }
  });

  if (showCompletion && completedResponse) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.completionContainer, { padding: theme.spacing.xl }]}>
          <Text
            style={[
              styles.completionText,
              {
                color: theme.colors.text,
                fontSize: theme.fontSize.lg,
                marginBottom: theme.spacing.lg,
              },
            ]}>
            {completionMessage}
          </Text>

          <Pressable
            style={[
              styles.button,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.borderRadius.md,
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.lg,
              },
            ]}
            onPress={handleCompletionDone}
            disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color={theme.colors.selectedBackground} />
            ) : (
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: theme.colors.selectedBackground,
                    fontSize: theme.fontSize.md,
                  },
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
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}>
        {(formik) => {
          // Store formik reference for value updates
          formikRef.current = formik;

          return (
            <>
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { padding: theme.spacing.lg }]}
                keyboardShouldPersistTaps="handled">
                <View style={[styles.header, { marginBottom: theme.spacing.xl }]}>
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
                  {questionnaire.description && (
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
                  )}
                </View>

                {questionnaire.item?.map((item: any) => (
                  <QuestionRenderer
                    key={item.linkId}
                    item={item}
                    formik={formik}
                    theme={theme}
                    questionnaire={questionnaire}
                    questionnaireResponse={currentResponse}
                  />
                ))}
              </ScrollView>

              <View
                style={[
                  styles.footer,
                  {
                    padding: theme.spacing.lg,
                    borderTopColor: theme.colors.border,
                    gap: theme.spacing.sm,
                  },
                ]}>
                <Pressable
                  style={[
                    styles.button,
                    styles.primaryButton,
                    {
                      backgroundColor: theme.colors.primary,
                      borderRadius: theme.borderRadius.md,
                      paddingVertical: theme.spacing.md,
                    },
                  ]}
                  onPress={() => formik.handleSubmit()}
                  disabled={isSubmitting}>
                  {isSubmitting ? (
                    <ActivityIndicator color={theme.colors.selectedBackground} />
                  ) : (
                    <Text
                      style={[
                        styles.buttonText,
                        {
                          color: theme.colors.selectedBackground,
                          fontSize: theme.fontSize.md,
                        },
                      ]}>
                      {submitButtonText}
                    </Text>
                  )}
                </Pressable>

                {cancelBehavior !== 'disabled' && (
                  <Pressable
                    style={[
                      styles.button,
                      styles.secondaryButton,
                      {
                        borderColor: theme.colors.border,
                        borderRadius: theme.borderRadius.md,
                        paddingVertical: theme.spacing.md,
                      },
                    ]}
                    onPress={handleCancel}
                    disabled={isSubmitting}>
                    <Text
                      style={[
                        styles.buttonText,
                        {
                          color: theme.colors.text,
                          fontSize: theme.fontSize.md,
                        },
                      ]}>
                      {cancelButtonText}
                    </Text>
                  </Pressable>
                )}
              </View>
            </>
          );
        }}
      </Formik>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {},
  title: {
    fontWeight: '700',
  },
  description: {},
  footer: {
    borderTopWidth: 1,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {},
  secondaryButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontWeight: '600',
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionText: {
    textAlign: 'center',
  },
});
