# @spezivibe/questionnaire

A comprehensive, themeable React Native questionnaire component library built with Formik and Yup. Create dynamic forms from JSON definitions with built-in validation, storage adapters, and full TypeScript support.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [Question Types](#question-types)
- [Result Handling](#result-handling)
- [Theming](#theming)
- [Storage](#storage)
- [Advanced Usage](#advanced-usage)
- [Complete API Reference](#complete-api-reference)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Features

- ✅ **Dynamic Form Generation** - Create forms from JSON questionnaire definitions
- ✅ **Multiple Question Types** - Text, Scale, Multiple Choice, Boolean, and Date
- ✅ **Real-time Validation** - Built-in validation with Yup schemas
- ✅ **Themeable** - Fully customizable theme system with light/dark defaults
- ✅ **Type-Safe** - Complete TypeScript support with full type definitions
- ✅ **Storage Adapters** - Optional storage adapters (AsyncStorage, custom)
- ✅ **Result-Based API** - Clean API pattern for handling completed/cancelled/failed states
- ✅ **Configurable Cancel Behavior** - Confirm, immediate, or disabled cancellation
- ✅ **Zero App Dependencies** - Fully decoupled from app-specific logic
- ✅ **Comprehensive Tests** - 100+ tests covering all functionality

## Installation

### Required Dependencies

```bash
npm install @spezivibe/questionnaire formik yup
```

### Optional Dependencies

For AsyncStorage support:
```bash
npm install @react-native-async-storage/async-storage
```

### Peer Dependencies

The package requires:
- `react` >= 18.0.0
- `react-native` >= 0.70.0
- `formik` ^2.4.0
- `yup` ^1.0.0

## Quick Start

### Step 1: Define a Questionnaire

Create a questionnaire definition in JSON format:

```typescript
import { Questionnaire } from '@spezivibe/questionnaire';

const wellnessQuestionnaire: Questionnaire = {
  id: 'wellness-checkin',
  title: 'Daily Wellness Check-In',
  description: 'Help us understand how you\'re feeling today',
  questions: [
    {
      id: 'mood',
      type: 'scale',
      title: 'How would you rate your mood today?',
      description: '1 = Very low, 10 = Excellent',
      required: true,
      min: 1,
      max: 10,
    },
    {
      id: 'energy',
      type: 'multipleChoice',
      title: 'What is your energy level?',
      required: true,
      options: [
        { label: 'Very Low', value: 'very-low' },
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Very High', value: 'very-high' },
      ],
    },
    {
      id: 'exercise',
      type: 'boolean',
      title: 'Did you exercise today?',
      required: false,
    },
    {
      id: 'notes',
      type: 'text',
      title: 'Any additional notes?',
      placeholder: 'Optional comments about your day...',
      required: false,
    },
  ],
};
```

### Step 2: Render the Form

Use the `QuestionnaireForm` component in your screen:

```typescript
import React from 'react';
import { SafeAreaView } from 'react-native';
import { QuestionnaireForm, QuestionnaireResult } from '@spezivibe/questionnaire';
import { useRouter } from 'expo-router';

export default function WellnessCheckInScreen() {
  const router = useRouter();

  const handleResult = async (result: QuestionnaireResult) => {
    switch (result.status) {
      case 'completed':
        // User completed the questionnaire
        console.log('Completed at:', result.response.completedAt);
        console.log('Answers:', result.response.answers);

        // Save to your backend, storage, etc.
        await saveResponse(result.response);

        // Navigate away
        router.back();
        break;

      case 'cancelled':
        // User cancelled the questionnaire
        console.log('User cancelled');
        router.back();
        break;

      case 'failed':
        // An error occurred
        console.error('Error:', result.error);
        Alert.alert('Error', result.error.message);
        break;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QuestionnaireForm
        questionnaire={wellnessQuestionnaire}
        onResult={handleResult}
      />
    </SafeAreaView>
  );
}
```

That's it! The form is now fully functional with validation, error handling, and user interactions.

## Core Concepts

### Questionnaire Structure

A `Questionnaire` is a JSON object that defines the form:

```typescript
interface Questionnaire {
  id: string;              // Unique identifier for the questionnaire
  title: string;           // Main title displayed at the top
  description: string;     // Description text below the title
  questions: Question[];   // Array of questions
}
```

### Question Structure

Each `Question` defines a single form field:

```typescript
interface Question {
  id: string;              // Unique identifier (used as form field key)
  type: QuestionType;      // Question type (see Question Types section)
  title: string;           // Question text displayed to user
  description?: string;    // Optional additional explanation
  required?: boolean;      // Whether the field is required

  // Type-specific properties:
  options?: QuestionOption[];  // For multipleChoice
  min?: number;                // For scale
  max?: number;                // For scale
  placeholder?: string;        // For text
}
```

### Response Structure

When a questionnaire is completed, you receive a `QuestionnaireResponse`:

```typescript
interface QuestionnaireResponse {
  id: string;                    // Unique response ID (auto-generated)
  questionnaireId: string;       // ID of the questionnaire that was completed
  completedAt: Date;             // Timestamp when completed
  answers: Record<string, any>;  // User's answers (keyed by question id)
  metadata?: Record<string, any>; // Optional app-specific data
}
```

Example response:
```typescript
{
  id: "wellness-checkin-1704067200000",
  questionnaireId: "wellness-checkin",
  completedAt: new Date("2024-01-01T12:00:00Z"),
  answers: {
    mood: 8,
    energy: "high",
    exercise: true,
    notes: "Felt great today!"
  },
  metadata: {
    userId: "user-123",
    sessionId: "session-456"
  }
}
```

## Question Types

### Text Question

Free-form text input with optional placeholder:

```typescript
{
  id: 'feedback',
  type: 'text',
  title: 'What did you think of the experience?',
  description: 'Please provide detailed feedback',
  placeholder: 'Enter your thoughts here...',
  required: true,
}
```

**Renders:** Multi-line text input
**Answer Type:** `string`
**Validation:** Required fields must have non-empty string

### Scale Question

Numeric scale with configurable range:

```typescript
{
  id: 'satisfaction',
  type: 'scale',
  title: 'Rate your satisfaction',
  description: 'Scale from 1-5',
  min: 1,
  max: 5,
  required: true,
}
```

**Renders:** Horizontal buttons for each value in range
**Answer Type:** `number`
**Validation:** Must be within min/max range
**Default Range:** 1-10 if min/max not specified

### Multiple Choice Question

Single-select from a list of options:

```typescript
{
  id: 'preference',
  type: 'multipleChoice',
  title: 'What is your preferred contact method?',
  required: true,
  options: [
    { label: 'Email', value: 'email' },
    { label: 'Phone', value: 'phone' },
    { label: 'Text Message', value: 'sms' },
    { label: 'In Person', value: 'in-person' },
  ],
}
```

**Renders:** Vertical list of selectable cards
**Answer Type:** `string | number` (the `value` from selected option)
**Validation:** Must select one option if required
**Options Format:** `{ label: string, value: string | number }`

### Boolean Question

Yes/No question:

```typescript
{
  id: 'agree',
  type: 'boolean',
  title: 'Do you agree to the terms and conditions?',
  description: 'You must agree to continue',
  required: true,
}
```

**Renders:** Two buttons labeled "Yes" and "No"
**Answer Type:** `boolean`
**Validation:** Must select Yes or No if required

### Date Question

Date picker (coming soon - currently not fully implemented):

```typescript
{
  id: 'birthdate',
  type: 'date',
  title: 'What is your date of birth?',
  required: true,
}
```

**Note:** Date question type is defined but the component implementation is pending.

## Result Handling

The `onResult` callback receives a discriminated union type that represents the outcome:

### QuestionnaireResult Type

```typescript
type QuestionnaireResult =
  | { status: 'completed'; response: QuestionnaireResponse }
  | { status: 'cancelled' }
  | { status: 'failed'; error: Error };
```

### Handling Results

Use a `switch` statement for type-safe result handling:

```typescript
const handleResult = async (result: QuestionnaireResult) => {
  switch (result.status) {
    case 'completed': {
      // TypeScript knows result.response exists here
      const { response } = result;

      // Add custom metadata
      const enrichedResponse = {
        ...response,
        metadata: {
          ...response.metadata,
          userId: currentUser.id,
          deviceInfo: await getDeviceInfo(),
        },
      };

      // Save to multiple destinations
      await Promise.all([
        localStorage.save(enrichedResponse),
        api.post('/responses', enrichedResponse),
        analytics.track('questionnaire_completed', {
          questionnaireId: response.questionnaireId,
          completionTime: response.completedAt,
        }),
      ]);

      // Navigate based on answers
      if (response.answers.needsFollowUp === true) {
        router.push('/follow-up');
      } else {
        router.back();
      }
      break;
    }

    case 'cancelled': {
      // User cancelled - no response data
      analytics.track('questionnaire_cancelled');
      router.back();
      break;
    }

    case 'failed': {
      // TypeScript knows result.error exists here
      const { error } = result;

      // Log error
      console.error('Questionnaire failed:', error);
      Sentry.captureException(error);

      // Show user-friendly message
      Alert.alert(
        'Error',
        'We couldn\'t save your responses. Please try again.',
        [
          { text: 'Retry', onPress: () => router.reload() },
          { text: 'Cancel', onPress: () => router.back() },
        ]
      );
      break;
    }
  }
};
```

### When Each Result Status Occurs

- **`completed`**: User filled out the form and pressed Submit (all validation passed)
- **`cancelled`**: User pressed Cancel button (based on `cancelBehavior` setting)
- **`failed`**: An error occurred during form submission (rare, usually from async `onResult`)

## Theming

The package includes a complete theming system with light and dark defaults.

### Using Built-in Themes

```typescript
import {
  QuestionnaireForm,
  defaultLightTheme,
  defaultDarkTheme,
} from '@spezivibe/questionnaire';

// Use dark theme
<QuestionnaireForm
  questionnaire={questionnaire}
  onResult={handleResult}
  theme={defaultDarkTheme}
/>
```

### Integrating with System Theme

```typescript
import { useColorScheme } from 'react-native';
import {
  QuestionnaireForm,
  defaultLightTheme,
  defaultDarkTheme,
} from '@spezivibe/questionnaire';

function ThemedQuestionnaire() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? defaultDarkTheme : defaultLightTheme;

  return (
    <QuestionnaireForm
      questionnaire={questionnaire}
      onResult={handleResult}
      theme={theme}
    />
  );
}
```

### Complete Theme Structure

```typescript
interface QuestionnaireTheme {
  colors: {
    background: string;          // Main background color
    text: string;                // Primary text color
    textSecondary: string;       // Secondary/helper text color
    primary: string;             // Primary button/accent color
    primaryLight: string;        // Lighter shade of primary
    border: string;              // Border color for inputs/cards
    error: string;               // Error text/border color
    cardBackground: string;      // Background for cards/inputs
    selectedBackground: string;  // Background for selected options
  };
  spacing: {
    xs: number;    // Extra small spacing (4px default)
    sm: number;    // Small spacing (8px default)
    md: number;    // Medium spacing (16px default)
    lg: number;    // Large spacing (24px default)
    xl: number;    // Extra large spacing (32px default)
  };
  borderRadius: {
    sm: number;    // Small radius (4px default)
    md: number;    // Medium radius (8px default)
    lg: number;    // Large radius (24px default)
  };
  fontSize: {
    sm: number;    // Small text (13px default)
    md: number;    // Medium text (16px default)
    lg: number;    // Large text (17px default)
    xl: number;    // Extra large text (28px default)
  };
}
```

### Default Light Theme

```typescript
{
  colors: {
    background: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    primary: '#8C1515',          // Stanford Cardinal Red
    primaryLight: '#B83A4B',
    border: '#E0E0E0',
    error: '#DC3545',
    cardBackground: '#F5F5F5',
    selectedBackground: '#FFFFFF',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  borderRadius: { sm: 4, md: 8, lg: 24 },
  fontSize: { sm: 13, md: 16, lg: 17, xl: 28 },
}
```

### Default Dark Theme

```typescript
{
  colors: {
    background: '#000000',
    text: '#FFFFFF',
    textSecondary: '#999999',
    primary: '#B83A4B',
    primaryLight: '#D84A5C',
    border: '#333333',
    error: '#DC3545',
    cardBackground: '#1D1D1D',
    selectedBackground: '#000000',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  borderRadius: { sm: 4, md: 8, lg: 24 },
  fontSize: { sm: 13, md: 16, lg: 17, xl: 28 },
}
```

### Custom Theme

You can provide partial theme overrides - the package will merge with defaults:

```typescript
<QuestionnaireForm
  questionnaire={questionnaire}
  onResult={handleResult}
  theme={{
    colors: {
      primary: '#007AFF',        // iOS blue
      primaryLight: '#5AC8FA',
    },
    borderRadius: {
      md: 12,                    // More rounded corners
    },
  }}
/>
```

### Brand-Specific Theme Example

```typescript
const companyTheme: Partial<QuestionnaireTheme> = {
  colors: {
    primary: '#FF6B35',          // Company orange
    primaryLight: '#FF8C42',
    background: '#FFF9F5',       // Warm white
    text: '#2C3E50',            // Dark blue-grey
    textSecondary: '#7F8C8D',
    cardBackground: '#FFFFFF',
    border: '#E8E8E8',
  },
  spacing: {
    md: 20,
    lg: 28,
  },
  fontSize: {
    md: 15,
    lg: 18,
    xl: 32,
  },
};

<QuestionnaireForm
  questionnaire={questionnaire}
  onResult={handleResult}
  theme={companyTheme}
/>
```

## Storage

The package provides an optional storage system for persisting questionnaire responses.

### Using AsyncStorage Adapter

The built-in `AsyncStorageAdapter` provides simple local storage:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AsyncStorageAdapter,
  QuestionnaireResponse,
} from '@spezivibe/questionnaire';

// Create storage instance
const storage = new AsyncStorageAdapter();

// Save a response
const response: QuestionnaireResponse = {
  id: 'response-123',
  questionnaireId: 'wellness-checkin',
  completedAt: new Date(),
  answers: { mood: 8, energy: 'high' },
  metadata: { userId: 'user-123' },
};

await storage.save(response);

// Retrieve all responses
const allResponses = await storage.getAll();
console.log(`Total responses: ${allResponses.length}`);

// Get responses for specific questionnaire
const wellnessResponses = await storage.getByQuestionnaireId('wellness-checkin');

// Get specific response by ID
const specificResponse = await storage.getById('response-123');
```

### Integrating Storage with Form

```typescript
import { AsyncStorageAdapter } from '@spezivibe/questionnaire';

const storage = new AsyncStorageAdapter();

const handleResult = async (result: QuestionnaireResult) => {
  if (result.status === 'completed') {
    // Save to local storage
    await storage.save(result.response);

    // Also sync to backend
    await api.post('/questionnaire-responses', result.response);

    router.back();
  }
};

<QuestionnaireForm
  questionnaire={questionnaire}
  onResult={handleResult}
/>
```

### Custom Storage Adapter

Implement the `QuestionnaireStorage` interface for custom storage:

```typescript
import { QuestionnaireStorage, QuestionnaireResponse } from '@spezivibe/questionnaire';

class FirebaseStorageAdapter implements QuestionnaireStorage {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async save(response: QuestionnaireResponse): Promise<void> {
    await firestore()
      .collection('users')
      .doc(this.userId)
      .collection('questionnaire-responses')
      .doc(response.id)
      .set({
        ...response,
        completedAt: response.completedAt.toISOString(),
      });
  }

  async getAll(): Promise<QuestionnaireResponse[]> {
    const snapshot = await firestore()
      .collection('users')
      .doc(this.userId)
      .collection('questionnaire-responses')
      .orderBy('completedAt', 'desc')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        completedAt: new Date(data.completedAt),
      } as QuestionnaireResponse;
    });
  }

  async getByQuestionnaireId(id: string): Promise<QuestionnaireResponse[]> {
    const snapshot = await firestore()
      .collection('users')
      .doc(this.userId)
      .collection('questionnaire-responses')
      .where('questionnaireId', '==', id)
      .orderBy('completedAt', 'desc')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        completedAt: new Date(data.completedAt),
      } as QuestionnaireResponse;
    });
  }

  async getById(id: string): Promise<QuestionnaireResponse | null> {
    const doc = await firestore()
      .collection('users')
      .doc(this.userId)
      .collection('questionnaire-responses')
      .doc(id)
      .get();

    if (!doc.exists) return null;

    const data = doc.data()!;
    return {
      ...data,
      completedAt: new Date(data.completedAt),
    } as QuestionnaireResponse;
  }
}

