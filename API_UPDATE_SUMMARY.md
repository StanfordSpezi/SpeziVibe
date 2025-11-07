# API Update Summary - SpeziQuestionnaire Pattern

## Overview

Updated `@spezivibe/questionnaire` API to match the cleaner design pattern from Stanford's `SpeziQuestionnaire` Swift package.

## Key Changes

### 1. Result-Based API ✅

**Before:**
```typescript
<QuestionnaireForm
  questionnaire={questionnaire}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

**After:**
```typescript
<QuestionnaireForm
  questionnaire={questionnaire}
  onResult={(result) => {
    switch (result.status) {
      case 'completed':
        // Handle completed with response
        break;
      case 'cancelled':
        // Handle cancellation
        break;
      case 'failed':
        // Handle error
        break;
    }
  }}
/>
```

### 2. QuestionnaireResult Type

New discriminated union type inspired by SpeziQuestionnaire:

```typescript
type QuestionnaireResult =
  | { status: 'completed'; response: QuestionnaireResponse }
  | { status: 'cancelled' }
  | { status: 'failed'; error: Error };
```

**Benefits:**
- Single callback handles all outcomes
- Type-safe result handling with exhaustive pattern matching
- Cleaner API surface
- Matches iOS SpeziQuestionnaire pattern

### 3. Cancel Behavior Configuration

New `cancelBehavior` prop with three options:

```typescript
type CancelBehavior =
  | 'confirm'    // Show confirmation dialog (default)
  | 'immediate'  // Cancel immediately without confirmation
  | 'disabled';  // Disable cancel button
```

**Example:**
```typescript
<QuestionnaireForm
  questionnaire={questionnaire}
  onResult={handleResult}
  cancelBehavior="confirm"  // or "immediate" or "disabled"
/>
```

### 4. Completion Messages

New `completionMessage` prop for showing a message after completion:

```typescript
<QuestionnaireForm
  questionnaire={questionnaire}
  onResult={handleResult}
  completionMessage="Thank you for completing the survey!"
/>
```

Shows a completion screen with the message before calling `onResult` with completed status.

## Updated Props

### QuestionnaireFormProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `questionnaire` | `Questionnaire` | ✅ Yes | - | Questionnaire definition |
| `onResult` | `(result: QuestionnaireResult) => void` | ✅ Yes | - | **NEW**: Result handler |
| `completionMessage` | `string` | No | - | **NEW**: Completion screen message |
| `cancelBehavior` | `CancelBehavior` | No | `'confirm'` | **NEW**: Cancel configuration |
| `theme` | `Partial<QuestionnaireTheme>` | No | Light theme | Theme customization |
| `initialValues` | `Record<string, any>` | No | `{}` | Pre-fill values |
| `submitButtonText` | `string` | No | `'Submit'` | Submit button label |
| `cancelButtonText` | `string` | No | `'Cancel'` | Cancel button label |

### Removed Props

- ❌ `onSubmit` - Replaced with `onResult`
- ❌ `onCancel` - Replaced with `onResult` + `cancelBehavior`

## Migration Guide

### Before (Old API)

```typescript
const handleSubmit = async (answers: Record<string, any>) => {
  const response = {
    id: generateId(),
    questionnaireId: questionnaire.id,
    completedAt: new Date(),
    answers,
  };
  await saveResponse(response);
  router.back();
};

const handleCancel = () => {
  Alert.alert('Cancel?', 'Are you sure?', [
    { text: 'No', style: 'cancel' },
    { text: 'Yes', onPress: () => router.back() }
  ]);
};

<QuestionnaireForm
  questionnaire={questionnaire}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

### After (New API)

```typescript
const handleResult = async (result: QuestionnaireResult) => {
  switch (result.status) {
    case 'completed':
      // Response is already created with proper structure
      await saveResponse(result.response);
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

<QuestionnaireForm
  questionnaire={questionnaire}
  onResult={handleResult}
  cancelBehavior="confirm"  // Handles confirmation automatically
/>
```

## Implementation Details

### 1. Component Creates Response

The component now creates the `QuestionnaireResponse` object internally:

```typescript
const response: QuestionnaireResponse = {
  id: `${questionnaire.id}-${Date.now()}`,
  questionnaireId: questionnaire.id,
  completedAt: new Date(),
  answers,
};
```

### 2. Cancel Handling

Cancel behavior is handled internally based on `cancelBehavior` prop:

```typescript
const handleCancel = () => {
  if (cancelBehavior === 'disabled') return;

  if (cancelBehavior === 'immediate') {
    onResult({ status: 'cancelled' });
    return;
  }

  // Show confirmation dialog
  Alert.alert('Cancel Questionnaire', '...', [
    { text: 'Continue', style: 'cancel' },
    { text: 'Cancel', onPress: () => onResult({ status: 'cancelled' }) }
  ]);
};
```

