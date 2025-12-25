# @spezivibe/firebase

Firebase integration for SpeziVibe applications, providing Firebase-backed implementations of account management and backend services.

## Overview

This package provides Firebase implementations for the `@spezivibe/account` package, following the Stanford Spezi architecture pattern of separating core abstractions from specific backend implementations.

## Platform Support

| Platform | Status |
|----------|--------|
| iOS | ✅ Supported |
| Android | ✅ Supported |
| Web | ✅ Supported |

The package automatically detects the platform and uses the appropriate persistence mechanism:
- **iOS/Android**: Uses AsyncStorage via `@react-native-async-storage/async-storage`
- **Web**: Uses browser localStorage with IndexedDB fallback

## Features

- **FirebaseAccountService**: Firebase Authentication integration
  - Email/password authentication
  - User profile storage in Firestore
  - Password reset functionality
  - Account management (update email, password, delete account)
  - Proper resource cleanup with `cleanup()` method
  - Race condition prevention for async profile loading
  - **Cross-platform support (iOS, Android, Web)**
  - **Firebase Emulator support for local development**

## Installation

```bash
npm install @spezivibe/firebase firebase @spezivibe/account
```

## Quick Start with Firebase Emulator (Recommended for Development)

The Firebase Emulator provides a local development environment that doesn't require a Firebase project or internet connection.

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Initialize Firebase in your project

```bash
firebase init
```

Select:
- **Emulators** (required)
- **Authentication Emulator**
- **Firestore Emulator**

Accept the default ports (Auth: 9099, Firestore: 8080) or customize them.

### 3. Start the emulators

```bash
firebase emulators:start
```

You should see output like:
```
✔  All emulators ready! View status and logs at http://localhost:4000
```

### 4. Configure your app to use emulators

```typescript
import { FirebaseAccountService } from '@spezivibe/firebase';
import { AccountProvider } from '@spezivibe/account';

// Use emulator for local development
const accountService = new FirebaseAccountService({
  apiKey: 'demo-api-key',
  authDomain: 'demo-project.firebaseapp.com',
  projectId: 'demo-project',
  storageBucket: 'demo-project.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:demo',
  useEmulator: true, // 👈 Enable emulator mode
});

function App() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    accountService.initialize().then(() => setInitialized(true));
  }, []);

  if (!initialized) return <ActivityIndicator />;

  return (
    <AccountProvider accountService={accountService}>
      <YourApp />
    </AccountProvider>
  );
}
```

### 5. Access the Emulator UI

Open http://localhost:4000 to view the Firebase Emulator Suite UI where you can:
- View and manage users in Authentication
- Browse Firestore data
- View logs and requests

## Production Setup

For production, create a real Firebase project:

### 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication with Email/Password provider
4. Enable Firestore database

### 2. Get your configuration

In Firebase Console:
1. Go to Project Settings
2. Under "Your apps", click "Add app" and select Web
3. Copy the configuration object

### 3. Configure your app

```typescript
import { FirebaseAccountService } from '@spezivibe/firebase';

const accountService = new FirebaseAccountService({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  // useEmulator: false (default)
});
```

### 4. Set up Firestore security rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/profile/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Configuration Options

### FirebaseConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `apiKey` | string | Yes | Firebase API key |
| `authDomain` | string | Yes | Firebase auth domain |
| `projectId` | string | Yes | Firebase project ID |
| `storageBucket` | string | Yes | Firebase storage bucket |
| `messagingSenderId` | string | Yes | Firebase messaging sender ID |
| `appId` | string | Yes | Firebase app ID |
| `useEmulator` | boolean | No | Enable emulator mode (default: false) |
| `emulatorConfig` | object | No | Custom emulator configuration |

### Custom Emulator Ports

If you're using non-default emulator ports:

```typescript
const accountService = new FirebaseAccountService({
  // ... firebase config
  useEmulator: true,
  emulatorConfig: {
    authHost: 'localhost',
    authPort: 9099,      // default
    firestoreHost: 'localhost',
    firestorePort: 8080, // default
  },
});
```

## Environment-based Configuration

Use environment variables to switch between emulator and production:

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

const accountService = new FirebaseAccountService({
  apiKey: process.env.FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.FIREBASE_APP_ID || '1:123:web:demo',
  useEmulator: isDevelopment,
});
```

## Architecture

This package follows the Stanford Spezi pattern:
- **@spezivibe/account**: Defines the `AccountService` interface
- **@spezivibe/firebase**: Provides Firebase-specific implementation

This separation allows applications to:
- Use different backends without changing application code
- Avoid Firebase dependencies if not needed
- Swap implementations easily (Firebase, emulator, local storage, custom backends)

## Data Storage

User profiles are stored in Firestore at:
```
users/{userId}/profile/data
```

## Troubleshooting

### Emulator connection issues

If you see "Could not reach Cloud Firestore backend":
1. Ensure emulators are running: `firebase emulators:start`
2. Check that `useEmulator: true` is set
3. Verify ports match your firebase.json configuration

### "Firebase App already initialized" error

Create the service instance outside your component:

```typescript
// ✅ Correct - single instance
const accountService = new FirebaseAccountService(config);

function App() {
  // ...
}

// ❌ Wrong - creates new instance on every render
function App() {
  const accountService = new FirebaseAccountService(config);
}
```

### React Native on Android with emulator

For Android emulator, use `10.0.2.2` instead of `localhost`:

```typescript
const accountService = new FirebaseAccountService({
  // ... config
  useEmulator: true,
  emulatorConfig: {
    authHost: '10.0.2.2',
    firestoreHost: '10.0.2.2',
  },
});
```

## Testing

### Unit Tests (Mocked)

Unit tests use mocked Firebase SDK for fast, isolated testing:

```bash
npm test
```

### Integration Tests (Emulator)

Integration tests use the Firebase Emulator for real end-to-end testing:

#### Option 1: Automatic (recommended for CI)

This starts the emulator, runs tests, and shuts down automatically:

```bash
npm run test:with-emulator
```

#### Option 2: Manual (recommended for development)

Start the emulator in one terminal:

```bash
npm run emulator:start
```

Run tests in another terminal:

```bash
npm run test:integration
```

Or watch mode for development:

```bash
npm run test:integration:watch
```

### Test Scripts

| Script | Description |
|--------|-------------|
| `npm test` | Run unit tests (mocked Firebase) |
| `npm run test:integration` | Run integration tests (requires emulator) |
| `npm run test:with-emulator` | Start emulator, run tests, stop emulator |
| `npm run emulator:start` | Start Firebase emulator |

## License

MIT