// Usage
const storage = new FirebaseStorageAdapter(currentUser.id);
```

### Storage Best Practices

1. **Always await storage operations** - Don't fire-and-forget saves
2. **Handle storage errors gracefully** - Wrap in try-catch
3. **Validate data before retrieval** - Check dates are valid Date objects
4. **Consider offline-first** - Use AsyncStorage + sync to backend later
5. **Add metadata for context** - userId, deviceInfo, app version, etc.

Example with error handling:

```typescript
const handleResult = async (result: QuestionnaireResult) => {
  if (result.status === 'completed') {
    try {
      // Save locally first (offline-first)
      await storage.save(result.response);

      // Then try to sync to backend
      try {
        await api.post('/responses', result.response);
      } catch (syncError) {
        // Log but don't block - we'll sync later
        console.warn('Failed to sync to backend:', syncError);
        // Add to sync queue for later
        await syncQueue.add(result.response);
      }

      Alert.alert('Success', 'Your responses have been saved');
      router.back();
    } catch (storageError) {
      console.error('Failed to save locally:', storageError);
      Alert.alert(
        'Error',
        'Failed to save your responses. Please try again.'
      );
    }
  }
};
```

## Advanced Usage

### Completion Message

Show a confirmation screen after the user completes the questionnaire:

```typescript
<QuestionnaireForm
  questionnaire={questionnaire}
  onResult={handleResult}
  completionMessage="Thank you for completing the wellness check-in! Your responses help us provide better care."
