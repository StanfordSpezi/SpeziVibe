# @spezivibe/questionnaire - Examples

Real-world examples using FHIR R4 Questionnaires for healthcare interoperability.

## Table of Contents
1. [Basic Usage](#basic-usage)
2. [Using the Builder API](#using-the-builder-api)
3. [Result Handling](#result-handling)
4. [Conditional Logic (enableWhen)](#conditional-logic-enablewhen)
5. [Custom Themes](#custom-themes)
6. [Storage Integration](#storage-integration)
7. [Complex Questionnaires](#complex-questionnaires)
8. [Pre-filled Forms](#pre-filled-forms)

---

## Basic Usage

### Simple Feedback Survey

```typescript
import React from 'react';
import { SafeAreaView, Alert } from 'react-native';
import {
  QuestionnaireForm,
  QuestionnaireResult,
  type Questionnaire
} from '@spezivibe/questionnaire';
import { useRouter } from 'expo-router';

// FHIR R4 Questionnaire
const feedbackSurvey: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'active',
  title: 'Quick Feedback',
  description: "Tell us how we're doing",
  item: [
    {
      linkId: 'rating',
      type: 'integer',
      text: 'How would you rate your experience?',
      required: true,
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minValue',
          valueInteger: 1,
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
          valueInteger: 5,
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [{ code: 'slider' }],
          },
        },
      ],
    },
    {
      linkId: 'comments',
      type: 'text',
      text: 'Any additional comments?',
    },
  ],
};

export default function FeedbackScreen() {
  const router = useRouter();

  const handleResult = async (result: QuestionnaireResult) => {
    switch (result.status) {
      case 'completed':
        // FHIR QuestionnaireResponse
        const { response } = result;

        // Access answers from FHIR response
        const rating = response.item?.find(i => i.linkId === 'rating')?.answer?.[0]?.valueInteger;
        const comments = response.item?.find(i => i.linkId === 'comments')?.answer?.[0]?.valueString;

        console.log('Rating:', rating);
        console.log('Comments:', comments);

        // Send FHIR response to backend
        await api.post('/fhir/QuestionnaireResponse', response);

        Alert.alert('Thank you!', 'Your feedback has been submitted');
        router.back();
        break;

      case 'cancelled':
        router.back();
        break;

      case 'failed':
        Alert.alert('Error', result.error.message);
        break;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QuestionnaireForm
        questionnaire={feedbackSurvey}
        onResult={handleResult}
        completionMessage="Thank you for your feedback!"
      />
    </SafeAreaView>
  );
}
```

---

## Using the Builder API

### Quick Questionnaire with Builder

```typescript
import { QuestionnaireBuilder, QuestionnaireForm } from '@spezivibe/questionnaire';

// Use the builder for easier questionnaire creation
const dailyCheckIn = new QuestionnaireBuilder('daily-checkin')
  .title('Daily Check-In')
  .description('How are you feeling today?')
  .addSlider('mood', 'Rate your mood', { min: 1, max: 10, required: true })
  .addBoolean('exercised', 'Did you exercise today?', { required: true })
  .addChoice('sleep_quality', 'How was your sleep?', {
    options: [
      { code: 'poor', display: 'Poor' },
      { code: 'fair', display: 'Fair' },
      { code: 'good', display: 'Good' },
      { code: 'excellent', display: 'Excellent' },
    ],
    required: true,
  })
  .addText('notes', 'Any notes for today?')
  .build(); // Returns FHIR Questionnaire

function DailyCheckInScreen() {
  const handleResult = async (result: QuestionnaireResult) => {
    if (result.status === 'completed') {
      await storage.save(result.response);
      router.back();
    }
  };

  return (
    <QuestionnaireForm
      questionnaire={dailyCheckIn}
      onResult={handleResult}
    />
  );
}
```

### Builder with All Question Types

```typescript
import { QuestionnaireBuilder } from '@spezivibe/questionnaire';

const comprehensiveForm = new QuestionnaireBuilder('comprehensive-form')
  .title('Patient Intake Form')
  .description('Please complete all sections')

  // Boolean question
  .addBoolean('has_insurance', 'Do you have health insurance?', { required: true })

  // Integer with slider
  .addSlider('pain_level', 'Current pain level', { min: 0, max: 10 })

  // Integer with buttons (small range)
  .addInteger('num_medications', 'Number of current medications', { min: 0, max: 20 })

  // Decimal
  .addDecimal('temperature', 'Body temperature (°F)', { min: 95, max: 105 })

  // Single-line text
  .addString('emergency_contact', 'Emergency contact name', { required: true, maxLength: 100 })

  // Multi-line text
  .addText('medical_history', 'Brief medical history', { maxLength: 500 })

  // Date
  .addDate('last_checkup', 'Date of last check-up')

  // Choice (radio buttons)
  .addChoice('blood_type', 'Blood type', {
    options: [
      { code: 'a+', display: 'A+' },
      { code: 'a-', display: 'A-' },
      { code: 'b+', display: 'B+' },
      { code: 'b-', display: 'B-' },
      { code: 'o+', display: 'O+' },
      { code: 'o-', display: 'O-' },
      { code: 'ab+', display: 'AB+' },
      { code: 'ab-', display: 'AB-' },
    ],
  })

  // Display (informational text)
  .addDisplay('privacy_notice', 'All information is kept confidential per HIPAA regulations.')

  .build();
```

---

## Result Handling

### Complete Example with Type-Safe Access

```typescript
import { QuestionnaireResult, QuestionnaireResponse } from '@spezivibe/questionnaire';
import analytics from '@react-native-firebase/analytics';

// Helper to extract answer values from FHIR response
function getAnswer<T = any>(response: QuestionnaireResponse, linkId: string): T | undefined {
  const item = response.item?.find(i => i.linkId === linkId);
  if (!item?.answer?.[0]) return undefined;

  const answer = item.answer[0];

  // Return the appropriate value based on type
  if (answer.valueBoolean !== undefined) return answer.valueBoolean as T;
  if (answer.valueInteger !== undefined) return answer.valueInteger as T;
  if (answer.valueDecimal !== undefined) return answer.valueDecimal as T;
  if (answer.valueString !== undefined) return answer.valueString as T;
  if (answer.valueDate !== undefined) return answer.valueDate as T;
  if (answer.valueDateTime !== undefined) return answer.valueDateTime as T;
  if (answer.valueTime !== undefined) return answer.valueTime as T;
  if (answer.valueCoding !== undefined) return answer.valueCoding.code as T;

  return undefined;
}

const handleResult = async (result: QuestionnaireResult) => {
  const completionTime = Date.now() - startTime;

  switch (result.status) {
    case 'completed': {
      const { response } = result;

      try {
        // Extract values using helper
        const mood = getAnswer<number>(response, 'mood');
        const exercised = getAnswer<boolean>(response, 'exercised');
        const notes = getAnswer<string>(response, 'notes');

        console.log('Mood:', mood);
        console.log('Exercised:', exercised);
        console.log('Notes:', notes);

        // Save FHIR response
        await Promise.all([
          // Local storage
          localStorage.save(response),

          // Backend FHIR API
          api.post('/fhir/QuestionnaireResponse', response),

          // Analytics
          analytics().logEvent('questionnaire_completed', {
            questionnaire: response.questionnaire,
            item_count: response.item?.length || 0,
          }),
        ]);

        router.back();
      } catch (error) {
        console.error('Save failed:', error);
        Alert.alert('Error', 'Failed to save your responses');
      }
      break;
    }

    case 'cancelled': {
      await analytics().logEvent('questionnaire_cancelled', {
        questionnaire: questionnaire.url || questionnaire.id,
        time_spent: completionTime,
      });
      router.back();
      break;
    }

    case 'failed': {
      const { error } = result;
      console.error('Questionnaire failed:', error);
      Sentry.captureException(error);

      Alert.alert(
        'Error',
        'Something went wrong. Would you like to try again?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => router.back() },
          { text: 'Retry', onPress: () => router.reload() },
        ]
      );
      break;
    }
  }
};
```

---

## Conditional Logic (enableWhen)

### Basic Conditional Questions

```typescript
import { QuestionnaireBuilder, enableWhen } from '@spezivibe/questionnaire';

// Show follow-up question only if user answers "yes"
const conditionalForm = new QuestionnaireBuilder('conditional-form')
  .title('Health Screening')

  .addBoolean('has_symptoms', 'Are you experiencing any symptoms?', { required: true })

  // This question only appears if has_symptoms is true
  .addText('symptom_details', 'Please describe your symptoms', {
    required: true,
    enableWhen: [enableWhen('has_symptoms', '=', true)],
  })

  .addBoolean('taking_medication', 'Are you taking any medications?', { required: true })

  // This appears if taking_medication is true
  .addText('medication_list', 'Please list your medications', {
    required: true,
    enableWhen: [enableWhen('taking_medication', '=', true)],
  })

  .build();
```

### Advanced Conditional Logic

```typescript
import { QuestionnaireBuilder, enableWhen } from '@spezivibe/questionnaire';

const advancedForm = new QuestionnaireBuilder('advanced-conditional')
  .title('Pain Assessment')

  .addSlider('pain_level', 'Current pain level (0-10)', { min: 0, max: 10, required: true })

  // Show only if pain level > 5
  .addChoice('pain_type', 'Type of pain', {
    options: [
      { code: 'sharp', display: 'Sharp' },
      { code: 'dull', display: 'Dull' },
      { code: 'throbbing', display: 'Throbbing' },
      { code: 'burning', display: 'Burning' },
    ],
    required: true,
    enableWhen: [enableWhen('pain_level', '>', 5)],
  })

  // Show only if pain level >= 7
  .addBoolean('emergency_care', 'Do you need emergency care?', {
    required: true,
    enableWhen: [enableWhen('pain_level', '>=', 7)],
  })

  .build();
```

### Multiple Conditions (ANY or ALL)

```typescript
import type { Questionnaire } from '@spezivibe/questionnaire';

// Raw FHIR for complex enableWhen logic
const complexConditional: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'active',
  title: 'Risk Assessment',
  item: [
    {
      linkId: 'age',
      type: 'integer',
      text: 'Your age',
      required: true,
    },
    {
      linkId: 'smoker',
      type: 'boolean',
      text: 'Do you smoke?',
      required: true,
    },
    {
      linkId: 'high_bp',
      type: 'boolean',
      text: 'Do you have high blood pressure?',
      required: true,
    },
    {
      linkId: 'risk_warning',
      type: 'display',
      text: '⚠️ You may be at elevated risk. Please consult your physician.',
      // Show if age > 50 AND (smoker OR high_bp)
      enableWhen: [
        { question: 'age', operator: '>', answerInteger: 50 },
        { question: 'smoker', operator: '=', answerBoolean: true },
        { question: 'high_bp', operator: '=', answerBoolean: true },
      ],
      // ALL conditions must be true for first (age)
      // ANY of the remaining conditions must be true
      enableBehavior: 'all', // Change to 'any' for OR logic
    },
  ],
};
```

---

## Custom Themes

### App-Branded Theme

```typescript
import { QuestionnaireForm, QuestionnaireTheme } from '@spezivibe/questionnaire';

const brandTheme: Partial<QuestionnaireTheme> = {
  colors: {
    primary: '#FF6B35',           // Your brand color
    primaryLight: '#FF8F6B',
    background: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    border: '#E0E0E0',
    error: '#E63946',
    cardBackground: '#F8F9FA',
    selectedBackground: '#FFFFFF',
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 24,
  },
  spacing: {
    md: 20,
    lg: 28,
  },
};

<QuestionnaireForm
  questionnaire={questionnaire}
  onResult={handleResult}
  theme={brandTheme}
/>
```

### Dynamic Dark/Light Mode

```typescript
import { useColorScheme } from 'react-native';
import {
  QuestionnaireForm,
  defaultLightTheme,
  defaultDarkTheme,
  mergeTheme,
} from '@spezivibe/questionnaire';

function ThemedQuestionnaire() {
  const colorScheme = useColorScheme();

  const baseTheme = colorScheme === 'dark' ? defaultDarkTheme : defaultLightTheme;

  const customTheme = mergeTheme({
    colors: {
      primary: '#007AFF',  // iOS blue
    },
  }, baseTheme);

  return (
    <QuestionnaireForm
      questionnaire={questionnaire}
      onResult={handleResult}
      theme={customTheme}
    />
  );
}
```

---

## Storage Integration

### Using AsyncStorage Adapter

```typescript
import { AsyncStorageAdapter, QuestionnaireResponse } from '@spezivibe/questionnaire';

const storage = new AsyncStorageAdapter();

function QuestionnaireScreen({ questionnaire }: { questionnaire: Questionnaire }) {
  const handleResult = async (result: QuestionnaireResult) => {
    if (result.status === 'completed') {
      // FHIR QuestionnaireResponse
      const response = result.response;

      // Save to local storage
      await storage.save(response);

      console.log('Response saved!');
      router.back();
    } else if (result.status === 'cancelled') {
      router.back();
    }
  };

  // Later: retrieve responses
  const loadResponses = async () => {
    // Get all responses
    const allResponses = await storage.getAll();

    // Get responses for specific questionnaire (using canonical URL)
    const questionnaireUrl = questionnaire.url || `Questionnaire/${questionnaire.id}`;
    const thisQuestionnaire = await storage.getByQuestionnaireId(questionnaireUrl);

    return thisQuestionnaire;
  };

  return (
    <QuestionnaireForm
      questionnaire={questionnaire}
      onResult={handleResult}
    />
  );
}
```

### Custom FHIR Backend Storage

```typescript
import { QuestionnaireStorage, QuestionnaireResponse } from '@spezivibe/questionnaire';
import { fhirClient } from '@/lib/fhir';

class FHIRBackendAdapter implements QuestionnaireStorage {
  async save(response: QuestionnaireResponse): Promise<void> {
    // POST to FHIR server
    await fhirClient.create(response);
  }

  async getAll(): Promise<QuestionnaireResponse[]> {
    // Search all QuestionnaireResponses
    const bundle = await fhirClient.search('QuestionnaireResponse', {
      _sort: '-authored',
    });

    return bundle.entry?.map(e => e.resource as QuestionnaireResponse) || [];
  }

  async getByQuestionnaireId(questionnaireId: string): Promise<QuestionnaireResponse[]> {
    // Search by questionnaire canonical URL
    const bundle = await fhirClient.search('QuestionnaireResponse', {
      questionnaire: questionnaireId,
      _sort: '-authored',
    });

    return bundle.entry?.map(e => e.resource as QuestionnaireResponse) || [];
  }

  async getById(id: string): Promise<QuestionnaireResponse | null> {
    try {
      return await fhirClient.read('QuestionnaireResponse', id);
    } catch {
      return null;
    }
  }
}

// Usage
const storage = new FHIRBackendAdapter();

const handleResult = async (result: QuestionnaireResult) => {
  if (result.status === 'completed') {
    await storage.save(result.response);
  }
};
```

---

## Complex Questionnaires

### Health Assessment with Groups

```typescript
import { QuestionnaireBuilder } from '@spezivibe/questionnaire';

const healthAssessment = new QuestionnaireBuilder('health-assessment')
  .title('Weekly Health Check-In')
  .description('Help us track your wellness journey')

  // Physical Health Group
  .addGroup('physical_health', 'Physical Health', [
    {
      linkId: 'overall_health',
      type: 'integer',
      text: 'Rate your overall health this week (1-10)',
      required: true,
      extension: [
        { url: 'http://hl7.org/fhir/StructureDefinition/minValue', valueInteger: 1 },
        { url: 'http://hl7.org/fhir/StructureDefinition/maxValue', valueInteger: 10 },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: { coding: [{ code: 'slider' }] },
        },
      ],
    },
    {
      linkId: 'exercise_days',
      type: 'integer',
      text: 'Days of exercise this week (0-7)',
      required: true,
      extension: [
        { url: 'http://hl7.org/fhir/StructureDefinition/minValue', valueInteger: 0 },
        { url: 'http://hl7.org/fhir/StructureDefinition/maxValue', valueInteger: 7 },
      ],
    },
    {
      linkId: 'sleep_hours',
      type: 'integer',
      text: 'Average hours of sleep per night',
      required: true,
      extension: [
        { url: 'http://hl7.org/fhir/StructureDefinition/minValue', valueInteger: 1 },
        { url: 'http://hl7.org/fhir/StructureDefinition/maxValue', valueInteger: 12 },
      ],
    },
  ])

  // Mental Health Group
  .addGroup('mental_health', 'Mental Health', [
    {
      linkId: 'stress_level',
      type: 'integer',
      text: 'Stress level this week (1-10)',
      required: true,
      extension: [
        { url: 'http://hl7.org/fhir/StructureDefinition/minValue', valueInteger: 1 },
        { url: 'http://hl7.org/fhir/StructureDefinition/maxValue', valueInteger: 10 },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: { coding: [{ code: 'slider' }] },
        },
      ],
    },
    {
      linkId: 'mood',
      type: 'choice',
      text: 'Overall mood this week',
      required: true,
      answerOption: [
        { valueCoding: { code: 'poor', display: 'Poor' } },
        { valueCoding: { code: 'fair', display: 'Fair' } },
        { valueCoding: { code: 'good', display: 'Good' } },
        { valueCoding: { code: 'excellent', display: 'Excellent' } },
      ],
    },
  ])

  .addText('notes', 'Additional notes or concerns')

  .build();
```

---

## Pre-filled Forms

### Pre-fill from Existing FHIR Response

```typescript
import { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';

function EditResponseScreen({ responseId }: { responseId: string }) {
  const [initialResponse, setInitialResponse] = useState<QuestionnaireResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResponse();
  }, []);

  const loadResponse = async () => {
    try {
      const data = await storage.getById(responseId);
      setInitialResponse(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load response');
    } finally {
      setLoading(false);
    }
  };

  const handleResult = async (result: QuestionnaireResult) => {
    if (result.status === 'completed') {
      // Update with new ID and timestamp
      const updated: QuestionnaireResponse = {
        ...result.response,
        id: responseId, // Keep original ID
        authored: new Date().toISOString(),
      };

      await storage.save(updated);
      Alert.alert('Updated', 'Your response has been updated');
      router.back();
    } else if (result.status === 'cancelled') {
      router.back();
    }
  };

  if (loading) return <ActivityIndicator />;
  if (!initialResponse) return <ErrorView message="Response not found" />;

  return (
    <QuestionnaireForm
      questionnaire={questionnaire}
      initialResponse={initialResponse}  // Pre-fill with FHIR response
      onResult={handleResult}
      submitButtonText="Update Response"
    />
  );
}
```

---

## Loading FHIR Questionnaires from Backend

### Fetch and Display FHIR Questionnaire

```typescript
import { useState, useEffect } from 'react';
import type { Questionnaire } from '@spezivibe/questionnaire';

function DynamicQuestionnaireScreen({ questionnaireId }: { questionnaireId: string }) {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuestionnaire();
  }, [questionnaireId]);

  const loadQuestionnaire = async () => {
    try {
      // Fetch FHIR Questionnaire from your backend
      const data = await fhirClient.read('Questionnaire', questionnaireId);
      setQuestionnaire(data);
    } catch (err) {
      setError('Failed to load questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const handleResult = async (result: QuestionnaireResult) => {
    if (result.status === 'completed') {
      // Post FHIR QuestionnaireResponse to backend
      await fhirClient.create(result.response);
      router.back();
    } else if (result.status === 'cancelled') {
      router.back();
    }
  };

  if (loading) return <ActivityIndicator />;
  if (error || !questionnaire) return <ErrorView message={error} />;

  return (
    <QuestionnaireForm
      questionnaire={questionnaire}
      onResult={handleResult}
    />
  );
}
```

---

## Need More Help?

Check the [README.md](./README.md) for complete API documentation and usage guides.
