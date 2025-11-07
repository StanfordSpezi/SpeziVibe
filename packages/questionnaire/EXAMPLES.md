# @spezivibe/questionnaire - Examples

Real-world examples of using the questionnaire package.

## Table of Contents
1. [Basic Usage](#basic-usage)
2. [Custom Themes](#custom-themes)
3. [Storage Integration](#storage-integration)
4. [Complex Questionnaires](#complex-questionnaires)
5. [Integration with Task Schedulers](#integration-with-task-schedulers)
6. [Pre-filled Forms](#pre-filled-forms)

---

## Basic Usage

### Simple Survey

```typescript
import { QuestionnaireForm, Questionnaire } from '@spezivibe/questionnaire';

const simpleSurvey: Questionnaire = {
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

function FeedbackScreen() {
  const handleSubmit = async (answers: Record<string, any>) => {
    console.log('Rating:', answers.rating);
    console.log('Comments:', answers.comments);
    // Send to backend, etc.
  };

  return (
    <QuestionnaireForm
      questionnaire={simpleSurvey}
      onSubmit={handleSubmit}
    />
  );
}
```

---

## Custom Themes

### App-Branded Theme

```typescript
import { QuestionnaireForm, QuestionnaireTheme, defaultLightTheme } from '@spezivibe/questionnaire';

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
};

<QuestionnaireForm
  questionnaire={questionnaire}
  onSubmit={handleSubmit}
  theme={brandTheme}
/>
```

### Dynamic Dark/Light Mode

```typescript
import { useColorScheme } from 'react-native';
import { QuestionnaireForm, defaultLightTheme, defaultDarkTheme, mergeTheme } from '@spezivibe/questionnaire';

function ThemedQuestionnaire() {
  const colorScheme = useColorScheme();

  // Start with default theme based on color scheme
  const baseTheme = colorScheme === 'dark' ? defaultDarkTheme : defaultLightTheme;

  // Customize specific colors
  const customTheme = mergeTheme({
    colors: {
      primary: '#YOUR_PRIMARY_COLOR',
    },
  }, baseTheme);

  return (
    <QuestionnaireForm
      questionnaire={questionnaire}
      onSubmit={handleSubmit}
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
import { generateId } from '@/utils/id-generator';

const storage = new AsyncStorageAdapter();

function QuestionnaireScreen({ questionnaireId }: { questionnaireId: string }) {
  const handleSubmit = async (answers: Record<string, any>) => {
    const response: QuestionnaireResponse = {
      id: generateId(),
      questionnaireId,
      completedAt: new Date(),
      answers,
      metadata: {
        userId: currentUser.id,
        deviceType: Platform.OS,
      },
    };

    await storage.save(response);
    console.log('Response saved!');
  };

  // Later: retrieve responses
  const loadResponses = async () => {
    const allResponses = await storage.getAll();
    const thisQuestionnaire = await storage.getByQuestionnaireId(questionnaireId);
    return thisQuestionnaire;
  };

  return (
    <QuestionnaireForm
      questionnaire={questionnaire}
      onSubmit={handleSubmit}
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
    await apiClient.post('/questionnaire-responses', response);
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
    return data;
  }

  async getById(id: string): Promise<QuestionnaireResponse | null> {
    try {
      const { data } = await apiClient.get(`/questionnaire-responses/${id}`);
      return data;
    } catch {
      return null;
    }
  }
}

// Usage
const storage = new BackendStorageAdapter();
```

---

## Complex Questionnaires

### Health Assessment with Conditional Logic

```typescript
import { useState } from 'react';
import { Questionnaire } from '@spezivibe/questionnaire';

const healthAssessment: Questionnaire = {
  id: 'health-assessment',
  title: 'Health Check-In',
  description: 'Weekly health and wellness assessment',
  questions: [
    {
      id: 'overall_health',
      type: 'scale',
      title: 'How would you rate your overall health this week?',
      min: 1,
      max: 10,
      required: true,
    },
    {
      id: 'symptoms',
      type: 'multipleChoice',
      title: 'Have you experienced any of these symptoms?',
      options: [
        { label: 'Fatigue', value: 'fatigue' },
        { label: 'Headache', value: 'headache' },
        { label: 'Stress', value: 'stress' },
        { label: 'None', value: 'none' },
      ],
      required: true,
    },
    {
      id: 'exercise',
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

function HealthAssessmentScreen() {
  const handleSubmit = async (answers: Record<string, any>) => {
    // Calculate health score
    const healthScore = calculateHealthScore(answers);

    const response = {
      id: generateId(),
      questionnaireId: 'health-assessment',
      completedAt: new Date(),
      answers,
      metadata: {
        userId: currentUser.id,
        healthScore,
        week: getCurrentWeek(),
      },
    };

    await storage.save(response);

    // Show personalized feedback based on answers
    if (healthScore < 50) {
      Alert.alert('Health Alert', 'Consider scheduling a check-up');
    }
  };

  return (
    <QuestionnaireForm
      questionnaire={healthAssessment}
      onSubmit={handleSubmit}
      submitButtonText="Complete Assessment"
    />
  );
}
```

### Multi-page Survey (Manual Pagination)

```typescript
import { useState } from 'react';
import { View, Button } from 'react-native';

function MultiPageSurvey() {
  const [currentPage, setCurrentPage] = useState(0);
  const [allAnswers, setAllAnswers] = useState<Record<string, any>>({});

  const pages: Questionnaire[] = [
    {
      id: 'page-1',
      title: 'About You',
      description: 'Basic information',
      questions: [/* page 1 questions */],
    },
    {
      id: 'page-2',
      title: 'Your Preferences',
      description: 'Tell us what you like',
      questions: [/* page 2 questions */],
    },
    {
      id: 'page-3',
      title: 'Final Thoughts',
      description: 'Wrap up',
      questions: [/* page 3 questions */],
    },
  ];

  const handlePageSubmit = async (answers: Record<string, any>) => {
    const updated = { ...allAnswers, ...answers };
    setAllAnswers(updated);

    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      // Last page - submit everything
      await submitFullSurvey(updated);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <QuestionnaireForm
        questionnaire={pages[currentPage]}
        onSubmit={handlePageSubmit}
        onCancel={currentPage > 0 ? () => setCurrentPage(currentPage - 1) : undefined}
        submitButtonText={currentPage < pages.length - 1 ? 'Next' : 'Submit'}
        cancelButtonText="Back"
        initialValues={allAnswers}
      />
    </View>
  );
}
```

---

## Integration with Task Schedulers

### Scheduled Questionnaires (like SpeziVibe)

```typescript
import { QuestionnaireForm } from '@spezivibe/questionnaire';
import { useScheduler } from '@/lib/scheduler';

function ScheduledQuestionnaireScreen({ taskId, eventId, questionnaireId }) {
  const { scheduler } = useScheduler();

  const handleSubmit = async (answers: Record<string, any>) => {
    // Save response
    const response = {
      id: generateId(),
      questionnaireId,
      completedAt: new Date(),
      answers,
      metadata: {
        taskId,
        eventId,
        scheduledTime: event.scheduledTime,
        completionDelay: Date.now() - event.scheduledTime,
      },
    };

    await storage.save(response);

    // Mark scheduled task as complete
    if (taskId && eventId) {
      const event = scheduler.getEventById(taskId, eventId);
      if (event) {
        await scheduler.completeEvent(event, response);
      }
    }

    router.back();
  };

  return (
    <QuestionnaireForm
      questionnaire={questionnaire}
      onSubmit={handleSubmit}
      onCancel={() => {
        Alert.alert('Cancel', 'Skip this questionnaire?', [
          { text: 'Continue', style: 'cancel' },
          { text: 'Skip', onPress: () => router.back() },
        ]);
      }}
    />
  );
}
```

---

## Pre-filled Forms

### Edit Existing Response

```typescript
function EditResponseScreen({ responseId }: { responseId: string }) {
  const [response, setResponse] = useState<QuestionnaireResponse | null>(null);

  useEffect(() => {
    loadResponse();
  }, []);

  const loadResponse = async () => {
    const data = await storage.getById(responseId);
    setResponse(data);
  };

  const handleSubmit = async (answers: Record<string, any>) => {
    const updated = {
      ...response!,
      answers,
      metadata: {
        ...response!.metadata,
        lastModified: new Date(),
        editCount: (response!.metadata?.editCount || 0) + 1,
      },
    };

    await storage.save(updated);
  };

  if (!response) return <LoadingSpinner />;

  return (
    <QuestionnaireForm
      questionnaire={questionnaire}
      initialValues={response.answers}  // Pre-fill with existing answers
      onSubmit={handleSubmit}
      submitButtonText="Update Response"
    />
  );
}
```

### Form with Default Values

```typescript
<QuestionnaireForm
  questionnaire={questionnaire}
  initialValues={{
    country: 'US',
    language: 'en',
    notifications: true,
  }}
  onSubmit={handleSubmit}
/>
```

---

## Need More Examples?

Check the [README.md](./README.md) for API documentation and the [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for upgrading from older implementations.