/>
```

When provided:
1. User fills out questionnaire and presses Submit
2. Validation passes
3. **Completion screen shows** with message and "Done" button
4. User presses "Done"
5. `onResult` is called with completed status

### Cancel Behavior

Configure how the cancel button works:

#### Confirm (Default)

Shows a confirmation dialog before cancelling:

```typescript
<QuestionnaireForm
  questionnaire={questionnaire}
  onResult={handleResult}
  cancelBehavior="confirm"
/>
```

User experience:
1. User presses Cancel
2. Alert shows: "Are you sure you want to cancel? Your responses will not be saved."
3. User can choose "Continue" (go back to form) or "Cancel" (exit)

#### Immediate

Cancels immediately without confirmation:

```typescript
<QuestionnaireForm
  questionnaire={questionnaire}
  onResult={handleResult}
  cancelBehavior="immediate"
/>
```

User experience:
1. User presses Cancel
2. `onResult` immediately called with `{ status: 'cancelled' }`

Use when cancellation is safe (e.g., user hasn't entered any data yet).

#### Disabled

Hides the cancel button completely:

```typescript
<QuestionnaireForm
  questionnaire={questionnaire}
  onResult={handleResult}
  cancelBehavior="disabled"
/>
```

Use when questionnaire must be completed (e.g., required onboarding).

### Pre-filling Values

Provide initial values for editing existing responses:

```typescript
// Load previous response
const previousResponse = await storage.getById('response-123');

