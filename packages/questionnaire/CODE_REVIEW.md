# React Native Code Review - @spezivibe/questionnaire

**Reviewed by**: Senior React Native Engineer
**Date**: 2025-01-07
**Severity Levels**: 🔴 Critical | 🟡 Important | 🟢 Nice to Have

---

## Executive Summary

The questionnaire package is **well-structured** with good TypeScript coverage and clean separation of concerns. However, there are **several critical mobile-specific issues** that need to be addressed for production use:

- ❌ **Missing accessibility features** (WCAG compliance)
- ❌ **No keyboard handling** (iOS/Android keyboard issues)
- ❌ **Performance issues** (unnecessary re-renders, memory concerns)
- ❌ **Missing haptic feedback** (poor UX on mobile)
- ⚠️ **Storage scalability issues** (loads all data into memory)

**Recommendation**: Address critical issues before production release.

---

## 🔴 Critical Issues

### 1. Missing Accessibility Support

**Impact**: Violates WCAG guidelines, excludes users with disabilities, may fail App Store review.

**Files Affected**:
- `QuestionnaireForm.tsx`
- All question components

**Issues**:

```tsx
// ❌ BAD: No accessibility properties
<Pressable
  style={styles.button}
  onPress={handleSubmit}>
  <Text>Submit</Text>
</Pressable>

// ✅ GOOD: Proper accessibility
<Pressable
  style={styles.button}
  onPress={handleSubmit}
  accessibilityRole="button"
  accessibilityLabel="Submit questionnaire"
  accessibilityHint="Submits your completed questionnaire responses">
  <Text>Submit</Text>
</Pressable>
```

**Required Changes**:

1. **All Pressable components** need:
   - `accessibilityRole="button"`
   - `accessibilityLabel` (descriptive label)
   - `accessibilityHint` (what happens when pressed)
   - `accessibilityState={{ selected: isSelected }}` for selected states

2. **TextInput components** need:
   - `accessibilityLabel` matching the question title
   - `accessibilityHint` for context
   - `returnKeyType="next"` or `"done"`
   - `blurOnSubmit={false}` for multi-field forms

3. **Error messages** need:
   - `accessibilityRole="alert"`
   - `accessibilityLive="polite"`

**Example Fix**:

```tsx
// TextQuestion.tsx
<TextInput
  style={styles.input}
  value={value}
  onChangeText={onChange}
  placeholder={question.placeholder}
  accessibilityLabel={question.title}
  accessibilityHint={question.description || `Enter your ${question.title.toLowerCase()}`}
  returnKeyType="next"
  blurOnSubmit={false}
/>

{hasError && (
  <Text
    style={styles.error}
    accessibilityRole="alert"
    accessibilityLive="polite">
    {error}
  </Text>
)}
```

---

### 2. Missing Keyboard Handling

**Impact**: Poor UX on iOS/Android, keyboard covers inputs, no way to dismiss keyboard.

**Files Affected**: `QuestionnaireForm.tsx`

**Issues**:

```tsx
// ❌ BAD: ScrollView without keyboard handling
<ScrollView style={styles.scrollView}>
  {/* Questions */}
</ScrollView>
```

**Required Changes**:

```tsx
import { KeyboardAvoidingView, Platform } from 'react-native';

// ✅ GOOD: Proper keyboard handling
<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
  <ScrollView
    style={styles.scrollView}
    keyboardShouldPersistTaps="handled"
    keyboardDismissMode="interactive">
    {/* Questions */}
  </ScrollView>
</KeyboardAvoidingView>
```

**Additional Improvements**:

1. Add `keyboardShouldPersistTaps="handled"` to ScrollView
   - Allows tapping buttons without dismissing keyboard first

2. Add `keyboardDismissMode="interactive"` to ScrollView
   - Allows swiping down to dismiss keyboard

3. Consider adding automatic focus to next field:
```tsx
const textInputRefs = useRef<Record<string, TextInput | null>>({});

// In TextInput
<TextInput
  ref={(ref) => textInputRefs.current[question.id] = ref}
  returnKeyType={isLastQuestion ? 'done' : 'next'}
  onSubmitEditing={() => {
    const nextQuestion = questions[index + 1];
    if (nextQuestion) {
      textInputRefs.current[nextQuestion.id]?.focus();
    }
  }}
/>
```

---

### 3. Performance Issues - Unnecessary Re-renders

**Impact**: Laggy UI, poor battery life, frame drops on low-end devices.

**Files Affected**: `QuestionnaireForm.tsx`, all question components

**Issues**:

