# @spezivibe/questionnaire

A reusable, themeable React Native questionnaire component library built with Formik and Yup.

## Features

- ✅ **Dynamic Form Generation** - Create forms from JSON questionnaire definitions
- ✅ **Multiple Question Types** - Text, Scale, Multiple Choice, Boolean, and Date
- ✅ **Real-time Validation** - Built-in validation with Yup schemas
- ✅ **Themeable** - Fully customizable theme system
- ✅ **Type-Safe** - Complete TypeScript support
- ✅ **Storage Adapters** - Optional storage adapters (AsyncStorage, custom)
- ✅ **Zero App Dependencies** - Decoupled from app-specific logic

## Installation

```bash
npm install @spezivibe/questionnaire formik yup
```

### Optional Dependencies

For AsyncStorage support:
```bash
npm install @react-native-async-storage/async-storage
```

## Quick Start

### 1. Define a Questionnaire

```typescript
import { Questionnaire } from '@spezivibe/questionnaire';

const myQuestionnaire: Questionnaire = {
  id: 'wellness-checkin',
  title: 'Daily Wellness Check-In',
  description: 'How are you feeling today?',
  questions: [
    {
      id: 'mood',
      type: 'scale',
      title: 'Rate your mood',
      required: true,
      min: 1,
      max: 10,
    },
    {
      id: 'energy',
      type: 'multipleChoice',
      title: 'Energy Level',
      required: true,
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
      ],
    },
    {
      id: 'notes',
      type: 'text',
      title: 'Any additional notes?',
      placeholder: 'Optional notes...',
    },
  ],
};
```

### 2. Use the QuestionnaireForm Component

```typescript
import { QuestionnaireForm, QuestionnaireResult } from '@spezivibe/questionnaire';
import { useRouter } from 'expo-router';

function MyQuestionnaireScreen() {
  const router = useRouter();

  const handleResult = async (result: QuestionnaireResult) => {
    switch (result.status) {
      case 'completed':
        console.log('Response:', result.response);
        // Save response to your backend, storage, etc.
        router.back();
        break;

      case 'cancelled':
        console.log('User cancelled');
        router.back();
        break;

      case 'failed':
        console.error('Failed:', result.error);
        break;
    }
  };

  return (
    <QuestionnaireForm
      questionnaire={myQuestionnaire}
      onResult={handleResult}
    />
  );
}
```

## Custom Theming

### Using Built-in Themes

```typescript
import { QuestionnaireForm, defaultDarkTheme } from '@spezivibe/questionnaire';

<QuestionnaireForm
  questionnaire={myQuestionnaire}
  onResult={handleResult}
  theme={defaultDarkTheme}
/>
```

## Advanced Features

### Completion Messages

Show a message after the questionnaire is completed but before the result is submitted:

```typescript
<QuestionnaireForm
  questionnaire={myQuestionnaire}
  onResult={handleResult}
  completionMessage="Thank you for completing the wellness check-in!"
/>
```

### Cancel Behavior

Configure how cancellation works:

```typescript
// Show confirmation dialog (default)
<QuestionnaireForm
  questionnaire={myQuestionnaire}
  onResult={handleResult}
  cancelBehavior="confirm"
/>

// Cancel immediately without confirmation
<QuestionnaireForm
  questionnaire={myQuestionnaire}
  onResult={handleResult}
  cancelBehavior="immediate"
/>

// Disable cancel button
<QuestionnaireForm
  questionnaire={myQuestionnaire}
  onResult={handleResult}
  cancelBehavior="disabled"
/>
```

### Custom Theme

```typescript
import { QuestionnaireForm } from '@spezivibe/questionnaire';

<QuestionnaireForm
  questionnaire={myQuestionnaire}
  onSubmit={handleSubmit}
  theme={{
    colors: {
      primary: '#FF5733',
      background: '#F0F0F0',
      text: '#333333',
      // ... other colors
    },
    spacing: {
      sm: 8,
      md: 16,
      lg: 24,
    },
  }}
/>
```