<QuestionnaireForm
  questionnaire={questionnaire}
  onResult={handleResult}
  initialValues={previousResponse.answers}
  submitButtonText="Update"
/>
```

### Custom Button Text

Customize submit and cancel button labels:

```typescript
<QuestionnaireForm
  questionnaire={questionnaire}
  onResult={handleResult}
  submitButtonText="Complete Assessment"
  cancelButtonText="Exit"
/>
```

### Multi-Step Questionnaires

For long questionnaires, consider breaking into steps:

```typescript
const [currentStep, setCurrentStep] = useState(0);

const steps: Questionnaire[] = [
  {
    id: 'onboarding-step-1',
    title: 'Personal Information',
    description: 'Step 1 of 3',
    questions: [/* step 1 questions */],
  },
  {
    id: 'onboarding-step-2',
    title: 'Health History',
    description: 'Step 2 of 3',
    questions: [/* step 2 questions */],
  },
  {
    id: 'onboarding-step-3',
    title: 'Preferences',
    description: 'Step 3 of 3',
    questions: [/* step 3 questions */],
  },
];

const [responses, setResponses] = useState<Record<string, any>>({});

const handleResult = async (result: QuestionnaireResult) => {
  if (result.status === 'completed') {
    // Merge with previous steps
    const allAnswers = {
      ...responses,
      ...result.response.answers,
    };

    if (currentStep < steps.length - 1) {
      // More steps remaining
      setResponses(allAnswers);
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - save everything
      const finalResponse: QuestionnaireResponse = {
        id: `onboarding-${Date.now()}`,
        questionnaireId: 'onboarding',
        completedAt: new Date(),
        answers: allAnswers,
      };

      await storage.save(finalResponse);
      router.push('/home');
    }
  }
};

