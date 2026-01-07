# SpeziVibe Architecture

## Overview

SpeziVibe is a React Native + Expo template for digital health applications. It follows the **Standard pattern** from [Stanford Spezi](https://github.com/StanfordSpezi) and implements production-ready React patterns optimized for rapid prototyping and AI-assisted development.

## Tech Stack

- **React Native 0.81** - Cross-platform mobile framework
- **Expo 54** - Development platform and tooling
- **TypeScript 5.9** - Type-safe JavaScript
- **Expo Router** - File-based navigation system
- **Formik + Yup** - Form state and validation
- **AsyncStorage** - Local data persistence
- **AI SDK** - LLM integration for chat features

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
┌──────────┴───────────┐   ┌────────────────────┐   ┌────────────────────┐
│  LocalStorage        │   │    Firebase        │   │    Medplum         │
│  Backend             │   │    Backend         │   │    Backend         │
│  (AsyncStorage)      │   │    (Firestore)     │   │    (FHIR R4)       │
└──────────────────────┘   └────────────────────┘   └────────────────────┘
```

**Separation of Concerns**:
- **AccountService**: Handles ALL authentication and profile management
- **BackendService**: Handles ONLY data storage (tasks, outcomes, questionnaires)
- **Standard**: Coordinates by syncing user ID from AccountService to BackendService
- **No Overlap**: Authentication never touches backend; backend never handles auth

## Project Structure

```
spezivibe/
├── cli/                          # create-spezivibe-app CLI tool
│   ├── src/
│   │   ├── index.ts              # CLI entry point with prompts
│   │   ├── generator.ts          # Project generation orchestrator
│   │   ├── prompts.ts            # Interactive prompts (Inquirer)
│   │   ├── config.ts             # Backend discovery, feature configuration
│   │   ├── types.ts              # TypeScript definitions
│   │   └── utils.ts              # Dependency checking, verification
│   └── tests/snapshot/           # Snapshot tests (30 tests)
├── packages/                     # @spezivibe/* npm packages
│   ├── account/                  # Authentication & account management (122 tests)
│   ├── chat/                     # LLM chat with AI SDK (44 tests)
│   ├── firebase/                 # Firebase backend implementation (47 tests)
│   ├── medplum/                  # Medplum FHIR R4 backend implementation
│   ├── onboarding/               # Onboarding flow components (46 tests)
│   ├── questionnaire/            # FHIR R4 questionnaires (111 tests)
│   └── scheduler/                # Task scheduling system (23 tests)
├── template/                     # Base app template (copied to new projects)
│   ├── app/                      # Expo Router pages
│   │   ├── (tabs)/               # Main app tabs
│   │   └── _layout.tsx           # Root layout with providers
│   ├── components/               # Minimal UI components (ThemedView, ThemedText, etc.)
│   ├── hooks/                    # Shared React hooks
│   ├── lib/                      # Business logic modules
│   │   ├── services/             # Backend services & Standard
│   │   └── constants.ts          # App-wide constants
│   └── constants/                # Theme configuration
├── features/                     # Feature configs for CLI generation
│   ├── onboarding/               # Onboarding feature files
│   │   ├── manifest.json         # Feature manifest with transforms
│   │   └── app/                  # App files to merge
│   ├── firebase/                 # Firebase backend feature
│   ├── chat/                     # Chat feature
│   ├── scheduler/                # Scheduler feature
│   └── questionnaire/            # Questionnaire feature
├── ARCHITECTURE.md               # This file
├── CONTRIBUTING.md               # Contribution guidelines
└── package.json                  # Workspace configuration
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `cli/` | CLI tool source code and tests |
| `packages/` | Reusable npm packages with full test coverage |
| `template/` | Base template copied to new projects |
| `features/` | Feature-specific files merged during generation |

## CLI Plugin System

### Plugin-Based Backend Discovery

The CLI uses a **plugin architecture** where backends are discovered automatically from feature manifests. Any feature with `category: "backend"` is offered as a backend option:

```json
// features/firebase/manifest.json
{
  "name": "firebase",
  "category": "backend",
  "description": "Cloud auth + storage with Firebase",
  "autoIncludes": ["onboarding"],
  "corePackages": ["account"],
  "dependencies": { "firebase": "^12.7.0" },
  "scripts": { "emulators": "firebase emulators:start" },
  "copyFiles": ["firebase.json", ".firebaserc", "firestore.rules"],
  "envVars": { "EXPO_PUBLIC_FIREBASE_API_KEY": "" }
}
```

**Adding a new backend requires no CLI code changes** - just create a feature directory.

### Feature Manifest Schema

| Field | Type | Purpose |
|-------|------|---------|
| `name` | string | Feature identifier |
| `description` | string | Human-readable description |
| `category` | `"backend"` \| `"feature"` | Backend plugins vs regular features |
| `autoIncludes` | string[] | Features to auto-add when selected |
| `corePackages` | string[] | Packages to copy before other features |
| `dependencies` | Record<string, string> | NPM dependencies |
| `scripts` | Record<string, string> | NPM scripts to add |
| `workspaces` | string[] | Workspace paths to add |
| `copyDirs` | string[] | Directories to copy |
| `copyFiles` | string[] | Files to copy (won't overwrite) |
| `replaceFiles` | string[] | Files to replace (will overwrite) |
| `transforms` | CodeTransform[] | Code injection transforms |
| `envVars` | Record<string, string> | Environment variables (empty = prompt user) |

### Backend-Specific Files

Features can provide different file versions for different backends:

```
features/scheduler/
├── app/(tabs)/schedule.tsx           # Default (local backend)
├── app/(tabs)/schedule.firebase.tsx  # Used when Firebase is selected
```

The generator picks `file.{backend}.tsx` when that backend is selected, falling back to `file.tsx` otherwise.

### Firebase Emulator Mode

When Firebase is selected without credentials, the app automatically uses demo values and connects to the Firebase Emulator:

```typescript
// features/firebase/lib/services/config.ts
const shouldUseEmulator = __DEV__ && !extra.firebase?.apiKey;

const FIREBASE_CONFIG = {
  apiKey: extra.firebase?.apiKey || (shouldUseEmulator ? 'demo-api-key' : ''),
  projectId: extra.firebase?.projectId || (shouldUseEmulator ? 'demo-project' : ''),
  useEmulator: shouldUseEmulator,
  // ...
};
```

This allows developers to start building immediately without Firebase console setup.

### Medplum Backend Mode

When Medplum is selected as the backend, the app uses FHIR R4 resources for data storage:

| SpeziVibe Data | FHIR Resource |
|----------------|---------------|
| Users | Patient |
| Tasks | Task |
| Outcomes | Observation |
| Questionnaire Responses | QuestionnaireResponse |
| Consent | Consent |

**Configuration** (`features/medplum/lib/services/config.ts`):
```typescript
export function getBackendConfig(): BackendConfig {
  const baseUrl = Constants.expoConfig?.extra?.medplum?.baseUrl;
  const clientId = Constants.expoConfig?.extra?.medplum?.clientId;
  const projectId = Constants.expoConfig?.extra?.medplum?.projectId;

  // Validate required configuration
  if (!baseUrl || !clientId || !projectId) {
    throw new Error('Medplum configuration missing. Check .env file.');
  }

  return {
    type: 'medplum',
    medplum: { baseUrl, clientId, projectId },
  };
}
```

**FHIR Compliance**: The Medplum backend follows FHIR R4 specifications including:
- Task resources with `intent: 'order'` for executable tasks
- Identifier fields on all resources for searchability
- Paginated search queries handling large result sets
- Standard FHIR Timing for schedules

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
  createdAt: Date;               // Creation timestamp
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
1. Add to `TaskCategory` union in `packages/scheduler/src/types.ts`
2. Update icon mapping in `schedule.tsx`
3. Add to `packages/scheduler/src/sample-tasks.ts`

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

**Current State**: 478 tests across 26 test suites

### Test Distribution

| Package | Tests | Description |
|---------|-------|-------------|
| `@spezivibe/account` | 122 | Authentication, profile management, InMemoryAccountService |
| `@spezivibe/questionnaire` | 111 | FHIR R4 parsing, form validation, response handling |
| `@spezivibe/firebase` | 47 | Firebase backend implementation, sync, error handling |
| `@spezivibe/onboarding` | 46 | Onboarding flow, consent, feature screens |
| `@spezivibe/chat` | 44 | AI SDK integration, message handling, providers |
| `cli` | 30 | Snapshot tests for project generation |
| `@spezivibe/scheduler` | 23 | Task scheduling, recurrence, occurrences |
| `@spezivibe/medplum` | 55 | FHIR R4 resource mapping, consent management |

### Running Tests

```bash
# Run all tests across all workspaces
npm test

# Run tests for a specific package
npm test --workspace=@spezivibe/account

# Run CLI snapshot tests
npm test --workspace=create-spezivibe-app

# Update CLI snapshots after intentional changes
npm run test:update --workspace=create-spezivibe-app
```

### Testing Patterns

1. **Package Tests**: Each package in `packages/` has comprehensive unit tests using Jest and React Native Testing Library
2. **CLI Snapshot Tests**: The CLI tool uses snapshot testing to catch regressions in generated project structure
3. **InMemoryAccountService**: Used for testing authentication flows without Firebase

### Manual Testing

1. **Device Testing**: Test on iOS and Android simulators/devices
2. **Dark Mode**: Verify theming works in both light and dark modes
3. **User Flows**: Test onboarding, authentication, and feature workflows
4. **Generated Apps**: Run `npm test` in generated projects to verify they work
