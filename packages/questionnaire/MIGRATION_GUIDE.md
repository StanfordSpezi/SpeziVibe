# Migration Guide: From App-Coupled to @spezivibe/questionnaire

This guide helps you migrate from the original app-coupled questionnaire implementation to the new `@spezivibe/questionnaire` package.

## Overview of Changes

The questionnaire functionality has been extracted into an independent, reusable npm package. Here's what changed:

### Before (Coupled)
- Questionnaire types coupled to app-specific concepts (taskId, etc.)
- Form component depends on app theme system
- Tight integration with scheduler
- Hard-coded colors and styling

### After (Decoupled)
- Generic types with flexible metadata field
- Theme-agnostic with customizable theme props
- No scheduler dependencies (parent handles integration)
- Fully customizable styling

## Step-by-Step Migration

### 1. Update Imports

**Before:**
```typescript
import { QuestionnaireForm } from '@/components/questionnaire-form';
import { Questionnaire } from '@/lib/questionnaires/types';
```

**After:**
```typescript
import { QuestionnaireForm, defaultLightTheme, defaultDarkTheme } from '@spezivibe/questionnaire';
import { Questionnaire } from '@/lib/questionnaires/types'; // Still works - re-exports from package
```

### 2. Update Component Usage

**Before:**
```typescript
<QuestionnaireForm
  questionnaire={questionnaire}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
// Component used app's useColorScheme() hook internally
```

**After:**
```typescript
import { useColorScheme } from '@/hooks/use-color-scheme';

const colorScheme = useColorScheme();
const theme = colorScheme === 'dark' ? defaultDarkTheme : defaultLightTheme;

<QuestionnaireForm
  questionnaire={questionnaire}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  theme={theme} // Now explicitly pass theme
/>
```

### 3. Update Response Handling

**Before:**
```typescript
interface QuestionnaireResponse {
  questionnaireId: string;
  taskId: string;  // ❌ Scheduler-specific
  completedAt: Date;
  answers: Record<string, any>;
}
```

**After:**
```typescript
interface QuestionnaireResponse {
  id: string;  // ✅ New unique ID field
  questionnaireId: string;
  completedAt: Date;
  answers: Record<string, any>;
  metadata?: Record<string, any>;  // ✅ Flexible for any app data
}

// In your submit handler:
const handleSubmit = async (answers: Record<string, any>) => {
  const response: QuestionnaireResponse = {
    id: generateUniqueId(), // You provide the ID
    questionnaireId: questionnaire.id,
    completedAt: new Date(),
    answers,
    metadata: {
      taskId,      // ✅ App-specific data in metadata
      eventId,
      userId,
      // ... any other app data
    },
  };

  await saveResponse(response);
};
```

### 4. Update Storage (Optional)

If you were using custom storage logic, you can now use the provided adapters:

**Before:**
```typescript
// Custom AsyncStorage logic scattered throughout app
const responses = JSON.parse(await AsyncStorage.getItem(KEY));
```

**After:**
```typescript
import { AsyncStorageAdapter } from '@spezivibe/questionnaire';

const storage = new AsyncStorageAdapter();
await storage.save(response);
const allResponses = await storage.getAll();
```

## Custom Theme Example

If your app has a custom color scheme:

```typescript
import { QuestionnaireForm, QuestionnaireTheme } from '@spezivibe/questionnaire';

const myAppTheme: Partial<QuestionnaireTheme> = {
  colors: {
    primary: '#YOUR_PRIMARY_COLOR',
    background: '#YOUR_BACKGROUND',
    text: '#YOUR_TEXT_COLOR',
    // ... other colors
  },
};

<QuestionnaireForm
  questionnaire={questionnaire}
  onSubmit={handleSubmit}
  theme={myAppTheme}
/>
```

## Breaking Changes

### 1. QuestionnaireResponse Type
- **Removed:** `taskId` field (moved to `metadata`)
- **Added:** `id` field (required unique identifier)
- **Added:** `metadata` field (optional Record<string, any>)

### 2. Component Props
- **Added:** `theme` prop (Partial<QuestionnaireTheme>)
- **Changed:** Component no longer uses internal `useColorScheme` hook

### 3. Import Paths
- Types now exported from `@spezivibe/questionnaire`
- Old import paths still work (re-exported for compatibility)

## Benefits After Migration

✅ **Reusable** - Use in any React Native project
✅ **Type-Safe** - Full TypeScript support
✅ **Flexible** - Customize theme, storage, validation
✅ **Maintainable** - Clear separation of concerns
✅ **Testable** - Package can be tested independently

## Troubleshooting

### TypeScript errors about missing properties

If you see errors like "Property 'id' is missing":
- Ensure you're generating a unique `id` for responses
- Update any old response objects to include the `id` field

### Theme not applied correctly

- Make sure you're passing the `theme` prop to `QuestionnaireForm`
- Check that you're using the correct theme object format
- Use `defaultLightTheme` or `defaultDarkTheme` as base templates

### Storage adapter issues

- Ensure `@react-native-async-storage/async-storage` is installed
- The AsyncStorageAdapter is optional - implement your own if needed

## Need Help?

Check the main [README.md](./README.md) for complete API documentation and examples.