return (
  <QuestionnaireForm
    questionnaire={steps[currentStep]}
    onResult={handleResult}
    initialValues={responses}
    submitButtonText={currentStep === steps.length - 1 ? 'Complete' : 'Next'}
  />
);
```

### Dynamic Question Loading

Load questionnaires from a backend:

```typescript
const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function loadQuestionnaire() {
    try {
      const data = await api.get(`/questionnaires/${questionnaireId}`);
      setQuestionnaire(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load questionnaire');
    } finally {
      setLoading(false);
    }
  }

  loadQuestionnaire();
}, [questionnaireId]);

if (loading) return <ActivityIndicator />;
if (!questionnaire) return <ErrorView />;

return (
  <QuestionnaireForm
    questionnaire={questionnaire}
    onResult={handleResult}
  />
);
```

### Analytics Integration

Track questionnaire interactions:

```typescript
import analytics from '@react-native-firebase/analytics';

const handleResult = async (result: QuestionnaireResult) => {
  switch (result.status) {
    case 'completed':
      await analytics().logEvent('questionnaire_completed', {
        questionnaire_id: result.response.questionnaireId,
        question_count: Object.keys(result.response.answers).length,
        completion_time: Date.now() - startTime,
      });
      break;

    case 'cancelled':
      await analytics().logEvent('questionnaire_cancelled', {
        questionnaire_id: questionnaire.id,
        time_spent: Date.now() - startTime,
      });
      break;

    case 'failed':
      await analytics().logEvent('questionnaire_error', {
        questionnaire_id: questionnaire.id,
        error: result.error.message,
      });
      break;
  }
};
```

## Complete API Reference

### QuestionnaireForm Props

```typescript
interface QuestionnaireFormProps {
  questionnaire: Questionnaire;
  onResult: (result: QuestionnaireResult) => Promise<void> | void;
  completionMessage?: string;
  cancelBehavior?: CancelBehavior;
  theme?: Partial<QuestionnaireTheme>;
  initialValues?: Record<string, any>;
  submitButtonText?: string;
  cancelButtonText?: string;
}
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `questionnaire` | `Questionnaire` | ✅ Yes | - | The questionnaire definition to render |
| `onResult` | `(result: QuestionnaireResult) => void \| Promise<void>` | ✅ Yes | - | Callback for handling completion/cancellation/errors |
| `completionMessage` | `string` | No | - | Message shown on completion screen before calling `onResult` |
| `cancelBehavior` | `'confirm' \| 'immediate' \| 'disabled'` | No | `'confirm'` | How cancel button behaves |
| `theme` | `Partial<QuestionnaireTheme>` | No | `defaultLightTheme` | Custom theme (merged with defaults) |
| `initialValues` | `Record<string, any>` | No | `{}` | Pre-fill form values |
| `submitButtonText` | `string` | No | `'Submit'` | Custom submit button label |
| `cancelButtonText` | `string` | No | `'Cancel'` | Custom cancel button label |

