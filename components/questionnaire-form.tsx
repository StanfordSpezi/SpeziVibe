import { View, StyleSheet, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { ThemedText } from './themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Question, Questionnaire } from '@/lib/questionnaires/types';

interface QuestionnaireFormProps {
  questionnaire: Questionnaire;
  onSubmit: (answers: Record<string, any>) => void;
  onCancel?: () => void;
}

function createValidationSchema(questions: Question[]) {
  const schema: Record<string, any> = {};

  questions.forEach((question) => {
    if (question.required) {
      switch (question.type) {
        case 'text':
          schema[question.id] = Yup.string().required('This field is required');
          break;
        case 'scale':
          schema[question.id] = Yup.number()
            .min(question.min || 1, `Must be at least ${question.min || 1}`)
            .max(question.max || 10, `Must be at most ${question.max || 10}`)
            .required('This field is required');
          break;
        case 'multipleChoice':
          schema[question.id] = Yup.mixed().required('Please select an option');
          break;
        case 'boolean':
          schema[question.id] = Yup.boolean().required('Please make a selection');
          break;
      }
    }
  });

  return Yup.object().shape(schema);
}

function TextQuestion({ question, formik, isDark }: { question: Question; formik: FormikProps<any>; isDark: boolean }) {
  return (
    <View style={styles.questionContainer}>
      <ThemedText type="defaultSemiBold" style={styles.questionTitle}>
        {question.title}
        {question.required && <ThemedText style={styles.required}> *</ThemedText>}
      </ThemedText>
      {question.description && (
        <ThemedText style={styles.questionDescription}>{question.description}</ThemedText>
      )}
      <TextInput
        style={[
          styles.textInput,
          {
            backgroundColor: isDark ? '#1D1D1D' : '#F5F5F5',
            color: isDark ? '#fff' : '#000',
            borderColor: formik.touched[question.id] && formik.errors[question.id]
              ? '#DC3545'
              : isDark ? '#333' : '#E0E0E0',
          },
        ]}
        placeholder={question.placeholder}
        placeholderTextColor={isDark ? '#666' : '#999'}
        value={formik.values[question.id] || ''}
        onChangeText={formik.handleChange(question.id)}
        onBlur={formik.handleBlur(question.id)}
        multiline
        numberOfLines={3}
      />
      {formik.touched[question.id] && formik.errors[question.id] && (
        <ThemedText style={styles.errorText}>{formik.errors[question.id] as string}</ThemedText>
      )}
    </View>
  );
}

function ScaleQuestion({ question, formik, isDark }: { question: Question; formik: FormikProps<any>; isDark: boolean }) {
  const min = question.min || 1;
  const max = question.max || 10;
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <View style={styles.questionContainer}>
      <ThemedText type="defaultSemiBold" style={styles.questionTitle}>
        {question.title}
        {question.required && <ThemedText style={styles.required}> *</ThemedText>}
      </ThemedText>
      {question.description && (
        <ThemedText style={styles.questionDescription}>{question.description}</ThemedText>
      )}
      <View style={styles.scaleContainer}>
        {values.map((value) => {
          const isSelected = formik.values[question.id] === value;
          return (
            <Pressable
              key={value}
              style={[
                styles.scaleButton,
                {
                  backgroundColor: isSelected
                    ? isDark ? '#B83A4B' : '#8C1515'
                    : isDark ? '#1D1D1D' : '#F5F5F5',
                  borderColor: isSelected
                    ? isDark ? '#B83A4B' : '#8C1515'
                    : isDark ? '#333' : '#E0E0E0',
                },
              ]}
              onPress={() => formik.setFieldValue(question.id, value)}>
              <ThemedText
                style={[
                  styles.scaleButtonText,
                  { color: isSelected ? (isDark ? '#000' : '#fff') : undefined },
                ]}>
                {value}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
      {formik.touched[question.id] && formik.errors[question.id] && (
        <ThemedText style={styles.errorText}>{formik.errors[question.id] as string}</ThemedText>
      )}
    </View>
  );
}

function MultipleChoiceQuestion({ question, formik, isDark }: { question: Question; formik: FormikProps<any>; isDark: boolean }) {
  return (
    <View style={styles.questionContainer}>
      <ThemedText type="defaultSemiBold" style={styles.questionTitle}>
        {question.title}
        {question.required && <ThemedText style={styles.required}> *</ThemedText>}
      </ThemedText>
      {question.description && (
        <ThemedText style={styles.questionDescription}>{question.description}</ThemedText>
      )}
      <View style={styles.optionsContainer}>
        {question.options?.map((option) => {
          const isSelected = formik.values[question.id] === option.value;
          return (
            <Pressable
              key={option.value.toString()}
              style={[
                styles.optionButton,
                {
                  backgroundColor: isSelected
                    ? isDark ? '#B83A4B' : '#8C1515'
                    : isDark ? '#1D1D1D' : '#F5F5F5',
                  borderColor: isSelected
                    ? isDark ? '#B83A4B' : '#8C1515'
                    : isDark ? '#333' : '#E0E0E0',
                },
              ]}
              onPress={() => formik.setFieldValue(question.id, option.value)}>
              <ThemedText
                style={[
                  styles.optionText,
                  { color: isSelected ? (isDark ? '#000' : '#fff') : undefined },
                ]}>
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
      {formik.touched[question.id] && formik.errors[question.id] && (
        <ThemedText style={styles.errorText}>{formik.errors[question.id] as string}</ThemedText>
      )}
    </View>
  );
}

function BooleanQuestion({ question, formik, isDark }: { question: Question; formik: FormikProps<any>; isDark: boolean }) {
  return (
    <View style={styles.questionContainer}>
      <ThemedText type="defaultSemiBold" style={styles.questionTitle}>
        {question.title}
        {question.required && <ThemedText style={styles.required}> *</ThemedText>}
      </ThemedText>
      {question.description && (
        <ThemedText style={styles.questionDescription}>{question.description}</ThemedText>
      )}
      <View style={styles.booleanContainer}>
        {[
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ].map((option) => {
          const isSelected = formik.values[question.id] === option.value;
          return (
            <Pressable
              key={option.label}
              style={[
                styles.booleanButton,
                {
                  backgroundColor: isSelected
                    ? isDark ? '#B83A4B' : '#8C1515'
                    : isDark ? '#1D1D1D' : '#F5F5F5',
                  borderColor: isSelected
                    ? isDark ? '#B83A4B' : '#8C1515'
                    : isDark ? '#333' : '#E0E0E0',
                },
              ]}
              onPress={() => formik.setFieldValue(question.id, option.value)}>
              <ThemedText
                style={[
                  styles.booleanText,
                  { color: isSelected ? (isDark ? '#000' : '#fff') : undefined },
                ]}>
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
      {formik.touched[question.id] && formik.errors[question.id] && (
        <ThemedText style={styles.errorText}>{formik.errors[question.id] as string}</ThemedText>
      )}
    </View>
  );
}

export function QuestionnaireForm({ questionnaire, onSubmit, onCancel }: QuestionnaireFormProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const validationSchema = createValidationSchema(questionnaire.questions);
  const initialValues: Record<string, any> = {};

  questionnaire.questions.forEach((question) => {
    initialValues[question.id] = '';
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        onSubmit(values);
      }}>
      {(formik) => (
        <View style={styles.container}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <ThemedText type="title" style={styles.title}>
                {questionnaire.title}
              </ThemedText>
              <ThemedText style={styles.description}>{questionnaire.description}</ThemedText>
            </View>

            {questionnaire.questions.map((question) => {
              switch (question.type) {
                case 'text':
                  return <TextQuestion key={question.id} question={question} formik={formik} isDark={isDark} />;
                case 'scale':
                  return <ScaleQuestion key={question.id} question={question} formik={formik} isDark={isDark} />;
                case 'multipleChoice':
                  return <MultipleChoiceQuestion key={question.id} question={question} formik={formik} isDark={isDark} />;
                case 'boolean':
                  return <BooleanQuestion key={question.id} question={question} formik={formik} isDark={isDark} />;
                default:
                  return null;
              }
            })}
          </ScrollView>

          <View style={styles.footer}>
            {onCancel && (
              <Pressable
                style={[
                  styles.button,
                  styles.cancelButton,
                  { backgroundColor: isDark ? '#2D2D2D' : '#F5F5F5' },
                ]}
                onPress={onCancel}>
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </Pressable>
            )}
            <Pressable
              style={[
                styles.button,
                styles.submitButton,
                { backgroundColor: isDark ? '#B83A4B' : '#8C1515', flex: onCancel ? 1 : undefined },
              ]}
              onPress={() => {
                formik.handleSubmit();
                if (Object.keys(formik.errors).length > 0) {
                  Alert.alert('Incomplete Form', 'Please fill in all required fields');
                }
              }}>
              <ThemedText style={[styles.submitButtonText, { color: isDark ? '#000' : '#fff' }]}>
                Submit
              </ThemedText>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    opacity: 0.7,
    lineHeight: 21,
  },
  questionContainer: {
    marginBottom: 32,
  },
  questionTitle: {
    fontSize: 17,
    marginBottom: 8,
  },
  required: {
    color: '#DC3545',
  },
  questionDescription: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 12,
  },
  textInput: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  scaleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scaleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scaleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  booleanContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  booleanButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  booleanText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#DC3545',
    fontSize: 13,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    paddingBottom: 48,
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