```tsx
// ❌ BAD: Creating objects/arrays on every render
export function QuestionnaireForm({ questionnaire, ... }) {
  const theme = mergeTheme(userTheme, defaultLightTheme); // ⚠️ New object every render
  const validationSchema = createValidationSchema(questionnaire.questions); // ⚠️ New schema every render

  const initialValues: Record<string, any> = userInitialValues || {};
  questionnaire.questions.forEach((question) => { // ⚠️ Mutating on every render
    if (initialValues[question.id] === undefined) {
      initialValues[question.id] = '';
    }
  });

  // ...
}
```

**Required Changes**:

```tsx
import { useMemo } from 'react';

export function QuestionnaireForm({ questionnaire, ... }) {
  // ✅ GOOD: Memoize theme
  const theme = useMemo(
    () => mergeTheme(userTheme, defaultLightTheme),
    [userTheme]
  );

  // ✅ GOOD: Memoize validation schema
  const validationSchema = useMemo(
    () => createValidationSchema(questionnaire.questions),
    [questionnaire.questions]
  );

  // ✅ GOOD: Memoize initial values
  const initialValues = useMemo(() => {
    const values: Record<string, any> = { ...userInitialValues };
    questionnaire.questions.forEach((question) => {
      if (values[question.id] === undefined) {
        values[question.id] = '';
      }
    });
    return values;
  }, [questionnaire.questions, userInitialValues]);
}
```

**ScaleQuestion.tsx**:

```tsx
// ❌ BAD: Creating array on every render
export function ScaleQuestion({ question, ... }) {
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  // ...
}

// ✅ GOOD: Memoize values array
export function ScaleQuestion({ question, ... }) {
  const values = useMemo(
    () => Array.from({ length: max - min + 1 }, (_, i) => min + i),
    [min, max]
  );
  // ...
}
```

---

### 4. Missing Haptic Feedback

**Impact**: Poor mobile UX, no tactile feedback on interactions.

**Files Affected**: All question components, `QuestionnaireForm.tsx`

**Issue**: Mobile users expect haptic feedback when interacting with buttons and selections.

**Required Changes**:

```tsx
import * as Haptics from 'expo-haptics';
// OR
import { Platform } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

// ✅ Add haptic feedback to all interactions
<Pressable
  onPress={() => {
    // Provide haptic feedback
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    formik.setFieldValue(question.id, value);
  }}>
  <Text>{value}</Text>
</Pressable>
```

**Recommended Haptic Patterns**:

1. **Scale/Boolean/Multiple Choice Selection**: Light impact
2. **Submit Button**: Medium impact
3. **Cancel (with confirmation)**: Heavy impact
4. **Validation Error**: Notification (error type)
5. **Completion**: Notification (success type)

**Implementation Example**:

```tsx
// utils/haptics.ts
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const triggerHaptic = {
  light: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },
  medium: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },
  error: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },
  success: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },
};
```

---

## 🟡 Important Issues

### 5. Storage Scalability Problem

**Impact**: Poor performance with many responses, high memory usage, potential crashes.

**Files Affected**: `storage/adapters/async-storage.ts`

**Issues**:

```tsx
// ❌ BAD: Loads ALL responses into memory for every operation
async save(response: QuestionnaireResponse): Promise<void> {
  const existing = await this.getAll(); // ⚠️ Loads everything
  const updated = [...existing.filter((r) => r.id !== response.id), response];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

async getByQuestionnaireId(questionnaireId: string): Promise<QuestionnaireResponse[]> {
  const all = await this.getAll(); // ⚠️ Loads everything
  return all.filter((r) => r.questionnaireId === questionnaireId);
}
```

**Problems**:

1. **Memory issues**: Loading 1000+ responses into memory
2. **Performance**: O(n) for every operation
3. **No pagination**: Can't handle large datasets
4. **Battery drain**: Excessive read/write operations

**Recommended Solutions**:

**Option A: Individual Keys (Best for AsyncStorage)**

