# SpeziVibe Architecture

## Overview

SpeziVibe is a React Native + Expo template for digital health applications. It follows patterns from [Stanford Spezi](https://github.com/StanfordSpezi) and is optimized for rapid prototyping and AI-assisted development.

## Tech Stack

- **React Native 0.76** - Cross-platform mobile framework
- **Expo 52** - Development platform and tooling
- **TypeScript 5.3** - Type-safe JavaScript
- **Expo Router** - File-based navigation system
- **Formik + Yup** - Form state and validation
- **AsyncStorage** - Local data persistence

## Project Structure

```
spezivibe/
├── app/                          # Expo Router pages
│   ├── (onboarding)/            # Onboarding flow route group
│   │   ├── _layout.tsx          # Onboarding stack navigator
│   │   ├── welcome.tsx          # Welcome screen
│   │   ├── features.tsx         # Feature showcase
│   │   ├── consent.tsx          # Informed consent
│   │   └── get-started.tsx      # Completion screen
│   ├── (tabs)/                  # Main app tabs route group
│   │   ├── _layout.tsx          # Tab navigator
│   │   ├── index.tsx            # Home tab
│   │   ├── schedule.tsx         # Schedule tab
│   │   ├── contacts.tsx         # Contacts tab
│   │   └── explore.tsx          # Explore/settings tab
│   ├── questionnaire/           # Questionnaire modal route
│   │   ├── _layout.tsx          # Modal configuration
│   │   └── [id].tsx             # Dynamic questionnaire screen
│   └── _layout.tsx              # Root layout
├── components/                   # Reusable UI components
│   ├── themed-*.tsx             # Theme-aware components
│   ├── calendar-strip.tsx       # Calendar navigation
│   └── questionnaire-form.tsx   # Dynamic form component
├── lib/                         # Business logic modules
│   ├── scheduler/               # Task scheduling system
│   │   ├── types.ts            # TypeScript definitions
│   │   ├── scheduler.ts        # Core scheduler class
│   │   ├── utils.ts            # Helper functions
│   │   ├── context.tsx         # React Context provider
│   │   ├── sample-tasks.ts     # Predefined tasks
│   │   └── index.ts            # Module exports
│   └── questionnaires/          # Questionnaire system
│       ├── types.ts            # TypeScript definitions
│       ├── sample-questionnaires.ts  # Predefined questionnaires
│       └── index.ts            # Module exports
├── constants/                   # App-wide constants
│   └── theme.ts                # Color scheme and fonts
└── assets/                      # Static resources
    └── images/                  # Images and logos
```

## Core Systems

### 1. Scheduler System

**Purpose**: Manage recurring tasks with completion tracking

**Key Concepts**:
- **Tasks**: Definitions of what needs to be done (e.g., "Morning Wellness Check")
- **Schedules**: When tasks should occur (daily, weekly, monthly, once)
- **Occurrences**: Specific instances of a task (e.g., "Morning Wellness Check on Nov 4")
- **Events**: Combination of Task + Occurrence + optional Outcome
- **Outcomes**: Completed events with timestamps and data

**Implementation**:
```typescript
// Task categories
type TaskCategory = 'questionnaire' | 'task' | 'reminder' | 'measurement';

// Completion policies
type AllowedCompletionPolicy =
  | { type: 'anytime' }
  | { type: 'window'; start: number; end: number };

// Recurrence rules
type RecurrenceRule =
  | { type: 'daily'; hour: number; minute: number }
  | { type: 'weekly'; weekday: number; hour: number; minute: number }
  | { type: 'monthly'; day: number; hour: number; minute: number }
  | { type: 'once'; date: Date };
```

**Data Flow**:
1. Tasks defined in `sample-tasks.ts`
2. Scheduler calculates occurrences based on date range
3. Events displayed in Schedule tab
4. User completes event → Outcome stored in AsyncStorage
5. UI updates via Context provider

### 2. Questionnaire System

**Purpose**: Dynamic form generation with validation

**Key Concepts**:
- **Questionnaires**: Collections of questions with metadata
- **Questions**: Individual form fields with types and validation rules
- **Responses**: User answers stored with timestamps

**Question Types**:
- `text` - Free-form text input (multiline)
- `scale` - Numeric scale (e.g., 1-10)
- `multipleChoice` - Single selection from options
- `boolean` - Yes/No question

**Implementation**:
- Forms built with Formik for state management
- Yup schemas generated from question definitions
- Real-time validation with error messages
- Integration with scheduler via `questionnaireId`

**Data Flow**:
1. User taps questionnaire task in Schedule
2. Completion policy validated
3. Questionnaire modal opens with form
4. User fills form → Formik validates
5. Submit → Response saved to AsyncStorage
6. Task marked complete via Scheduler

### 3. Navigation System

**Pattern**: File-based routing with Expo Router

**Route Groups**:
- `(onboarding)` - Sequential flow, no tabs
- `(tabs)` - Main app with bottom navigation
- `questionnaire` - Modal presentation

**Navigation Logic**:
```typescript
// Check onboarding status
const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);

// Navigate based on status
if (!isOnboardingCompleted && !inOnboarding) {
  router.replace('/(onboarding)/welcome');
}

// Push to modal
router.push({
  pathname: '/questionnaire/[id]',
  params: { id: 'wellness-checkin' }
});
```

### 4. State Management

**Pattern**: React Context + AsyncStorage

**Global State**:
- `SchedulerContext` - Tasks and outcomes
- Theme - via `useColorScheme()` hook
- Navigation - managed by Expo Router

**Local State**:
- Component state with `useState`
- Side effects with `useEffect`
- Memoization with `useMemo`, `useCallback`

**Persistence**:
```typescript
// Keys used in AsyncStorage
const STORAGE_KEYS = {
  SCHEDULER: '@scheduler_state',
  ONBOARDING: '@onboarding_completed',
  CONSENT: '@consent_data',
  RESPONSES: '@questionnaire_responses',
};
```

## Design Patterns

### 1. Provider Pattern
Used for global state (Scheduler):
```typescript
export function SchedulerProvider({ children }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  // ... scheduler logic
  return (
    <SchedulerContext.Provider value={{ scheduler, tasks }}>
      {children}
    </SchedulerContext.Provider>
  );
}
```

### 2. Themed Components
For dark mode support:
```typescript
export function ThemedView({ style, ...props }: ViewProps) {
  const backgroundColor = useThemeColor({}, 'background');
  return <View style={[{ backgroundColor }, style]} {...props} />;
}
```

### 3. Dynamic Forms
Formik + Yup for validation:
```typescript
const validationSchema = createValidationSchema(questions);
<Formik
  initialValues={initialValues}
  validationSchema={validationSchema}
  onSubmit={onSubmit}
>
  {(formik) => <FormFields formik={formik} />}
</Formik>
```

### 4. Type-Safe Routing
Expo Router with params:
```typescript
const { id, taskId } = useLocalSearchParams<{
  id: string;
  taskId: string;
}>();
```

## Data Models

### Task
```typescript
interface Task {
  id: string;                    // Unique identifier
  title: string;                 // Display name
  instructions: string;          // User instructions
  category: TaskCategory;        // Type of task
  schedule: Schedule;            // When it occurs
  completionPolicy: AllowedCompletionPolicy;
  questionnaireId?: string;      // Link to questionnaire
  tags?: string[];               // For filtering
  createdAt: Date;               // Creation timestamp
  effectiveFrom: Date;           // When task becomes active
}
```

### Event
```typescript
interface Event {
  task: Task;                    // What to do
  occurrence: Occurrence;        // When to do it
  outcome?: Outcome;             // If completed
}
```

### Questionnaire
```typescript
interface Questionnaire {
  id: string;                    // Unique identifier
  title: string;                 // Display name
  description: string;           // Purpose/instructions
  questions: Question[];         // Form fields
}
```

## Extension Points

### Adding New Features

**New Task Type**:
1. Add to `TaskCategory` union in `lib/scheduler/types.ts`
2. Update icon mapping in `schedule.tsx`
3. Add to `sample-tasks.ts`

**New Question Type**:
1. Add to `QuestionType` union in `lib/questionnaires/types.ts`
2. Create question component in `questionnaire-form.tsx`
3. Add validation logic

**New Screen**:
1. Create file in appropriate route group
2. Add to `_layout.tsx` if navigation config needed
3. Use themed components for consistency

**New Module**:
1. Create folder in `lib/`
2. Define types in `types.ts`
3. Implement logic in separate files
4. Export via `index.ts`
5. Create Context provider if needed

## Best Practices

1. **Type Safety**: Use TypeScript strictly, avoid `any`
2. **Modularity**: Keep business logic in `lib/`, UI in `components/`
3. **Consistency**: Follow established patterns (Context, themed components)
4. **Performance**: Use `useMemo` and `useCallback` for expensive operations
5. **Persistence**: Use AsyncStorage for all user data
6. **Validation**: Use Yup schemas for all form validation
7. **Navigation**: Use `router` from Expo Router, avoid imperative navigation
8. **Theming**: Always support dark mode with themed components
9. **Documentation**: Keep this file updated with architectural changes
10. **AI-Friendly**: Write clear, well-structured code with descriptive names

## Common Pitfalls

1. **AsyncStorage is async**: Always `await` operations
2. **Date serialization**: Convert dates to/from ISO strings when persisting
3. **Navigation timing**: Use `useEffect` with proper dependencies
4. **Context updates**: Trigger re-renders with state changes
5. **Formik state**: Access via `formik.values`, not direct state
6. **Dark mode**: Test all UI changes in both themes
7. **Type imports**: Import types alongside values for clarity

## Testing Strategy

**Current State**: No automated tests (template project)

**Recommended Testing**:
1. **Manual**: Test dark mode, all user flows
2. **Exploratory**: Use test questionnaires in Explore tab
3. **Reset Functions**: Use reset buttons to clear state
4. **Device Testing**: Test on iOS and Android

**Future**: Add Jest + React Native Testing Library for unit/integration tests
