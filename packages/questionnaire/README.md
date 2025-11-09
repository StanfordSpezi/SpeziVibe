# @spezivibe/questionnaire

A FHIR R4-compliant React Native questionnaire component library for healthcare applications. Built with Formik, Yup, and full TypeScript support.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Question Types](#question-types)
- [Conditional Logic (enableWhen)](#conditional-logic-enablewhen)
- [Builder API](#builder-api-optional)
- [Result Handling](#result-handling)
- [Theming](#theming)
- [Storage](#storage)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)
- [Examples](#examples)

## Features

- **FHIR R4 Compliant** - Full support for FHIR Questionnaire and QuestionnaireResponse resources
- **Conditional Logic** - Full support for enableWhen with all operators (=, !=, >, <, >=, <=, exists)
- **10+ Question Types** - Boolean, integer, decimal, string, text, date, dateTime, time, choice, group, display
- **Real-time Validation** - Built-in validation with Yup schemas
- **Themeable** - Fully customizable theme system with light/dark defaults
- **Builder API** - Convenient fluent API for programmatic questionnaire creation
- **Expo Go Compatible** - Works with Expo Go (no native modules required)
- **Cross-Platform** - iOS, Android, and Web support

## Installation

```bash
npm install @spezivibe/questionnaire
```

This automatically includes all required dependencies (formik, yup, @types/fhir, react-native-ui-datepicker).

## Quick Start

### Basic Usage with FHIR R4 Format

Use standard FHIR R4 Questionnaire resources directly:

```typescript
import React from 'react';
import { SafeAreaView, Alert } from 'react-native';
import { Questionnaire } from 'fhir/r4';
import {
  QuestionnaireForm,
  QuestionnaireResult,
} from '@spezivibe/questionnaire';
import { useRouter } from 'expo-router';

// Define a FHIR R4 Questionnaire
const dailyCheckIn: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'active',
  id: 'daily-checkin',
  title: 'Daily Check-In',
  description: 'How are you feeling today?',
  item: [
    {
      linkId: 'mood',
      type: 'integer',
      text: 'Rate your mood (1-10)',
      required: true,
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minValue',
          valueInteger: 1,
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
          valueInteger: 10,
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [{
              system: 'http://hl7.org/fhir/questionnaire-item-control',
              code: 'slider',
              display: 'Slider',
            }],
          },
        },
      ],
    },
    {
      linkId: 'exercised',
      type: 'boolean',
      text: 'Did you exercise today?',
      required: true,
    },
    {
      linkId: 'notes',
      type: 'text',
      text: 'Any notes for today?',
    },
  ],
};

export default function CheckInScreen() {
  const router = useRouter();

  const handleResult = async (result: QuestionnaireResult) => {
    if (result.status === 'completed') {
      // FHIR QuestionnaireResponse
      const response = result.response;

      // Send to your FHIR backend
      await fhirClient.create(response);

      Alert.alert('Success', 'Check-in saved!');
      router.back();
    } else if (result.status === 'cancelled') {
      router.back();
    } else if (result.status === 'failed') {
      Alert.alert('Error', result.error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QuestionnaireForm
        questionnaire={dailyCheckIn}
        onResult={handleResult}
      />
    </SafeAreaView>
  );
}
```

### Optional: Using the Builder API

For programmatic questionnaire creation, you can use the optional builder API:

```typescript
import { QuestionnaireBuilder } from '@spezivibe/questionnaire';

// Create the same questionnaire using the builder
const dailyCheckIn = new QuestionnaireBuilder('daily-checkin')
  .title('Daily Check-In')
  .description('How are you feeling today?')
  .addSlider('mood', 'Rate your mood (1-10)', { min: 1, max: 10, required: true })
  .addBoolean('exercised', 'Did you exercise today?', { required: true })
  .addText('notes', 'Any notes for today?')
  .build(); // Returns FHIR R4 Questionnaire

// Use it the same way
<QuestionnaireForm
  questionnaire={dailyCheckIn}
  onResult={handleResult}
/>
```

## Builder API

The builder API provides a convenient way to create FHIR questionnaires programmatically when you need to generate them dynamically:

### Basic Usage

```typescript
import { QuestionnaireBuilder } from '@spezivibe/questionnaire';

const questionnaire = new QuestionnaireBuilder('my-questionnaire')
  .title('My Questionnaire')
  .description('Optional description')
  .addBoolean('q1', 'Question text', { required: true })
  .addInteger('q2', 'Another question', { min: 0, max: 100 })
  .build();
```

### All Builder Methods

#### Basic Information

```typescript
.title(title: string)
.description(description: string)
```

#### Question Types

```typescript
// Boolean (yes/no)
.addBoolean(linkId: string, text: string, options?: {
  required?: boolean;
  enableWhen?: QuestionnaireItemEnableWhen[];
})

// Integer
.addInteger(linkId: string, text: string, options?: {
  min?: number;
  max?: number;
  required?: boolean;
  enableWhen?: QuestionnaireItemEnableWhen[];
})

// Slider (integer with slider UI)
.addSlider(linkId: string, text: string, options: {
  min: number;
  max: number;
  required?: boolean;
  enableWhen?: QuestionnaireItemEnableWhen[];
})

// Decimal (floating point number)
.addDecimal(linkId: string, text: string, options?: {
  min?: number;
  max?: number;
  required?: boolean;
  enableWhen?: QuestionnaireItemEnableWhen[];
})

// String (single-line text)
.addString(linkId: string, text: string, options?: {
  required?: boolean;
  maxLength?: number;
  enableWhen?: QuestionnaireItemEnableWhen[];
})

// Text (multi-line text)
.addText(linkId: string, text: string, options?: {
  required?: boolean;
  maxLength?: number;
  enableWhen?: QuestionnaireItemEnableWhen[];
})

// Date
.addDate(linkId: string, text: string, options?: {
  required?: boolean;
  enableWhen?: QuestionnaireItemEnableWhen[];
})

// DateTime
.addDateTime(linkId: string, text: string, options?: {
  required?: boolean;
  enableWhen?: QuestionnaireItemEnableWhen[];
})

// Time
.addTime(linkId: string, text: string, options?: {
  required?: boolean;
  enableWhen?: QuestionnaireItemEnableWhen[];
})

// Choice (radio buttons / dropdown)
.addChoice(linkId: string, text: string, options: {
  options: Array<{ code: string; display: string }>;
  required?: boolean;
  enableWhen?: QuestionnaireItemEnableWhen[];
})

// Display (informational text, no input)
.addDisplay(linkId: string, text: string)

// Group (container for nested questions)
.addGroup(linkId: string, text: string, items: QuestionnaireItem[])
```

#### Build

```typescript
.build(): Questionnaire  // Returns FHIR R4 Questionnaire
```

### Helper Functions

```typescript
import { enableWhen } from '@spezivibe/questionnaire';

// Create enableWhen conditions
enableWhen(question: string, operator: string, answer: any): QuestionnaireItemEnableWhen

// Example:
.addText('symptoms', 'Describe symptoms', {
  enableWhen: [enableWhen('has_symptoms', '=', true)],
})
```

## Question Types

The library supports all FHIR Questionnaire item types:

| Type | Description | Example |
|------|-------------|---------|
| `boolean` | Yes/No question | "Do you exercise regularly?" |
| `integer` | Whole number | "How many medications do you take?" |
| `integer` (slider) | Integer with slider UI | "Rate your pain (0-10)" |
| `decimal` | Decimal number | "What is your temperature?" |
| `string` | Single-line text | "Emergency contact name" |
| `text` | Multi-line text | "Describe your symptoms" |
| `date` | Date picker | "Date of birth" |
| `dateTime` | Date and time picker | "When did symptoms start?" |
| `time` | Time picker | "What time do you take medication?" |
| `choice` | Single selection | "Blood type" |
| `display` | Informational text | Privacy notices, instructions |
| `group` | Container for nested questions | Organize related questions |

## Conditional Logic (enableWhen)

FHIR supports powerful conditional logic through `enableWhen`. Questions can be shown/hidden based on answers to other questions.

### Basic Example

```typescript
const questionnaire = new QuestionnaireBuilder('conditional-example')
  .title('Health Screening')

  // First question
  .addBoolean('has_symptoms', 'Are you experiencing symptoms?', { required: true })

  // This only shows if has_symptoms is true
  .addText('symptom_details', 'Please describe your symptoms', {
    required: true,
    enableWhen: [enableWhen('has_symptoms', '=', true)],
  })

  .build();
```

### Supported Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `=` | Equal to | `enableWhen('age', '=', 18)` |
| `!=` | Not equal to | `enableWhen('status', '!=', 'healthy')` |
| `>` | Greater than | `enableWhen('pain', '>', 5)` |
| `<` | Less than | `enableWhen('age', '<', 18)` |
| `>=` | Greater than or equal | `enableWhen('bmi', '>=', 25)` |
| `<=` | Less than or equal | `enableWhen('score', '<=', 10)` |
| `exists` | Has any value | `enableWhen('email', 'exists', true)` |

### Multiple Conditions

Use `enableBehavior` to specify how multiple conditions are evaluated:

```typescript
import type { Questionnaire } from '@spezivibe/questionnaire';

const questionnaire: Questionnaire = {
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
      linkId: 'warning',
      type: 'display',
      text: '⚠️ You may be at elevated risk',
      // Show if age > 50 AND smoker = true
      enableWhen: [
        { question: 'age', operator: '>', answerInteger: 50 },
        { question: 'smoker', operator: '=', answerBoolean: true },
      ],
      enableBehavior: 'all', // all conditions must be true
      // Use 'any' for OR logic (any condition true)
    },
  ],
};
```

## Result Handling

The `onResult` callback receives a `QuestionnaireResult` with three possible statuses:

### Completed

When the user successfully submits the questionnaire:

```typescript
const handleResult = async (result: QuestionnaireResult) => {
  if (result.status === 'completed') {
    // FHIR QuestionnaireResponse
    const response = result.response;

    // Response structure:
    console.log(response.id);              // Unique ID
    console.log(response.questionnaire);   // Questionnaire URL/ID
    console.log(response.authored);        // ISO timestamp
    console.log(response.status);          // 'completed'
    console.log(response.item);            // Array of answers

    // Extract answer values
    const mood = response.item?.find(i => i.linkId === 'mood')
      ?.answer?.[0]?.valueInteger;

    // Save to backend
    await api.post('/fhir/QuestionnaireResponse', response);
  }
};
```

### Helper Function for Extracting Answers

```typescript
function getAnswer<T = any>(
  response: QuestionnaireResponse,
  linkId: string
): T | undefined {
  const item = response.item?.find(i => i.linkId === linkId);
  if (!item?.answer?.[0]) return undefined;

  const answer = item.answer[0];

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

// Usage
const mood = getAnswer<number>(response, 'mood');
const exercised = getAnswer<boolean>(response, 'exercised');
```

### Cancelled

When the user cancels the questionnaire:

```typescript
if (result.status === 'cancelled') {
  console.log('User cancelled');
  router.back();
}
```

### Failed

When an error occurs:

```typescript
if (result.status === 'failed') {
  console.error('Error:', result.error);
  Alert.alert('Error', result.error.message);
}
```

## Theming

### Using Default Themes

```typescript
import {
  QuestionnaireForm,
  defaultLightTheme,
  defaultDarkTheme,
} from '@spezivibe/questionnaire';
import { useColorScheme } from 'react-native';

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

### Custom Theme

```typescript
import { QuestionnaireTheme, mergeTheme, defaultLightTheme } from '@spezivibe/questionnaire';

const customTheme: Partial<QuestionnaireTheme> = {
  colors: {
    primary: '#007AFF',
    primaryLight: '#4CA3FF',
  },
  borderRadius: {
    md: 12,
  },
};

// Merge with default theme
const theme = mergeTheme(customTheme, defaultLightTheme);

<QuestionnaireForm
  questionnaire={questionnaire}
  onResult={handleResult}
  theme={theme}
/>
```

### Complete Theme Structure

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

## Storage

**Following the Spezi Standard**, this module does **NOT** provide storage functionality. Storage is the responsibility of the consuming application. This keeps the module focused on questionnaire rendering and collection while giving you full flexibility over data persistence.

### Handling Storage in Your Application

The `onResult` callback receives the completed FHIR `QuestionnaireResponse`. You handle storage there:

```typescript
import { QuestionnaireForm, QuestionnaireResult } from '@spezivibe/questionnaire';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MyScreen() {
  const handleResult = async (result: QuestionnaireResult) => {
    if (result.status === 'completed') {
      const response = result.response; // FHIR QuestionnaireResponse

      // Option 1: Save to local storage
      await AsyncStorage.setItem(
        `response-${response.id}`,
        JSON.stringify(response)
      );

      // Option 2: Send to FHIR server
      await fhirClient.create(response);

      // Option 3: Send to your custom backend
      await fetch('/api/questionnaires', {
        method: 'POST',
        body: JSON.stringify(response),
      });

      // Option 4: Use a state management library
      dispatch(saveQuestionnaireResponse(response));
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

### Storage Examples

#### Local Storage with AsyncStorage

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save response
const saveResponse = async (response: QuestionnaireResponse) => {
  const key = `questionnaire_response_${response.id}`;
  await AsyncStorage.setItem(key, JSON.stringify(response));
};

// Get all responses
const getAllResponses = async (): Promise<QuestionnaireResponse[]> => {
  const keys = await AsyncStorage.getAllKeys();
  const responseKeys = keys.filter(k => k.startsWith('questionnaire_response_'));
  const items = await AsyncStorage.multiGet(responseKeys);
  return items.map(([_, value]) => JSON.parse(value!));
};
```

#### FHIR Server Storage

```typescript
import { FhirClient } from '@your-fhir-client/sdk';

const fhirClient = new FhirClient({ baseUrl: 'https://your-fhir-server.com' });

const handleResult = async (result: QuestionnaireResult) => {
  if (result.status === 'completed') {
    // Standard FHIR create operation
    await fhirClient.create(result.response);
  }
};
```

#### Database Storage (e.g., Realm, WatermelonDB)

```typescript
import { database } from './database';

const handleResult = async (result: QuestionnaireResult) => {
  if (result.status === 'completed') {
    await database.write(async () => {
      await database.get('questionnaire_responses').create(response => {
        response.fhirData = JSON.stringify(result.response);
        response.questionnaireId = result.response.questionnaire;
        response.authoredDate = new Date(result.response.authored);
      });
    });
  }
};
```

### Why No Built-in Storage?

Following the **Spezi architecture pattern**:

1. **Separation of Concerns** - Questionnaire module focuses on UI and data collection
2. **Flexibility** - Your app chooses how/where to store data
3. **No Lock-in** - Works with any storage solution (local, FHIR server, custom API)
4. **Standard FHIR** - You get a standard `QuestionnaireResponse` to use anywhere
5. **Simpler Module** - Fewer dependencies, easier to maintain

## API Reference

### QuestionnaireForm Component

```typescript
interface QuestionnaireFormProps {
  questionnaire: Questionnaire;                    // FHIR R4 Questionnaire
  onResult: (result: QuestionnaireResult) => void | Promise<void>;
  completionMessage?: string;                      // Message shown after completion
  cancelBehavior?: 'confirm' | 'immediate' | 'disabled';
  theme?: Partial<QuestionnaireTheme>;
  initialResponse?: QuestionnaireResponse;         // Pre-fill form
  submitButtonText?: string;                       // Default: 'Submit'
  cancelButtonText?: string;                       // Default: 'Cancel'
}
```

### QuestionnaireBuilder

```typescript
class QuestionnaireBuilder {
  constructor(id: string);

  title(title: string): this;
  description(description: string): this;

  addBoolean(linkId: string, text: string, options?: QuestionOptions): this;
  addInteger(linkId: string, text: string, options?: IntegerOptions): this;
  addSlider(linkId: string, text: string, options: SliderOptions): this;
  addDecimal(linkId: string, text: string, options?: DecimalOptions): this;
  addString(linkId: string, text: string, options?: StringOptions): this;
  addText(linkId: string, text: string, options?: TextOptions): this;
  addDate(linkId: string, text: string, options?: DateOptions): this;
  addDateTime(linkId: string, text: string, options?: DateTimeOptions): this;
  addTime(linkId: string, text: string, options?: TimeOptions): this;
  addChoice(linkId: string, text: string, options: ChoiceOptions): this;
  addDisplay(linkId: string, text: string): this;
  addGroup(linkId: string, text: string, items: QuestionnaireItem[]): this;

  build(): Questionnaire;
}
```

### Types

```typescript
// Re-exported from fhir/r4
import type {
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireItem,
  QuestionnaireResponseItem,
  QuestionnaireItemEnableWhen,
  QuestionnaireItemAnswerOption,
} from '@spezivibe/questionnaire';

// Result type
type QuestionnaireResult =
  | { status: 'completed'; response: QuestionnaireResponse }
  | { status: 'cancelled' }
  | { status: 'failed'; error: Error };
```

## Best Practices

### 1. Use the Builder for Simple Forms

```typescript
// ✅ Good - Easy to read and maintain
const form = new QuestionnaireBuilder('survey')
  .title('Quick Survey')
  .addBoolean('q1', 'Question 1?', { required: true })
  .addInteger('q2', 'Question 2?', { min: 0, max: 10 })
  .build();
```

### 2. Use Raw FHIR for Complex Forms

```typescript
// ✅ Good - Full control for complex forms with enableWhen
const form: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'active',
  item: [
    // Complex nested structure with multiple enableWhen conditions
  ],
};
```

### 3. Always Handle All Result States

```typescript
// ✅ Good - Handles all cases
const handleResult = (result: QuestionnaireResult) => {
  switch (result.status) {
    case 'completed':
      // Handle success
      break;
    case 'cancelled':
      // Handle cancellation
      break;
    case 'failed':
      // Handle error
      break;
  }
};
```

### 4. Use TypeScript for Type Safety

```typescript
// ✅ Good - Type-safe
import type { Questionnaire, QuestionnaireResponse } from '@spezivibe/questionnaire';

const questionnaire: Questionnaire = { ... };
```

### 5. Pre-fill Forms When Editing

```typescript
// ✅ Good - Better UX for editing
<QuestionnaireForm
  questionnaire={questionnaire}
  initialResponse={existingResponse}  // Pre-fill values
  onResult={handleResult}
/>
```

### 6. Use Conditional Logic Wisely

```typescript
// ✅ Good - Clear logic
.addBoolean('has_insurance', 'Do you have insurance?', { required: true })
.addString('policy_number', 'Policy number', {
  required: true,
  enableWhen: [enableWhen('has_insurance', '=', true)],
})
```

### 7. Provide Clear Error Messages

```typescript
// ✅ Good - User-friendly errors
if (result.status === 'failed') {
  Alert.alert(
    'Unable to Save',
    'Your responses could not be saved. Please try again.',
    [
      { text: 'Retry', onPress: () => retry() },
      { text: 'Cancel', style: 'cancel' },
    ]
  );
}
```

## Examples

See [EXAMPLES.md](./EXAMPLES.md) for comprehensive examples including:

- Basic questionnaires
- Conditional logic
- Storage integration
- Custom themes
- Complex health assessments
- Pre-filled forms
- Loading questionnaires from FHIR backends

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT

## Support

For issues, questions, or feature requests, please [open an issue](https://github.com/spezivibe/spezivibe/issues).

## Related Resources

- [FHIR Questionnaire Specification](https://www.hl7.org/fhir/questionnaire.html)
- [FHIR QuestionnaireResponse Specification](https://www.hl7.org/fhir/questionnaireresponse.html)
- [SDC (Structured Data Capture) Implementation Guide](http://hl7.org/fhir/uv/sdc/)
