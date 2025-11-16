# SpeziVibe Architecture

## Overview

SpeziVibe is a React Native + Expo template for digital health applications. It follows the **Standard pattern** from [Stanford Spezi](https://github.com/StanfordSpezi) and implements production-ready React patterns optimized for rapid prototyping and AI-assisted development.

## Tech Stack

- **React Native 0.76** - Cross-platform mobile framework
- **Expo 52** - Development platform and tooling
- **TypeScript 5.3** - Type-safe JavaScript
- **Expo Router** - File-based navigation system
- **Formik + Yup** - Form state and validation
- **AsyncStorage** - Local data persistence

## Core Architecture: The Standard Pattern

### What is the Standard?

Inspired by Stanford Spezi, the **Standard** is the central orchestrator that manages data flow throughout the application. It's implemented in `lib/services/standard-context.tsx` and provides:

- **Backend Service** - Pluggable storage (local or Firebase)
- **Centralized Initialization** - Ensures proper startup order
- **Error Management** - Exposes errors with retry mechanism
- **Global Accessibility** - Available to all modules via `useStandard()` hook

### Provider Hierarchy

```typescript
app/_layout.tsx:
  <StandardProvider>              // Step 1: Initialize backend & accountService
    <SchedulerProvider>           // Step 2: Initialize scheduler using backend
      <AccountProvider>           // Step 3: Provide auth UI components & state
        <App />                   // Step 4: Render app when all ready
      </AccountProvider>
    </SchedulerProvider>
  </StandardProvider>
```

**Why this order?**
- Standard must initialize first (provides backend and accountService)
- Standard syncs user ID from accountService to backend automatically
- Scheduler depends on backend for data storage
- AccountProvider wraps accountService to provide React hooks/components
- Children render during loading for smooth UX

### Backend System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│              (Scheduler, Auth UI, Questionnaires)           │
└─────────────┬────────────────────────────────┬──────────────┘
              │                                │
              ▼                                ▼
┌──────────────────────────┐   ┌──────────────────────────────┐
│  BackendService          │   │    AccountService            │
│  (Data Storage)          │   │    (Authentication)          │
│  - Tasks                 │   │    - Login/Register/Logout   │
│  - Outcomes              │   │    - Profile Management      │
│  - Questionnaire Data    │   │    - Password Reset          │
└──────────┬───────────────┘   └──────────────┬───────────────┘
           │                                  │
           │        ┌─────────────────────────┘
           │        │  User ID sync
           │        ▼
           │   ┌─────────────────────────────┐
           │   │        Standard             │
           │   │   (Orchestrator)            │
           │   └─────────────────────────────┘
           │
┌──────────┴───────────┐              ┌────────────────────┐
│  LocalStorage        │              │    Firebase        │
│  Backend             │              │    Backend         │
│  (AsyncStorage)      │              │    (Firestore)     │
└──────────────────────┘              └────────────────────┘
```

**Separation of Concerns**:
- **AccountService**: Handles ALL authentication and profile management
- **BackendService**: Handles ONLY data storage (tasks, outcomes, questionnaires)
- **Standard**: Coordinates by syncing user ID from AccountService to BackendService
- **No Overlap**: Authentication never touches backend; backend never handles auth

## Project Structure

```
spezivibe/
├── app/                          # Expo Router pages
│   ├── (onboarding)/            # Onboarding flow route group
│   │   ├── _layout.tsx          # Onboarding stack navigator
│   │   ├── welcome.tsx          # Welcome screen
│   │   ├── features.tsx         # Feature showcase
│   │   ├── consent.tsx          # Informed consent
│   │   ├── get-started.tsx      # Completion screen
│   │   ├── register.tsx         # Registration with auto-skip
│   │   └── sign-in.tsx          # Sign in with auto-skip
│   ├── (tabs)/                  # Main app tabs route group
│   │   ├── _layout.tsx          # Tab navigator
│   │   ├── index.tsx            # Home tab
│   │   ├── schedule.tsx         # Schedule tab
│   │   ├── contacts.tsx         # Contacts tab
│   │   └── explore.tsx          # Explore/settings tab
│   ├── questionnaire/           # Questionnaire modal route
│   │   ├── _layout.tsx          # Modal configuration
│   │   └── [id].tsx             # Dynamic questionnaire screen
│   └── _layout.tsx              # Root layout with Standard
├── components/                   # Reusable UI components
│   ├── themed-*.tsx             # Theme-aware components
│   ├── calendar-strip.tsx       # Calendar navigation
│   └── questionnaire-form.tsx   # Dynamic form component
├── hooks/                       # Shared React hooks
│   ├── use-color-scheme.ts     # Theme detection
│   ├── use-theme-color.ts      # Color utilities
│   ├── use-onboarding-status.ts # Onboarding completion check
│   └── use-auto-skip-if-authenticated.ts # Auth skip logic
├── lib/                         # Business logic modules
│   ├── constants.ts            # App-wide constants
│   ├── services/                # Backend services
│   │   ├── standard-context.tsx # The Standard (core orchestrator)
│   │   ├── account-service-factory.ts # Creates account service instances
│   │   ├── backend-factory.ts  # Creates backend instances
│   │   ├── config.ts           # Backend configuration
│   │   ├── types.ts            # Shared type definitions
│   │   ├── backends/           # Backend implementations
│   │   │   ├── local-storage.ts # Local AsyncStorage backend
│   │   │   └── firebase.ts     # Firebase backend
│   │   ├── utils/              # Shared utilities
│   │   │   ├── task-serialization.ts # Task serialization helpers
│   │   │   └── object-utils.ts # removeUndefined utility
│   │   └── README.md           # Backend documentation
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
├── packages/                    # Reusable npm packages
│   ├── account/                # @spezivibe/account package
│   │   ├── src/
│   │   │   ├── types.ts        # User, AccountService interfaces
│   │   │   ├── services/       # Firebase & Local implementations
│   │   │   ├── providers/      # AccountProvider & useAccount hook
│   │   │   ├── components/     # SignInForm, RegisterForm, etc.
│   │   │   └── __tests__/      # Test suite (111 tests)
│   │   └── README.md           # Account module documentation
│   └── questionnaire/          # @spezivibe/questionnaire package
│       ├── src/
│       │   ├── types.ts        # FHIR-compatible questionnaire types
│       │   └── index.ts        # Module exports
│       └── README.md           # Questionnaire module documentation
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

**Pattern**: File-based routing with Expo Router + declarative redirects

**Route Groups**:
- `(onboarding)` - Sequential flow, no tabs
- `(tabs)` - Main app with bottom navigation
- `questionnaire` - Modal presentation

**Navigation Guards** (app/_layout.tsx):
The root layout uses declarative `<Redirect />` components to control navigation based on authentication and onboarding state. This follows the official Expo Router pattern for authentication flows.

```typescript
function RootLayoutNav() {
  const { signedIn, isLoading: authLoading } = useAccount();
  const onboardingComplete = useOnboardingStatus();
  const segments = useSegments();

  // LOADING: Wait for auth and onboarding status to load
  if (onboardingComplete === null || authLoading) {
    return null; // Show nothing while loading (splash screen visible)
  }

  // Determine current location
  const inAuthFlow = segments[0] === '(onboarding)';

  // GUARD 1: Redirect to onboarding if not completed
  if (!onboardingComplete && !inAuthFlow) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  // GUARD 2: Redirect to sign-in if onboarding done but not authenticated
  if (onboardingComplete && !signedIn && !inAuthFlow) {
    return <Redirect href="/(onboarding)/sign-in" />;
  }

  // GUARD 3: Redirect authenticated users away from auth screens
  if (signedIn && inAuthFlow) {
    return <Redirect href="/(tabs)" />;
  }

  // RENDER: All guards passed, render the navigation stack
  return <Stack>...</Stack>;
}
```

**Benefits of This Pattern**:
- **Declarative**: Uses React components instead of imperative navigation
- **Self-documenting**: Clear sequence of guards in top-to-bottom order
- **Standard Expo Router pattern**: Follows official documentation
- **No redirect loops**: Redirect component handles timing automatically
- **Easy to modify**: Adding a new guard is straightforward
- **LLM-friendly**: All logic visible in one place

**Imperative Navigation** (for user actions):
```typescript
// Push to modal from user action
router.push({
  pathname: '/questionnaire/[id]',
  params: { id: 'wellness-checkin' }
});
```

### 4. State Management

**Pattern**: Standard + React Context with Production Patterns

**Global State**:
- `StandardContext` - Backend service and initialization (root level)
- `SchedulerContext` - Tasks and outcomes (depends on Standard)
- `AuthContext` - Authentication state (depends on Standard)
- Theme - via `useColorScheme()` hook
- Navigation - managed by Expo Router

**Production-Ready Patterns**:
- **Memoization**: All context values use `useMemo` to prevent re-renders
- **Stable Callbacks**: Functions wrapped in `useCallback` for performance
- **Cancellation Tokens**: `let cancelled = false` pattern prevents setState after unmount
- **No Early Returns**: Providers render children during loading for coordinated init
- **Error States**: All contexts expose error with retry mechanisms

**Local State**:
- Component state with `useState`
- Side effects with `useEffect`
- Proper cleanup with return functions
- Refs for navigation guards (`useRef`)

**Persistence**:
```typescript
// App-wide constants (lib/constants.ts)
export const ONBOARDING_COMPLETED_KEY = '@onboarding_completed';

// Backend storage keys
const STORAGE_KEYS = {
  SCHEDULER: '@scheduler_state',
  RESPONSES: '@questionnaire_responses',
};
```

**Backend Abstraction**:
- All data operations go through Standard's backend
- BackendService handles data storage only (no authentication)
- AccountService handles authentication only (no data storage)
- Standard coordinates between them via user ID sync
- Switch backends without changing application code
- Supports local storage and Firebase out of the box

## Design Patterns

### 1. Standard Pattern (Spezi-Inspired)
Central orchestrator for data flow with automatic user ID synchronization:
```typescript
export function StandardProvider({ children }) {
  const [backend, setBackend] = useState<BackendService | null>(null);
  const [accountService, setAccountService] = useState<AccountService | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false; // Cancellation token

    async function initializeStandard() {
      try {
        const config = await getBackendConfig();
        const backendInstance = BackendFactory.createBackend(config);
        const accountServiceInstance = AccountServiceFactory.createAccountService(config);

        await Promise.all([
          backendInstance.initialize(),
          accountServiceInstance.initialize(),
        ]);

        if (cancelled) return; // Check before setState

        setBackend(backendInstance);
        setAccountService(accountServiceInstance);
      } catch (err) {
        if (!cancelled) setError(err);
      }
    }

    initializeStandard();
    return () => { cancelled = true }; // Cleanup
  }, []);

  // Sync user ID from account service to backend
  useEffect(() => {
    if (!backend || !accountService) return;

    const unsubscribe = accountService.onAuthStateChanged((user) => {
      backend.setUserId(user?.uid || null);
    });

    return unsubscribe;
  }, [backend, accountService]);

  // Memoize to prevent re-renders
  const value = useMemo(
    () => ({ backend, accountService, error, retry }),
    [backend, accountService, error]
  );

  return <StandardContext.Provider value={value}>{children}</StandardContext.Provider>;
}
```

### 2. Provider Pattern with Performance Optimization
Used for all global state:
```typescript
export function SchedulerProvider({ children }) {
  const { backend } = useStandard(); // Consume Standard
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    async function init() {
      // ... initialization
      if (cancelled) return;
      unsubscribe = scheduler.subscribe(() => setTasks(...));
    }

    init();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [backend]);

  // Memoize value and callbacks
  const value = useMemo(
    () => ({ scheduler, tasks, refreshTasks }),
    [scheduler, tasks]
  );

  return <SchedulerContext.Provider value={value}>{children}</SchedulerContext.Provider>;
}
```

### 3. Themed Components
For dark mode support:
```typescript
export function ThemedView({ style, ...props }: ViewProps) {
  const backgroundColor = useThemeColor({}, 'background');
  return <View style={[{ backgroundColor }, style]} {...props} />;
}
```

### 4. Dynamic Forms
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

### 5. Type-Safe Routing
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

### Code Quality

1. **Type Safety**: Use TypeScript strictly, avoid `any`
2. **Modularity**: Keep business logic in `lib/`, UI in `components/`
3. **Consistency**: Follow established patterns (Standard, Context, themed components)
4. **AI-Friendly**: Write clear, well-structured code with descriptive names
5. **Documentation**: Keep docs updated with architectural changes

### Performance

1. **Memoization**: Always use `useMemo` for context values
2. **Stable Callbacks**: Wrap functions in `useCallback` when passed to contexts
3. **Avoid Early Returns**: Providers should render children during loading
4. **Lazy Initialization**: Use `useEffect` for async initialization

### React Patterns

1. **Cancellation Tokens**: Use `let cancelled = false` pattern in effects with async
2. **Cleanup Functions**: Always return cleanup from `useEffect`
3. **Navigation Guards**: Use declarative `<Redirect />` components in layouts for auth flows
4. **Error Boundaries**: Expose error states for UI error handling

### Data Management

1. **Standard for Data**: All data operations go through Standard's backend
2. **Backend Abstraction**: Never directly import `AsyncStorage` or Firebase in business logic
3. **Background Sync**: Don't block UX waiting for sync operations
4. **Validation**: Use Yup schemas for all form validation

### UI/UX

1. **Loading States**: Show loading overlays during async operations
2. **Theming**: Always support dark mode with themed components
3. **Navigation**: Use declarative `<Redirect />` for guards, `router` for user actions
4. **Accessibility**: Consider screen readers and accessibility

## Common Pitfalls

1. **Forgetting cancellation tokens**: Always use `let cancelled = false` in async effects
2. **Missing cleanup**: Return cleanup functions from all effects with subscriptions
3. **Unmemoized context values**: Always wrap context values in `useMemo`
4. **Missing callback deps**: Include all used variables in `useCallback` dependencies
5. **Imperative navigation guards**: Use declarative `<Redirect />` in layouts, not `router.replace()` in effects
6. **Early provider returns**: Don't return `null` from providers during loading
7. **AsyncStorage is async**: Always `await` operations
8. **Date serialization**: Convert dates to/from ISO strings when persisting
9. **Direct backend access**: Always use Standard, never import backends directly
10. **Blocking sync**: Run sync operations in background, don't block user actions
11. **Authentication in backend**: Never add auth methods to BackendService - use AccountService
12. **Duplicating constants**: Always import from lib/constants.ts instead of defining inline
13. **Manual user ID sync**: Let Standard handle user ID sync automatically

## Testing Strategy

**Current State**: No automated tests (template project)

**Recommended Testing**:
1. **Manual**: Test dark mode, all user flows
2. **Exploratory**: Use test questionnaires in Explore tab
3. **Reset Functions**: Use reset buttons to clear state
4. **Device Testing**: Test on iOS and Android

**Future**: Add Jest + React Native Testing Library for unit/integration tests