### Types

#### Questionnaire

```typescript
interface Questionnaire {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}
```

#### Question

```typescript
interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required?: boolean;

  // Type-specific properties
  options?: QuestionOption[];  // For multipleChoice
  min?: number;                // For scale
  max?: number;                // For scale
  placeholder?: string;        // For text
}

type QuestionType =
  | 'text'
  | 'multipleChoice'
  | 'scale'
  | 'date'
  | 'boolean';
```

#### QuestionOption

```typescript
interface QuestionOption {
  label: string;           // Display text
  value: string | number;  // Value saved in answers
}
```

#### QuestionnaireResponse

```typescript
interface QuestionnaireResponse {
  id: string;
  questionnaireId: string;
  completedAt: Date;
  answers: Record<string, any>;
  metadata?: Record<string, any>;
}
```

#### QuestionnaireResult

```typescript
type QuestionnaireResult =
  | { status: 'completed'; response: QuestionnaireResponse }
  | { status: 'cancelled' }
  | { status: 'failed'; error: Error };
```

#### QuestionnaireTheme

```typescript
interface QuestionnaireTheme {
  colors: {
    background: string;
    text: string;
    textSecondary: string;
    primary: string;
    primaryLight: string;
    border: string;
    error: string;
    cardBackground: string;
    selectedBackground: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  fontSize: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}
```