### 3. Completion Message Flow

When `completionMessage` is provided:

1. User completes questionnaire
2. Show completion screen with message
3. User taps "Done"
4. Call `onResult` with completed status

## Benefits of New API

### 1. Cleaner Interface
- Single callback instead of multiple
- Consistent with SpeziQuestionnaire (iOS)
- Less prop drilling

### 2. Better Type Safety
- Discriminated union provides exhaustive checking
- TypeScript ensures all cases are handled
- No optional callbacks

### 3. More Flexibility
- `cancelBehavior` configures confirmation
- `completionMessage` for acknowledgment screens
- Error handling built-in

### 4. Professional Pattern
- Matches industry-standard patterns
- Similar to iOS SpeziQuestionnaire
- Familiar to Swift developers

## Examples

### Basic Usage

```typescript
<QuestionnaireForm
  questionnaire={questionnaire}
  onResult={(result) => {
    if (result.status === 'completed') {
      console.log('Completed!', result.response);
    }
  }}
/>
```

### With All Features

```typescript
<QuestionnaireForm
  questionnaire={questionnaire}
  onResult={handleResult}
  completionMessage="Thank you for your time!"
  cancelBehavior="confirm"
  theme={customTheme}
  initialValues={{ mood: 5 }}
  submitButtonText="Complete"
  cancelButtonText="Not Now"
/>
```

### Advanced Result Handling

```typescript
const handleResult = async (result: QuestionnaireResult) => {
  switch (result.status) {
    case 'completed': {
      // Add metadata
      const enrichedResponse = {
        ...result.response,
        metadata: {
          ...result.response.metadata,
          userId: currentUser.id,
          deviceInfo: getDeviceInfo(),
        },
      };

      // Save to multiple backends
      await Promise.all([
        localStorage.save(enrichedResponse),
        api.post('/responses', enrichedResponse),
        analytics.track('questionnaire_completed', enrichedResponse),
      ]);

      // Navigate based on response
      if (enrichedResponse.answers.followUp === 'yes') {
        router.push('/follow-up');
      } else {
        router.back();
      }
      break;
    }

    case 'cancelled':
      analytics.track('questionnaire_cancelled');
      router.back();
      break;

    case 'failed':
      logError(result.error);
      showErrorScreen();
      break;
  }
};
```

## Testing

Tests updated to use new API:

```typescript
it('should call onResult with completed status', async () => {
  const onResult = jest.fn();

  render(
    <QuestionnaireForm questionnaire={questionnaire} onResult={onResult} />
  );

  // Fill form and submit
  // ...

  expect(onResult).toHaveBeenCalledWith({
    status: 'completed',
    response: expect.objectContaining({
      id: expect.any(String),
      questionnaireId: 'test',
      completedAt: expect.any(Date),
      answers: expect.any(Object),
    }),
  });
});

it('should call onResult with cancelled when immediate cancel', () => {
  const onResult = jest.fn();

  const { getByText } = render(
    <QuestionnaireForm
      questionnaire={questionnaire}
      onResult={onResult}
      cancelBehavior="immediate"
    />
  );

  fireEvent.press(getByText('Cancel'));

  expect(onResult).toHaveBeenCalledWith({ status: 'cancelled' });
});
```

## Documentation Updated

- ✅ README.md with new examples
- ✅ API Reference section updated
- ✅ Quick Start guide updated
- ✅ Advanced Features section added
- ✅ Tests updated and passing
- ✅ Package comparison document created

## Backward Compatibility

⚠️ **Breaking Change**: This is a breaking change. Apps using the old API must migrate to the new pattern.

However, migration is straightforward and results in cleaner code. See [MIGRATION_GUIDE.md](./packages/questionnaire/MIGRATION_GUIDE.md) for step-by-step instructions.

## Comparison with SpeziQuestionnaire

### SpeziQuestionnaire (Swift)

```swift
QuestionnaireView(
    questionnaire: Questionnaire.gcs,
    completionStepMessage: "Thank you!",
    cancelBehavior: .shouldConfirmCancel
) { result in
    guard case let .completed(response) = result else {
        return // cancelled or failed
    }
    // handle response
}
```

### @spezivibe/questionnaire (TypeScript)

```typescript
<QuestionnaireForm
  questionnaire={questionnaire}
  completionMessage="Thank you!"
  cancelBehavior="confirm"
  onResult={(result) => {
    if (result.status === 'completed') {
      // handle result.response
    }
  }}
/>
```

**Very similar patterns!** ✅

## Conclusion

The updated API provides:
- ✅ Cleaner, more professional interface
- ✅ Better type safety
- ✅ Consistency with SpeziQuestionnaire
- ✅ More configuration options
- ✅ Same functionality, better DX

This aligns our React Native package with Stanford's iOS patterns while maintaining cross-platform React Native support.
