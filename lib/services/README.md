# Backend Services Module

This module implements the **Standard pattern** from Stanford Spezi, providing centralized data orchestration and pluggable backend support.

## The Standard Pattern

The **Standard** (`standard-context.tsx`) is the central orchestrator that:
- Initializes and provides the backend service to all modules
- Manages application-wide data flow
- Handles initialization order and error states
- Exposes retry mechanism for failed initialization

Think of the Standard as the "kernel" of your application's data layer.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│              (Scheduler, Auth, Questionnaires)              │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼ useStandard()
┌─────────────────────────────────────────────────────────────┐
│                   Standard Context                           │
│     (Centralized orchestrator for data flow)                │
│     Provides: backend, backendType, error, retry            │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   BackendService Interface                   │
│     (Common API for all backend implementations)            │
└───────────────────────────┬─────────────────────────────────┘
                            │
          ┌─────────────────┴─────────────────┐
          │                                   │
          ▼                                   ▼
┌──────────────────┐              ┌──────────────────┐
│  LocalStorage    │              │    Firebase      │
│    Backend       │              │    Backend       │
└──────────────────┘              └──────────────────┘
```

## Features

- **Pluggable Architecture**: Switch backends without code changes
- **Type-Safe**: Full TypeScript support across all implementations
- **Offline-First**: Local storage as default with optional cloud sync
- **Authentication**: Built-in support for remote backend authentication
- **Data Persistence**: Consistent API for tasks, outcomes, and questionnaire responses

## Available Backends

### 1. Local Storage Backend (Default)

Stores all data locally on the device using AsyncStorage. No authentication required.

**Use Cases:**
- Offline-only apps
- Privacy-sensitive applications
- Development and testing
- No backend setup required

**Configuration:**
```typescript
const config: BackendConfig = {
  type: 'local'
};
```

### 2. Firebase Backend

Uses Firebase Authentication and Firestore for real-time cloud sync.

**Use Cases:**
- Real-time data synchronization
- Multi-device access
- Cloud backup
- Easy to set up and scale

**Setup:**

1. Install Firebase dependencies:
```bash
npm install firebase
```

2. Create a Firebase project at https://console.firebase.google.com

3. Enable Authentication (Email/Password) and Firestore

4. Get your configuration from Project Settings

5. Configure the backend:
```typescript
const config: BackendConfig = {
  type: 'firebase',
  firebase: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'your-app.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-app.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abc123',
  }
};
```

**Firestore Data Structure:**
```
users/
  {userId}/
    tasks/
      {taskId}/
        - id, title, instructions, schedule, etc.
    outcomes/
      {outcomeId}/
        - id, completedAt, data
    questionnaire-responses/
      {responseId}/
        - questionnaireId, taskId, answers, completedAt
```

## Usage

### Basic Setup

The Standard is configured at the root of your application. All modules access it via the `useStandard()` hook.

```typescript
// In your app root (_layout.tsx)
import { StandardProvider } from '@/lib/services/standard-context';
import { SchedulerProvider } from '@/lib/scheduler/context';
import { AuthProvider } from '@/lib/services/auth-context';

export default function RootLayout() {
  return (
    <StandardProvider>
      <SchedulerProvider>
        <AuthProvider>
          {/* Your app content */}
        </AuthProvider>
      </SchedulerProvider>
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

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={retry} />;
  }

  // Use backend for data operations
  const isLocal = backendType === 'local';

  return <YourUI />;
}
```

### Configuring Backends

#### Option 1: Environment Variables (Recommended)

1. Copy `.env.example` to `.env`
2. Set your backend type and Firebase credentials:

```bash
EXPO_PUBLIC_BACKEND_TYPE=firebase

EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

3. Restart the development server

#### Option 2: Configure in Code

Edit `lib/services/config.ts` and set your Firebase credentials directly:

```typescript
const FIREBASE_CONFIG = {
  apiKey: 'your-api-key',
  authDomain: 'your-app.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-app.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abc123',
};
```

Then update the backend type in the same file.

### Authentication (Remote Backends)

Use the `AuthProvider` for authentication:

```typescript
import { useAuth } from '@/lib/services/auth-context';

function LoginScreen() {
  const { login, register, isAuthenticated, isLoading, error } = useAuth();

  async function handleLogin(email: string, password: string) {
    try {
      await login(email, password);
      // Auth successful, sync happens automatically in background
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Login Failed', err.message);
    }
  }

  return (
    // Your login UI
  );
}
```