```tsx
// ✅ GOOD: Store each response individually
export class AsyncStorageAdapter implements QuestionnaireStorage {
  private getKey(id: string): string {
    return `@questionnaire_response_${id}`;
  }

  private getIndexKey(): string {
    return '@questionnaire_response_index';
  }

  async save(response: QuestionnaireResponse): Promise<void> {
    try {
      // Save the response
      await AsyncStorage.setItem(
        this.getKey(response.id),
        JSON.stringify(response)
      );

      // Update index
      const index = await this.getIndex();
      if (!index.includes(response.id)) {
        index.push(response.id);
        await AsyncStorage.setItem(
          this.getIndexKey(),
          JSON.stringify(index)
        );
      }
    } catch (error) {
      throw new Error(`Failed to save response: ${error.message}`);
    }
  }

  private async getIndex(): Promise<string[]> {
    const data = await AsyncStorage.getItem(this.getIndexKey());
    return data ? JSON.parse(data) : [];
  }

  async getById(id: string): Promise<QuestionnaireResponse | null> {
    try {
      const data = await AsyncStorage.getItem(this.getKey(id));
      if (!data) return null;

      const response = JSON.parse(data);
      return {
        ...response,
        completedAt: new Date(response.completedAt),
      };
    } catch (error) {
      return null;
    }
  }

  async getByQuestionnaireId(
    questionnaireId: string,
    limit?: number,
    offset?: number
  ): Promise<QuestionnaireResponse[]> {
    const index = await this.getIndex();
    const results: QuestionnaireResponse[] = [];

    for (const id of index) {
      const response = await this.getById(id);
      if (response?.questionnaireId === questionnaireId) {
        results.push(response);
      }
    }

    // Apply pagination
    const start = offset || 0;
    const end = limit ? start + limit : undefined;
    return results.slice(start, end);
  }
}
```

**Option B: Use a proper database (Recommended for production)**

```tsx
// Consider using:
// - WatermelonDB: https://nozbe.github.io/WatermelonDB/
// - Realm: https://realm.io/
// - SQLite: https://github.com/andpor/react-native-sqlite-storage

// These provide:
// - Proper indexing
// - Efficient queries
// - Pagination support
// - Better memory management
```

---

### 6. No Error Boundaries

**Impact**: App crashes instead of graceful error handling.

**Files Affected**: Package doesn't include error boundaries

**Required Addition**:

```tsx
// components/ErrorBoundary.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface Props {
  children: React.ReactNode;
  fallback?: (error: Error, resetError: () => void) => React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class QuestionnaireErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Questionnaire Error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          <Pressable style={styles.button} onPress={this.resetError}>
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

// Usage:
<QuestionnaireErrorBoundary>
  <QuestionnaireForm questionnaire={q} onResult={handleResult} />
</QuestionnaireErrorBoundary>
```

---

### 7. Pressable Visual Feedback

**Impact**: No visual feedback when buttons are pressed (poor UX).

**Files Affected**: All components with Pressable

**Issues**:

```tsx
// ❌ BAD: No press feedback
<Pressable
  style={styles.button}
  onPress={handlePress}>
  <Text>Submit</Text>
</Pressable>
```

**Required Changes**:

```tsx
// ✅ GOOD: Visual feedback on press
<Pressable
  style={({ pressed }) => [
    styles.button,
    pressed && styles.buttonPressed, // Add pressed state
    { opacity: pressed ? 0.7 : 1 }, // Or opacity
  ]}
  onPress={handlePress}
  android_ripple={{ color: theme.colors.primaryLight }}>
  <Text>Submit</Text>
</Pressable>
```

**Better: Use custom hook**:

```tsx
// hooks/usePressableStyle.ts
import { useMemo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export function usePressableStyle(
  baseStyle: StyleProp<ViewStyle>,
  options?: { opacity?: number; scale?: number }
) {
  const { opacity = 0.7, scale = 0.98 } = options || {};

  return useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => [
        baseStyle,
        pressed && {
          opacity,
          transform: [{ scale }],
        },
      ],
    [baseStyle, opacity, scale]
  );
}

// Usage:
const buttonStyle = usePressableStyle(styles.button, { opacity: 0.8 });
<Pressable style={buttonStyle} onPress={handlePress}>
```

---

## 🟢 Nice to Have Improvements

### 8. Add Loading States

Currently no loading indicators when `onResult` is async:

```tsx
// Add loading state
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (answers: Record<string, any>) => {
  setIsSubmitting(true);
  try {
    await submitQuestionnaire(answers);
  } finally {
    setIsSubmitting(false);
  }
};

// Disable buttons during submission
<Pressable
  disabled={isSubmitting}
  style={({ pressed }) => [
    styles.button,
    isSubmitting && styles.buttonDisabled,
  ]}>
  {isSubmitting ? (
    <ActivityIndicator color={theme.colors.selectedBackground} />
  ) : (
    <Text>{submitButtonText}</Text>
  )}
</Pressable>
```

---

### 9. Optimize TextInput for Different Input Types

Add intelligent keyboard types:

```tsx
// types/index.ts
export interface Question {
  // ... existing fields
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
}

// TextQuestion.tsx
<TextInput
  keyboardType={question.keyboardType || 'default'}
  autoCapitalize={question.autoCapitalize || 'sentences'}
  autoCorrect={question.autoCorrect ?? true}
  textContentType={inferTextContentType(question)} // iOS autocomplete
/>

function inferTextContentType(question: Question): TextContentType {
  const title = question.title.toLowerCase();
  if (title.includes('email')) return 'emailAddress';
  if (title.includes('phone')) return 'telephoneNumber';
  if (title.includes('name')) return 'name';
  return 'none';
}
```

---

### 10. Add Animation for Better UX

```tsx
import Animated, {
  FadeInDown,
  FadeOutUp,
  Layout,
} from 'react-native-reanimated';

// Animate questions
{questionnaire.questions.map((question, index) => (
  <Animated.View
    key={question.id}
    entering={FadeInDown.delay(index * 100)}
    layout={Layout.springify()}>
    {renderQuestion(question)}
  </Animated.View>
))}

// Animate errors
{hasError && (
  <Animated.View entering={FadeInDown} exiting={FadeOutUp}>
    <Text style={styles.error}>{error}</Text>
  </Animated.View>
)}
```

---

### 11. Safe Area Handling

Add SafeAreaView or insets for modern devices:

```tsx
import { SafeAreaView } from 'react-native-safe-area-context';

// Wrap the form
<SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
  <QuestionnaireForm ... />
</SafeAreaView>
```

---

### 12. Improve Type Safety

Replace `any` types with proper types:

```tsx
// ❌ BAD
interface TextQuestionProps {
  formik: FormikProps<any>; // 🚨 any
}

// ✅ GOOD
interface TextQuestionProps {
  formik: FormikProps<Record<string, unknown>>;
}

// Even better - use generic
interface QuestionProps<T = unknown> {
  question: Question;
  formik: FormikProps<Record<string, T>>;
  theme: QuestionnaireTheme;
}
```

---

## Performance Benchmarks

Run these tests on low-end devices (e.g., iPhone SE, budget Android):

- [ ] Questionnaire with 50 questions renders in <500ms
- [ ] Scrolling maintains 60fps
- [ ] Keyboard interactions are smooth
- [ ] Storage operations complete in <100ms
- [ ] Memory usage stays under 50MB

---

## Testing Recommendations

### Accessibility Testing

```bash
# iOS
# Enable VoiceOver in Settings > Accessibility
# Test all interactions with VoiceOver enabled

# Android
# Enable TalkBack in Settings > Accessibility
# Test all interactions with TalkBack enabled
```

### Performance Testing

```tsx
// Add performance monitoring
import { InteractionManager } from 'react-native';

useEffect(() => {
  const start = Date.now();

  InteractionManager.runAfterInteractions(() => {
    const renderTime = Date.now() - start;
    console.log(`Questionnaire render time: ${renderTime}ms`);

    // Alert if too slow
    if (renderTime > 500) {
      console.warn('Slow render detected');
    }
  });
}, []);
```

---

## Priority Action Items

### Before Production Release (Critical)

1. ✅ Add accessibility properties to all interactive elements
2. ✅ Implement KeyboardAvoidingView and proper keyboard handling
3. ✅ Add useMemo for performance optimization
4. ✅ Implement haptic feedback
5. ✅ Fix storage scalability issues
6. ✅ Add error boundaries

### Phase 2 (Important)

7. ✅ Add Pressable visual feedback
8. ✅ Add loading states for async operations
9. ✅ Optimize TextInput keyboard types
10. ✅ Add proper TypeScript types (remove `any`)

### Phase 3 (Nice to Have)

11. ✅ Add animations for better UX
12. ✅ Implement SafeAreaView
13. ✅ Add performance monitoring
14. ✅ Create comprehensive accessibility tests

---

## Conclusion

The questionnaire package has a **solid foundation** but needs **critical mobile-specific improvements** before production use. The issues identified are common in React Native development and straightforward to fix.

**Estimated effort to fix critical issues**: 2-3 days
**Estimated effort for all improvements**: 5-7 days

**Overall Grade**: B- (Would be A- after addressing critical issues)

### Strengths

✅ Clean TypeScript architecture
✅ Good separation of concerns
✅ Comprehensive test coverage
✅ Flexible theming system
✅ Well-documented API

### Critical Gaps

❌ Missing accessibility (WCAG violations)
❌ Poor keyboard handling (mobile UX issue)
❌ Performance concerns (unnecessary re-renders)
❌ No haptic feedback (mobile UX issue)
❌ Storage scalability (won't scale beyond few hundred responses)

---

**Next Steps**: Would you like me to implement these fixes? I can create a detailed implementation plan with priority ordering.
