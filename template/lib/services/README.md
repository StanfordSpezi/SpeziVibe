# Backend Services Module

This module implements the **Standard pattern** from Stanford Spezi, providing centralized data orchestration with pluggable backend support.

## Overview

The **Standard** (`standard-context.tsx`) is the central orchestrator that:
- Initializes and provides the backend service to all modules
- Manages application-wide data flow
- Handles initialization order and error states
- Exposes retry mechanism for failed initialization

## Architecture

```
┌─────────────────────────────────────────┐
│           Application Layer             │
│      (Scheduler, Questionnaires)        │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│           Standard Context              │
│  Provides: backend, backendType, error  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         LocalStorage Backend            │
│           (AsyncStorage)                │
└─────────────────────────────────────────┘
```

## Usage

### Basic Setup

The Standard is configured at the root of your application:

```typescript
// app/_layout.tsx
import { StandardProvider } from '@/lib/services/standard-context';

export default function RootLayout() {
  return (
    <StandardProvider>
      {/* Your app content */}
    </StandardProvider>
  );
}
```

### Using the Standard

Access the backend from any component:

```typescript
import { useStandard } from '@/lib/services/standard-context';

function MyComponent() {
  const { backend, backendType, isLoading, error, retry } = useStandard();

  if (isLoading) return <ActivityIndicator />;
  if (error) return <ErrorScreen error={error} onRetry={retry} />;

  // Use backend for data operations
  return <YourUI />;
}
```

## Local Storage Backend

The default backend stores all data locally using AsyncStorage.

**Use Cases:**
- Offline-only apps
- Privacy-sensitive applications
- Development and testing
- No backend setup required

## Adding Firebase Support

To add cloud storage and authentication, regenerate your app with Firebase:

```bash
npx create-spezivibe-app my-app
# Select "Firebase" as the backend
```

This adds:
- Firebase authentication via `@spezivibe/account`
- Firestore data storage
- User ID synchronization between auth and storage

## API Reference

### StandardContextValue

```typescript
interface StandardContextValue {
  backend: BackendService | null;  // The backend service instance
  backendType: BackendType | null; // 'local' or 'firebase'
  isLoading: boolean;              // True during initialization
  error: Error | null;             // Initialization error if any
  retry: () => void;               // Retry initialization
}
```

### BackendService Interface

```typescript
interface BackendService {
  initialize(): Promise<void>;
  setUserId(userId: string | null): void;

  // Scheduler operations
  loadSchedulerState(): Promise<SchedulerState | null>;
  saveSchedulerState(state: SchedulerState): Promise<void>;

  // Task operations
  createTask(task: Task): Promise<Task>;
  updateTask(task: Task): Promise<Task>;
  deleteTask(taskId: string): Promise<void>;
  getTasks(): Promise<Task[]>;

  // Outcome operations
  createOutcome(outcome: Outcome): Promise<Outcome>;
  getOutcomes(): Promise<Outcome[]>;

  // Questionnaire responses
  saveQuestionnaireResponse(response: QuestionnaireResponse): Promise<void>;
  getQuestionnaireResponses(taskId?: string): Promise<QuestionnaireResponse[]>;
}
```

## Best Practices

1. **Use the Standard** - Never import backends directly
2. **Handle Loading** - Show appropriate UI during initialization
3. **Handle Errors** - Provide retry mechanism for users
4. **Memoization** - Context values are memoized to prevent re-renders

## Files

| File | Purpose |
|------|---------|
| `standard-context.tsx` | Standard provider and hook |
| `backend-factory.ts` | Creates backend based on config |
| `config.ts` | Backend configuration |
| `types.ts` | TypeScript interfaces |
| `backends/local-storage.ts` | AsyncStorage implementation |