The `AuthProvider` automatically:
- Checks authentication status on app start
- Syncs data in background (doesn't block UX)
- Manages authentication state
- Provides stable memoized callbacks

## API Reference

### BackendService Interface

All backends implement this interface:

```typescript
interface BackendService {
  // Initialization
  initialize(): Promise<void>;

  // Authentication
  isAuthenticated(): Promise<boolean>;
  login(credentials: any): Promise<void>;
  logout(): Promise<void>;

  // Scheduler State
  loadSchedulerState(): Promise<SchedulerState | null>;
  saveSchedulerState(state: SchedulerState): Promise<void>;

  // Task Operations
  createTask(task: Task): Promise<Task>;
  updateTask(task: Task): Promise<Task>;
  deleteTask(taskId: string): Promise<void>;
  getTasks(): Promise<Task[]>;

  // Outcome Operations
  createOutcome(outcome: Outcome): Promise<Outcome>;
  getOutcomes(): Promise<Outcome[]>;

  // Questionnaire Responses
  saveQuestionnaireResponse(response: QuestionnaireResponse): Promise<void>;
  getQuestionnaireResponses(taskId?: string): Promise<QuestionnaireResponse[]>;

  // Sync Operations
  syncToRemote(): Promise<void>;
  syncFromRemote(): Promise<void>;
}
```

## Adding a New Backend

To add support for a new backend (e.g., Supabase, AWS, custom API):

1. **Create backend implementation:**
   ```typescript
   // lib/services/backends/my-backend.ts
   export class MyBackend implements BackendService {
     async initialize(): Promise<void> { /* ... */ }
     async loadSchedulerState(): Promise<SchedulerState | null> { /* ... */ }
     // Implement all other methods
   }
   ```

2. **Update BackendType:**
   ```typescript
   // lib/services/types.ts
   export type BackendType = 'local' | 'firebase' | 'my-backend';
   ```

3. **Update BackendConfig:**
   ```typescript
   export interface BackendConfig {
     type: BackendType;
     // ... other configs
     myBackend?: {
       apiUrl: string;
       apiKey: string;
     };
   }
   ```

4. **Update BackendFactory:**
   ```typescript
   // lib/services/backend-factory.ts
   case 'my-backend':
     return new MyBackend(config);
   ```

5. **Export from index:**
   ```typescript
   // lib/services/index.ts
   export { MyBackend } from './backends/my-backend';
   ```

## Production-Ready Patterns

### Standard Context Implementation

The Standard uses production-ready React patterns:

```typescript
export function StandardProvider({ children }) {
  const [backend, setBackend] = useState<BackendService | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false; // Cancellation token

    async function initializeStandard() {
      try {
        const config = await getBackendConfig();
        const backendInstance = BackendFactory.createBackend(config);
        await backendInstance.initialize();

        if (cancelled) return; // Prevent setState after unmount

        setBackend(backendInstance);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Init failed'));
        }
      }
    }

    initializeStandard();

    return () => {
      cancelled = true; // Cleanup
    };
  }, [retryCount]);

  // Memoize to prevent unnecessary re-renders
  const value = useMemo(
    () => ({ backend, backendType, isLoading, error, retry }),
    [backend, backendType, isLoading, error]
  );

  return <StandardContext.Provider value={value}>{children}</StandardContext.Provider>;
}
```

**Key Patterns Used:**
- ✅ Cancellation tokens prevent setState after unmount
- ✅ Proper cleanup in effect return function
- ✅ Memoized context value prevents re-renders
- ✅ Error state with retry mechanism
- ✅ No early returns - children render during loading

### Module Implementation Best Practices

When creating modules that use the Standard:

```typescript
export function YourModuleProvider({ children }) {
  const { backend, isLoading: backendLoading } = useStandard();

  useEffect(() => {
    // Wait for backend
    if (backendLoading || !backend) {
      return;
    }

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    async function init() {
      // Your initialization
      if (cancelled) return;

      // Set up subscriptions
      cleanup = yourModule.subscribe(...);
    }

    init();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [backend, backendLoading]);

  // Memoize callbacks
  const yourAction = useCallback(async () => {
    // Your action using backend
  }, [backend]);

  // Memoize context value
  const value = useMemo(
    () => ({ yourAction, yourState }),
    [yourAction, yourState]
  );

  return <YourContext.Provider value={value}>{children}</YourContext.Provider>;
}
```

## Best Practices

1. **Use the Standard**: Never import backends directly, always go through Standard
2. **Cancellation Tokens**: Use `let cancelled = false` in all async effects
3. **Memoization**: Always memoize context values and callbacks
4. **Error Handling**: Expose error states for UI error handling
5. **Background Operations**: Don't block UX waiting for sync operations
6. **Loading States**: Show appropriate loading UI during initialization
7. **Offline Support**: Local storage backend always works offline
8. **Security**: Never commit API keys or credentials to version control

## Troubleshooting

### "Not authenticated" errors
- Ensure you call `login()` before accessing remote backends
- Check that your credentials are correct
- Verify backend configuration

### Data not syncing
- Check network connectivity
- Verify authentication status with `isAuthenticated()`
- Call `syncFromRemote()` to manually trigger sync

### Local storage quota exceeded
- Implement data cleanup for old outcomes
- Consider moving to a cloud backend for larger datasets

## Examples

See the following files for implementation examples:
- `/lib/services/backends/local-storage.ts` - Simple AsyncStorage implementation
- `/lib/services/backends/firebase.ts` - Firestore with authentication

## Contributing

When adding new backends or features:
1. Maintain the `BackendService` interface contract
2. Add comprehensive error handling
3. Document configuration requirements
4. Include usage examples
5. Update this README

## License

Part of the SpeziVibe project. See root LICENSE file.
