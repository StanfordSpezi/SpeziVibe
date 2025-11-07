# @spezivibe/questionnaire - Examples

Real-world examples of using the questionnaire package.

## Table of Contents
1. [Basic Usage](#basic-usage)
2. [Result Handling](#result-handling)
3. [Custom Themes](#custom-themes)
4. [Storage Integration](#storage-integration)
5. [Complex Questionnaires](#complex-questionnaires)
6. [Integration with Task Schedulers](#integration-with-task-schedulers)
7. [Pre-filled Forms](#pre-filled-forms)
8. [Multi-Step Questionnaires](#multi-step-questionnaires)

---

## Basic Usage

### Simple Feedback Survey

```typescript
import React from 'react';
import { SafeAreaView, Alert } from 'react-native';
import { QuestionnaireForm, Questionnaire, QuestionnaireResult } from '@spezivibe/questionnaire';
import { useRouter } from 'expo-router';

const feedbackSurvey: Questionnaire = {
  id: 'feedback-2025',
  title: 'Quick Feedback',
  description: 'Tell us how we're doing',
  questions: [
    {
      id: 'rating',
      type: 'scale',
      title: 'How would you rate your experience?',
      min: 1,
      max: 5,
      required: true,
    },
    {
      id: 'comments',
      type: 'text',
      title: 'Any additional comments?',
      placeholder: 'Your feedback...',
    },
  ],
};

export default function FeedbackScreen() {
  const router = useRouter();

  const handleResult = async (result: QuestionnaireResult) => {
    switch (result.status) {
      case 'completed':
        console.log('Rating:', result.response.answers.rating);
        console.log('Comments:', result.response.answers.comments);

        // Send to backend
        await api.post('/feedback', result.response);

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

## Result Handling

### Complete Example with All Result Types

```typescript
import { QuestionnaireResult } from '@spezivibe/questionnaire';
import analytics from '@react-native-firebase/analytics';

const handleResult = async (result: QuestionnaireResult) => {
  // Track start time for analytics
  const completionTime = Date.now() - startTime;

  switch (result.status) {
    case 'completed': {
      // Response includes: id, questionnaireId, completedAt, answers, metadata
      const { response } = result;

      try {
        // Add app-specific metadata
        const enrichedResponse = {
          ...response,
          metadata: {
            ...response.metadata,
            userId: currentUser.id,
            appVersion: AppVersion,
            platform: Platform.OS,
            completionTime,
          },
        };

        // Save to multiple destinations
        await Promise.all([
          // Local storage for offline access
          localStorage.save(enrichedResponse),

          // Backend API
          api.post('/responses', enrichedResponse),

          // Analytics
          analytics().logEvent('questionnaire_completed', {
            questionnaire_id: response.questionnaireId,
            question_count: Object.keys(response.answers).length,
          }),
        ]);

        // Navigate based on answers
        if (response.answers.needsFollowUp) {
          router.push('/follow-up');
        } else {
          router.back();
        }
      } catch (error) {
        console.error('Save failed:', error);
        Alert.alert('Error', 'Failed to save your responses');
      }
      break;
    }

    case 'cancelled': {
      // User cancelled
      await analytics().logEvent('questionnaire_cancelled', {
        questionnaire_id: questionnaire.id,
        time_spent: completionTime,
      });

      router.back();
      break;
    }

    case 'failed': {
      // Error occurred
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

<QuestionnaireForm
  questionnaire={questionnaire}
  onResult={handleResult}
/>
```

### Type-Safe Result Handling

```typescript
// TypeScript ensures you handle all cases
const handleResult = (result: QuestionnaireResult) => {
  switch (result.status) {
    case 'completed':
      // TypeScript knows result.response exists
      saveResponse(result.response);
      break;

    case 'cancelled':
      // TypeScript knows result has no additional properties
      trackCancellation();
      break;

    case 'failed':
      // TypeScript knows result.error exists
      logError(result.error);
      break;

    // TypeScript will error if you forget a case
  }
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

  // Start with default theme based on color scheme
  const baseTheme = colorScheme === 'dark' ? defaultDarkTheme : defaultLightTheme;

  // Customize specific colors
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

function QuestionnaireScreen({ questionnaireId }: { questionnaireId: string }) {
  const handleResult = async (result: QuestionnaireResult) => {
    if (result.status === 'completed') {
      // Add app-specific metadata
      const responseWithMetadata = {
        ...result.response,
        metadata: {
          userId: currentUser.id,
          deviceType: Platform.OS,
        },
      };

      // Save to local storage
      await storage.save(responseWithMetadata);

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

    // Get responses for this questionnaire
    const thisQuestionnaire = await storage.getByQuestionnaireId(questionnaireId);

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

### Custom Backend Storage

```typescript
import { QuestionnaireStorage, QuestionnaireResponse } from '@spezivibe/questionnaire';
import { apiClient } from '@/lib/api';

class BackendStorageAdapter implements QuestionnaireStorage {
  async save(response: QuestionnaireResponse): Promise<void> {
    await apiClient.post('/questionnaire-responses', {
      ...response,
      // Convert Date to ISO string for JSON
      completedAt: response.completedAt.toISOString(),
    });
  }

  async getAll(): Promise<QuestionnaireResponse[]> {
    const { data } = await apiClient.get('/questionnaire-responses');
    return data.map((r: any) => ({
      ...r,
      completedAt: new Date(r.completedAt),
    }));
  }

  async getByQuestionnaireId(id: string): Promise<QuestionnaireResponse[]> {
    const { data } = await apiClient.get(`/questionnaire-responses?questionnaireId=${id}`);
    return data.map((r: any) => ({
      ...r,
      completedAt: new Date(r.completedAt),
    }));
  }

  async getById(id: string): Promise<QuestionnaireResponse | null> {
    try {
      const { data } = await apiClient.get(`/questionnaire-responses/${id}`);
      return {
        ...data,
        completedAt: new Date(data.completedAt),
      };
    } catch {
      return null;
    }
  }
}

// Usage
const storage = new BackendStorageAdapter();

const handleResult = async (result: QuestionnaireResult) => {
  if (result.status === 'completed') {
    await storage.save(result.response);
  }
};
```

### Offline-First with Background Sync

```typescript
import { AsyncStorageAdapter } from '@spezivibe/questionnaire';
import NetInfo from '@react-native-community/netinfo';

const localStorage = new AsyncStorageAdapter();
const syncQueue = new SyncQueue();

const handleResult = async (result: QuestionnaireResult) => {
  if (result.status === 'completed') {
    try {
      // Always save locally first
      await localStorage.save(result.response);

      // Try to sync to backend
      const networkState = await NetInfo.fetch();
      if (networkState.isConnected) {
        try {
          await api.post('/responses', result.response);
        } catch (syncError) {
          // Failed to sync - add to queue for later
          console.warn('Failed to sync, queuing for later');
          await syncQueue.add(result.response);
        }
      } else {
        // No internet - queue for later
        await syncQueue.add(result.response);
      }

      Alert.alert('Success', 'Your responses have been saved');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save responses');
    }
  }
};
```

---

## Complex Questionnaires

### Health Assessment with Scoring

```typescript
import { Questionnaire } from '@spezivibe/questionnaire';

const healthAssessment: Questionnaire = {
  id: 'health-assessment',
  title: 'Weekly Health Check-In',
  description: 'Help us track your wellness journey',
  questions: [
    {
      id: 'overall_health',
      type: 'scale',
      title: 'How would you rate your overall health this week?',
      description: '1 = Poor, 10 = Excellent',
      min: 1,
      max: 10,
      required: true,
    },
    {
      id: 'symptoms',
      type: 'multipleChoice',
      title: 'Have you experienced any symptoms?',
      options: [
        { label: 'Fatigue', value: 'fatigue' },
        { label: 'Headache', value: 'headache' },
        { label: 'Stress', value: 'stress' },
        { label: 'None', value: 'none' },
      ],
      required: true,
    },
    {
      id: 'exercise_days',
      type: 'scale',
      title: 'Days of exercise this week?',
      description: 'At least 30 minutes of moderate activity',
      min: 0,
      max: 7,
      required: true,
    },
    {
      id: 'sleep_hours',
      type: 'scale',
      title: 'Average hours of sleep per night?',
      min: 1,
      max: 12,
      required: true,
    },
    {
      id: 'water_intake',
      type: 'boolean',
      title: 'Did you drink at least 8 glasses of water daily?',
      required: true,
    },
    {
      id: 'notes',
      type: 'text',
      title: 'Additional notes or concerns',
      placeholder: 'Any health concerns you want to share...',
    },
  ],
};

function calculateHealthScore(answers: Record<string, any>): number {
  let score = 0;

  // Overall health (0-30 points)
  score += (answers.overall_health / 10) * 30;

  // Exercise (0-20 points)
  score += (answers.exercise_days / 7) * 20;

  // Sleep (0-20 points)
  const optimalSleep = 8;
  const sleepScore = 1 - Math.abs(answers.sleep_hours - optimalSleep) / optimalSleep;
  score += sleepScore * 20;

  // Water intake (0-15 points)
  score += answers.water_intake ? 15 : 0;

  // Symptoms (0-15 points)
  score += answers.symptoms === 'none' ? 15 : 0;

  return Math.round(score);
}

function HealthAssessmentScreen() {
  const handleResult = async (result: QuestionnaireResult) => {
    if (result.status === 'completed') {
      const { response } = result;

      // Calculate health score
      const healthScore = calculateHealthScore(response.answers);

      // Save with score
      const enrichedResponse = {
        ...response,
        metadata: {
          ...response.metadata,
          healthScore,
          week: getCurrentWeek(),
        },
      };

      await storage.save(enrichedResponse);

      // Show personalized feedback
      if (healthScore < 50) {
        Alert.alert(
          'Health Alert',
          'Your score is low. Consider scheduling a check-up.',
          [
            { text: 'Schedule Appointment', onPress: () => router.push('/appointments') },
            { text: 'Maybe Later', style: 'cancel' },
          ]
        );
      } else if (healthScore >= 80) {
        Alert.alert(
          'Great Job!',
          `Excellent health score: ${healthScore}/100. Keep it up!`
        );
      }

      router.back();
    } else if (result.status === 'cancelled') {
      router.back();
    }
  };

  return (
    <QuestionnaireForm
      questionnaire={healthAssessment}
      onResult={handleResult}
      submitButtonText="Complete Assessment"
      completionMessage="Thank you for completing your weekly health check-in!"
    />
  );
}
```

---

## Integration with Task Schedulers

### Scheduled Questionnaires

```typescript
import { QuestionnaireForm } from '@spezivibe/questionnaire';
import { useScheduler } from '@/lib/scheduler';

function ScheduledQuestionnaireScreen({ taskId, eventId, questionnaireId }) {
  const { scheduler } = useScheduler();
  const questionnaire = getQuestionnaireById(questionnaireId);

  const handleResult = async (result: QuestionnaireResult) => {
    if (result.status === 'completed') {
      const event = scheduler.getEventById(taskId, parseInt(eventId, 10));

      // Add scheduling metadata
      const responseWithMetadata = {
        ...result.response,
        metadata: {
          ...result.response.metadata,
          taskId,
          eventId,
          scheduledTime: event?.scheduledTime,
          completionDelay: event ? Date.now() - event.scheduledTime.getTime() : 0,
        },
      };

      // Save response
      await storage.save(responseWithMetadata);

      // Mark scheduled task as complete
      if (event) {
        await scheduler.completeEvent(event, responseWithMetadata);
      }

      Alert.alert('Complete', 'Task completed successfully!');
      router.back();
    } else if (result.status === 'cancelled') {
      Alert.alert(
        'Skip Task?',
        'Are you sure you want to skip this questionnaire?',
        [
          { text: 'Go Back', style: 'cancel' },
          { text: 'Skip', onPress: () => router.back() },
        ]
      );
    }
  };

  return (
    <QuestionnaireForm
      questionnaire={questionnaire}
      onResult={handleResult}
      cancelBehavior="confirm"
    />
  );
}
```

---

## Pre-filled Forms

### Edit Existing Response

```typescript
import { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';

function EditResponseScreen({ responseId }: { responseId: string }) {
  const [response, setResponse] = useState<QuestionnaireResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResponse();
  }, []);

  const loadResponse = async () => {
    try {
      const data = await storage.getById(responseId);
      setResponse(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load response');
    } finally {
      setLoading(false);
    }
  };

  const handleResult = async (result: QuestionnaireResult) => {
    if (result.status === 'completed') {
      // Update existing response
      const updated: QuestionnaireResponse = {
        ...response!,
        answers: result.response.answers,
        metadata: {
          ...response!.metadata,
          lastModified: new Date(),
          editCount: (response!.metadata?.editCount || 0) + 1,
        },
      };

      await storage.save(updated);
      Alert.alert('Updated', 'Your response has been updated');
      router.back();
    } else if (result.status === 'cancelled') {
      router.back();
    }
  };

  if (loading) return <ActivityIndicator />;
  if (!response) return <ErrorView message="Response not found" />;

  return (
    <QuestionnaireForm
      questionnaire={questionnaire}
      initialValues={response.answers}
      onResult={handleResult}
      submitButtonText="Update Response"
    />
  );
}
```

### Form with Default Values

```typescript
// Pre-fill with user preferences
<QuestionnaireForm
  questionnaire={questionnaire}
  initialValues={{
    country: currentUser.country || 'US',
    language: currentUser.language || 'en',
    notifications: currentUser.preferences.notifications ?? true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }}
  onResult={handleResult}
/>
```

---

## Multi-Step Questionnaires

### Paginated Long Questionnaire

```typescript
import { useState } from 'react';
import { View, Text } from 'react-native';

function MultiStepOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [allAnswers, setAllAnswers] = useState<Record<string, any>>({});

  const steps: Questionnaire[] = [
    {
      id: 'onboarding-step-1',
      title: 'Personal Information',
      description: 'Step 1 of 3',
      questions: [
        { id: 'name', type: 'text', title: 'Your name', required: true },
        { id: 'email', type: 'text', title: 'Email address', required: true },
      ],
    },
    {
      id: 'onboarding-step-2',
      title: 'Health History',
      description: 'Step 2 of 3',
      questions: [
        { id: 'conditions', type: 'multipleChoice', title: 'Medical conditions', options: [/* ... */] },
        { id: 'medications', type: 'text', title: 'Current medications' },
      ],
    },
    {
      id: 'onboarding-step-3',
      title: 'Preferences',
      description: 'Step 3 of 3',
      questions: [
        { id: 'notifications', type: 'boolean', title: 'Enable notifications?', required: true },
        { id: 'frequency', type: 'multipleChoice', title: 'Check-in frequency', options: [/* ... */] },
      ],
    },
  ];

  const handleResult = async (result: QuestionnaireResult) => {
    if (result.status === 'completed') {
      // Merge answers from current step
      const mergedAnswers = {
        ...allAnswers,
        ...result.response.answers,
      };

      if (currentStep < steps.length - 1) {
        // More steps remaining - save and continue
        setAllAnswers(mergedAnswers);
        setCurrentStep(currentStep + 1);
      } else {
        // Final step - save everything
        const finalResponse: QuestionnaireResponse = {
          id: `onboarding-${Date.now()}`,
          questionnaireId: 'onboarding',
          completedAt: new Date(),
          answers: mergedAnswers,
          metadata: {
            userId: currentUser.id,
            totalSteps: steps.length,
          },
        };

        await storage.save(finalResponse);
        await completeOnboarding(finalResponse);

        router.replace('/home');
      }
    } else if (result.status === 'cancelled') {
      if (currentStep > 0) {
        // Go back to previous step
        setCurrentStep(currentStep - 1);
      } else {
        // First step - confirm exit
        Alert.alert(
          'Exit Onboarding?',
          'Your progress will not be saved.',
          [
            { text: 'Continue', style: 'cancel' },
            { text: 'Exit', onPress: () => router.back() },
          ]
        );
      }
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <View style={{ flex: 1 }}>
      {/* Progress indicator */}
      <View style={{ padding: 16 }}>
        <Text>Step {currentStep + 1} of {steps.length}</Text>
        <View style={{ height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, marginTop: 8 }}>
          <View
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#007AFF',
              borderRadius: 2,
            }}
          />
        </View>
      </View>

      <QuestionnaireForm
        questionnaire={steps[currentStep]}
        onResult={handleResult}
        initialValues={allAnswers}
        submitButtonText={currentStep === steps.length - 1 ? 'Complete' : 'Next'}
        cancelButtonText={currentStep > 0 ? 'Back' : 'Cancel'}
        cancelBehavior={currentStep > 0 ? 'immediate' : 'confirm'}
      />
    </View>
  );
}
```

---

## Dynamic Questionnaires

### Load from Backend

```typescript
import { useState, useEffect } from 'react';

function DynamicQuestionnaireScreen({ questionnaireId }: { questionnaireId: string }) {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuestionnaire();
  }, [questionnaireId]);

  const loadQuestionnaire = async () => {
    try {
      const data = await api.get(`/questionnaires/${questionnaireId}`);
      setQuestionnaire(data);
    } catch (err) {
      setError('Failed to load questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const handleResult = async (result: QuestionnaireResult) => {
    if (result.status === 'completed') {
      await storage.save(result.response);
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
