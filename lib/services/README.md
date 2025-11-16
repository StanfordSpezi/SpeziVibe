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
           │   │   Standard Context          │
           │   │   (Orchestrator)            │
           │   │   Provides: backend,        │
           │   │   accountService, error     │
           │   └─────────────────────────────┘
           │
┌──────────┴───────────┐              ┌────────────────────┐
│  LocalStorage        │              │    Firebase        │
│  Backend             │              │    Backend         │
│  (AsyncStorage)      │              │    (Firestore)     │
└──────────────────────┘              └────────────────────┘
```

**Key Separation of Concerns:**
- **AccountService**: Handles ALL authentication and user profile management
- **BackendService**: Handles ONLY data storage (tasks, outcomes, questionnaires)
- **Standard**: Coordinates by automatically syncing user ID from AccountService to BackendService
- **No Overlap**: Authentication is completely separate from data storage

## Features

- **Pluggable Architecture**: Switch backends without code changes
- **Type-Safe**: Full TypeScript support across all implementations
- **Offline-First**: Local storage as default with optional cloud sync
- **Separation of Concerns**: Data storage completely separated from authentication
- **Data Persistence**: Consistent API for tasks, outcomes, and questionnaire responses
- **Automatic User Context**: Standard automatically syncs user ID to backend

## Available Backends

### 1. Local Storage Backend (Default)

Stores all scheduler data locally on the device using AsyncStorage. Does not handle authentication.

**Use Cases:**
- Offline-only apps
- Privacy-sensitive applications
- Development and testing
- No backend setup required

**Note**: Authentication is handled separately by AccountService (see @spezivibe/account package)

**Configuration:**
```typescript
const config: BackendConfig = {
  type: 'local'
};
```

### 2. Firebase Backend

Uses Firestore for real-time cloud data storage. Authentication is handled separately by FirebaseAccountService.

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

3. Enable Firestore database (Authentication is configured separately in AccountService)

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
import { AccountProvider } from '@spezivibe/account';

export default function RootLayout() {
  const { accountService } = useStandard();

  return (
    <StandardProvider>
      <SchedulerProvider>
        <AccountProvider accountService={accountService}>
          {/* Your app content */}
        </AccountProvider>
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

Use the `@spezivibe/account` package for authentication:

```typescript
import { useAccount } from '@spezivibe/account';
import { SignInForm } from '@spezivibe/account';

function LoginScreen() {
  const router = useRouter();

  return (
    <SignInForm
      onSuccess={() => {
        // Auth successful, sync happens automatically in background
        router.replace('/(tabs)');
      }}
      onError={(error) => {
        Alert.alert('Login Failed', error.message);
      }}
    />
  );
}
```

Or use the hook directly for custom UI:

```typescript
import { useAccount } from '@spezivibe/account';

function CustomLoginScreen() {
  const { login, isAuthenticated, isLoading, error } = useAccount();

  async function handleLogin(email: string, password: string) {
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Login Failed', err.message);
    }
  }

  return (
    // Your custom login UI
  );
}
```

The `AccountProvider` automatically:
- Checks authentication status on app start
- Syncs data in background (doesn't block UX)
- Manages authentication and user state
- Provides pre-built UI components (SignInForm, RegisterForm, AccountOverview)
- Supports profile management, password reset, and account operations

See `packages/account/README.md` for full documentation.

## API Reference

### BackendService Interface

All backends implement this interface for data storage only:

```typescript
interface BackendService {
  // Initialization
  initialize(): Promise<void>;

  // User Context (set by Standard automatically)
  setUserId(userId: string | null): void;

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

**Note**: Authentication methods (login, register, logout) are NOT part of BackendService.
Use AccountService from @spezivibe/account package for authentication.

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

The Standard uses production-ready React patterns and automatically syncs user ID:

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

        if (cancelled) return; // Prevent setState after unmount

        setBackend(backendInstance);
        setAccountService(accountServiceInstance);
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

  // Sync user ID from account service to backend
  useEffect(() => {
    if (!backend || !accountService) return;

    const unsubscribe = accountService.onAuthStateChanged((user) => {
      backend.setUserId(user?.uid || null);
    });

    return unsubscribe;
  }, [backend, accountService]);

  // Memoize to prevent unnecessary re-renders
  const value = useMemo(
    () => ({ backend, accountService, backendType, isLoading, error, retry }),
    [backend, accountService, backendType, isLoading, error]
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
- ✅ Automatic user ID synchronization between services
- ✅ Parallel initialization of backend and account service

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
2. **Separation of Concerns**: Use AccountService for auth, BackendService for data
3. **Let Standard Sync**: Don't manually sync user ID - Standard handles it automatically
4. **Cancellation Tokens**: Use `let cancelled = false` in all async effects
5. **Memoization**: Always memoize context values and callbacks
6. **Error Handling**: Expose error states for UI error handling
7. **Background Operations**: Don't block UX waiting for sync operations
8. **Loading States**: Show appropriate loading UI during initialization
9. **Offline Support**: Local storage backend always works offline
10. **Security**: Never commit API keys or credentials to version control
11. **No Auth in Backend**: Never add login/register/logout methods to BackendService

## Troubleshooting

### Data not syncing to Firebase
- Check network connectivity
- Verify user is authenticated via AccountService
- Check that user ID is being set correctly (Standard handles this automatically)
- Call `syncFromRemote()` to manually trigger sync

### Local storage quota exceeded
- Implement data cleanup for old outcomes
- Consider moving to a cloud backend for larger datasets

### Authentication issues
- See @spezivibe/account package documentation
- Authentication is completely separate from BackendService

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