### Integration with App Theme

```typescript
import { useColorScheme } from 'react-native';
import { QuestionnaireForm, defaultLightTheme, defaultDarkTheme } from '@spezivibe/questionnaire';

function ThemedQuestionnaire() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? defaultDarkTheme : defaultLightTheme;

  return (
    <QuestionnaireForm
      questionnaire={myQuestionnaire}
      onSubmit={handleSubmit}
      theme={theme}
    />
  );
}
```

## Storage

### Using AsyncStorage Adapter

```typescript
import { AsyncStorageAdapter, QuestionnaireResponse } from '@spezivibe/questionnaire';

const storage = new AsyncStorageAdapter();

// Save response
const response: QuestionnaireResponse = {
  id: 'response-123',
  questionnaireId: 'wellness-checkin',
  completedAt: new Date(),
  answers: { mood: 8, energy: 'high' },
  metadata: { userId: 'user-123' }, // Optional app-specific data
};

await storage.save(response);

// Get all responses
const allResponses = await storage.getAll();

// Get responses for a specific questionnaire
const questionnaireResponses = await storage.getByQuestionnaireId('wellness-checkin');
```

### Custom Storage Adapter

Implement the `QuestionnaireStorage` interface:

```typescript
import { QuestionnaireStorage, QuestionnaireResponse } from '@spezivibe/questionnaire';

class MyCustomStorage implements QuestionnaireStorage {
  async save(response: QuestionnaireResponse): Promise<void> {
    // Your implementation
  }

  async getAll(): Promise<QuestionnaireResponse[]> {
    // Your implementation
  }

  async getByQuestionnaireId(id: string): Promise<QuestionnaireResponse[]> {
    // Your implementation
  }

  async getById(id: string): Promise<QuestionnaireResponse | null> {
    // Your implementation
  }
}
```

## Question Types

### Text
```typescript
{
  id: 'feedback',
  type: 'text',
  title: 'Your feedback',
  placeholder: 'Enter your thoughts...',
  required: true,
}
```

### Scale (1-10 or custom range)
```typescript
{
  id: 'satisfaction',
  type: 'scale',
  title: 'Rate your satisfaction',
  min: 1,
  max: 5,
  required: true,
}
```

### Multiple Choice
```typescript
{
  id: 'preference',
  type: 'multipleChoice',
  title: 'Select your preference',
  options: [
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
  ],
  required: true,
}
```

### Boolean (Yes/No)
```typescript
{
  id: 'agree',
  type: 'boolean',
  title: 'Do you agree?',
  required: true,
}
```

## API Reference

### QuestionnaireFormProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `questionnaire` | `Questionnaire` | Yes | The questionnaire definition |
| `onResult` | `(result: QuestionnaireResult) => void \| Promise<void>` | Yes | Result handler receiving completed/cancelled/failed status |
| `completionMessage` | `string` | No | Message shown after completion before submitting |
| `cancelBehavior` | `'confirm' \| 'immediate' \| 'disabled'` | No | Cancel behavior (default: "confirm") |
| `theme` | `Partial<QuestionnaireTheme>` | No | Custom theme configuration |
| `initialValues` | `Record<string, any>` | No | Pre-fill form values |
| `submitButtonText` | `string` | No | Custom submit button text (default: "Submit") |
| `cancelButtonText` | `string` | No | Custom cancel button text (default: "Cancel") |

### QuestionnaireResult

```typescript
type QuestionnaireResult =
  | { status: 'completed'; response: QuestionnaireResponse }
  | { status: 'cancelled' }
  | { status: 'failed'; error: Error };
```

## Testing

The package includes a comprehensive test suite with 100+ tests covering all functionality.

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

- Type definitions and interfaces
- Validation schema builder
- Theme utilities
- Storage adapters
- All question components
- QuestionnaireForm component
- Error handling and edge cases

See [TEST_SUMMARY.md](./TEST_SUMMARY.md) for detailed test documentation.

## License

MIT