#### QuestionnaireStorage

```typescript
interface QuestionnaireStorage {
  save(response: QuestionnaireResponse): Promise<void>;
  getAll(): Promise<QuestionnaireResponse[]>;
  getByQuestionnaireId(questionnaireId: string): Promise<QuestionnaireResponse[]>;
  getById(id: string): Promise<QuestionnaireResponse | null>;
}
```

### Exported Components

- `QuestionnaireForm` - Main form component
- `TextQuestion` - Text input question component
- `ScaleQuestion` - Scale/rating question component
- `MultipleChoiceQuestion` - Multiple choice question component
- `BooleanQuestion` - Yes/No question component

### Exported Utilities

- `defaultLightTheme` - Default light theme
- `defaultDarkTheme` - Default dark theme
- `mergeTheme(userTheme, baseTheme)` - Merge custom theme with base
- `AsyncStorageAdapter` - Built-in AsyncStorage implementation

### Exported Functions

- `createValidationSchema(questions)` - Generate Yup schema from questions

## Best Practices

### 1. Question IDs

- Use descriptive, kebab-case IDs: `"mood-rating"`, `"energy-level"`
- Keep IDs consistent across app versions for data continuity
- Don't use special characters or spaces in IDs

### 2. Required vs Optional

- Mark critical fields as `required: true`
- Keep optional fields to enhance data without blocking completion
- Consider UX - too many required fields can cause abandonment

### 3. Question Ordering

- Start with easy, non-sensitive questions
- Put important questions early (users may not finish)
- Group related questions together
- End with open-ended text fields

### 4. Validation

- Use `required` for must-have fields
- Keep validation simple and clear
- Provide helpful error messages in question descriptions

### 5. Theming

- Test both light and dark themes
- Ensure sufficient contrast ratios (WCAG AA: 4.5:1 for text)
- Use consistent spacing throughout your app
- Consider accessibility for color-blind users

### 6. Storage

- Save locally first (offline-first approach)
- Sync to backend asynchronously
- Handle network errors gracefully
- Add metadata for debugging (app version, device info)

### 7. Error Handling

- Always handle all result statuses (completed/cancelled/failed)
- Show user-friendly error messages
- Log errors for debugging
- Provide retry mechanisms

### 8. Performance

- Memoize questionnaire definitions to avoid re-renders
- Use React.memo for question components if needed
- Consider pagination for very long questionnaires
- Test on low-end devices

### 9. User Experience

- Show progress indicators for long questionnaires
- Allow users to save drafts (use `initialValues`)
- Provide clear completion confirmation
- Allow editing previous responses

### 10. Data Privacy

- Don't include PII in questionnaire IDs or question IDs
- Use metadata field for linking to users, not direct fields
- Consider HIPAA/GDPR compliance for health data
- Encrypt sensitive responses before storage/transmission

## Troubleshooting

### Validation Not Working

**Problem:** Form submits even with empty required fields

**Solution:** Ensure questions have `required: true` set:

```typescript
{
  id: 'name',
  type: 'text',
  title: 'Your name',
  required: true,  // ← Make sure this is set
}
```

### Theme Not Applied

**Problem:** Custom theme colors not showing

**Solution:** Check that you're passing `theme` prop to `QuestionnaireForm`:

```typescript
<QuestionnaireForm
  questionnaire={questionnaire}
  onResult={handleResult}
  theme={myCustomTheme}  // ← Pass theme here
/>
```

Theme must be passed to the form component, not individual questions.

### TypeScript Errors with onResult

**Problem:** TypeScript complains about `result.response` not existing

**Solution:** Use proper type narrowing with `switch` or type guards:

```typescript
// ✅ Good - TypeScript knows the type
const handleResult = (result: QuestionnaireResult) => {
  switch (result.status) {
    case 'completed':
      console.log(result.response); // ← TypeScript knows this exists
      break;
  }
};

// ❌ Bad - TypeScript doesn't narrow the type
const handleResult = (result: QuestionnaireResult) => {
  if (result.status === 'completed') {
    // Still need to check: result.response might not exist here
  }
};
```

### AsyncStorage Not Working

**Problem:** `AsyncStorageAdapter` throws errors

**Solution:** Make sure you've installed the peer dependency:

```bash
npm install @react-native-async-storage/async-storage
```

And link it for iOS:

```bash
cd ios && pod install
```

### Cancel Button Not Showing

**Problem:** Cancel button is missing

**Solution:** Check `cancelBehavior` prop:

```typescript
<QuestionnaireForm
  questionnaire={questionnaire}
  onResult={handleResult}
  cancelBehavior="disabled"  // ← This hides the button
/>
```

Remove this prop or set to `"confirm"` or `"immediate"`.

### Answers Not Persisting

**Problem:** User's answers disappear when navigating away

**Solution:** Implement storage in your `onResult` handler:

```typescript
const handleResult = async (result: QuestionnaireResult) => {
  if (result.status === 'completed') {
    await storage.save(result.response);  // ← Save before navigating
    router.back();
  }
};
```

The package doesn't auto-save - you must explicitly save in `onResult`.

### Scale Question Not Showing All Values

**Problem:** Scale only shows 1-10, but I want 1-5

**Solution:** Set `min` and `max` properties:

```typescript
{
  id: 'rating',
  type: 'scale',
  title: 'Rate us',
  min: 1,   // ← Set min
  max: 5,   // ← Set max
}
```

Default range is 1-10 if not specified.

### Multiple Choice Options Not Clickable

**Problem:** Options render but don't respond to touch

**Solution:** Ensure options array is properly formatted:

```typescript
{
  id: 'choice',
  type: 'multipleChoice',
  title: 'Pick one',
  options: [
    { label: 'Option A', value: 'a' },  // ← Must have label and value
    { label: 'Option B', value: 'b' },
  ],
}
```

### Form Not Scrolling on Small Screens

**Problem:** Form is cut off, can't reach submit button

**Solution:** Wrap form in `ScrollView`:

```typescript
import { ScrollView } from 'react-native';

<ScrollView>
  <QuestionnaireForm
    questionnaire={questionnaire}
    onResult={handleResult}
  />
</ScrollView>
```

Or use `KeyboardAvoidingView` for better keyboard handling.

## Testing

The package includes a comprehensive test suite with 100+ tests.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

The test suite covers:
- ✅ Type definitions and interfaces
- ✅ Validation schema builder
- ✅ Theme utilities (merging, defaults)
- ✅ Storage adapters (AsyncStorage, interface)
- ✅ All question components (Text, Scale, MultipleChoice, Boolean)
- ✅ QuestionnaireForm component (rendering, validation, submission)
- ✅ Result handling (completed/cancelled/failed)
- ✅ Cancel behavior (confirm/immediate/disabled)
- ✅ Error handling and edge cases

### Writing Tests for Your Implementation

Example test for a screen using the questionnaire:

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QuestionnaireScreen } from './QuestionnaireScreen';

jest.mock('@/lib/storage', () => ({
  storage: {
    save: jest.fn(),
  },
}));

test('should save response when questionnaire completed', async () => {
  const { getByText, getByPlaceholderText } = render(
    <QuestionnaireScreen />
  );

  // Fill out form
  const nameInput = getByPlaceholderText('Enter your name');
  fireEvent.changeText(nameInput, 'John Doe');

  // Submit
  const submitButton = getByText('Submit');
  fireEvent.press(submitButton);

  // Assert storage was called
  await waitFor(() => {
    expect(storage.save).toHaveBeenCalledWith(
      expect.objectContaining({
        questionnaireId: 'test-questionnaire',
        answers: expect.objectContaining({
          name: 'John Doe',
        }),
      })
    );
  });
});
```

## License

MIT

---

**Need Help?**
- 📖 [View Source Code](https://github.com/stanfordspezi/spezivibe)
- 🐛 [Report Issues](https://github.com/stanfordspezi/spezivibe/issues)
- 💬 [Discussions](https://github.com/stanfordspezi/spezivibe/discussions)
