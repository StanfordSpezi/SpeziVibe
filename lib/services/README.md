# Backend Services Module

This module provides an abstraction layer for different backend implementations, allowing SpeziVibe to use local storage or Firebase without changing the core business logic.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│              (Scheduler, Questionnaires, etc.)               │
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

The backend is automatically configured through the `SchedulerContext`. By default, it uses local storage.

```typescript
// In your app root (_layout.tsx)
import { SchedulerProvider } from '@/lib/scheduler/context';

export default function RootLayout() {
  return (
    <SchedulerProvider>
      {/* Your app content */}
    </SchedulerProvider>
  );
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

```typescript
import { useScheduler } from '@/lib/scheduler/context';

function LoginScreen() {
  const { scheduler } = useScheduler();

  async function handleLogin(email: string, password: string) {
    if (scheduler) {
      const backend = scheduler['backend']; // Access backend (requires type assertion in production)
      await backend.login({ email, password });

      // Backend will now sync data
      await backend.syncFromRemote();
    }
  }

  return (
    // Your login UI
  );
}
```

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

## Best Practices

1. **Error Handling**: Always wrap backend operations in try-catch blocks
2. **Loading States**: Show loading indicators during backend operations
3. **Offline Support**: Local storage backend always works offline
4. **Data Migration**: When switching backends, implement data migration logic
5. **Testing**: Test each backend implementation thoroughly
6. **Security**: Never commit API keys or credentials to version control

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
