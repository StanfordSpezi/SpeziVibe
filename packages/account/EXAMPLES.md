# @spezivibe/account - Usage Examples

Examples for using the account management module in React Native applications.

## Table of Contents

- [Basic Setup](#basic-setup)
- [Firebase Integration](#firebase-integration)
- [Local Development](#local-development)
- [Account Configuration](#account-configuration)
- [Custom Authentication Flows](#custom-authentication-flows)
- [Navigation Integration](#navigation-integration)
- [Custom Form Components](#custom-form-components)
- [Error Handling](#error-handling)
- [Advanced Patterns](#advanced-patterns)

## Basic Setup

### Minimal Example

```tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import {
  AccountProvider,
  InMemoryAccountService,
  useAccount,
} from '@spezivibe/account';

const accountService = new InMemoryAccountService();
accountService.initialize();

function App() {
  return (
    <AccountProvider accountService={accountService}>
      <HomeScreen />
    </AccountProvider>
  );
}

function HomeScreen() {
  const { signedIn, user, logout } = useAccount();

  return (
    <View>
      {signedIn ? (
        <>
          <Text>Welcome, {user?.email}!</Text>
          <Button title="Logout" onPress={logout} />
        </>
      ) : (
        <Text>Not logged in</Text>
      )}
    </View>
  );
}

export default App;
```

## Firebase Integration

### Complete Firebase Setup

```tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import {
  AccountProvider,
  FirebaseAccountService,
  SignInForm,
  RegisterForm,
} from '@spezivibe/account';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

function App() {
  const [accountService, setAccountService] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function initializeAccountService() {
      try {
        const service = new FirebaseAccountService(firebaseConfig);
        await service.initialize();
        setAccountService(service);
      } catch (error) {
        console.error('Failed to initialize account service:', error);
      } finally {
        setIsInitializing(false);
      }
    }

    initializeAccountService();
  }, []);

  if (isInitializing || !accountService) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AccountProvider
      accountService={accountService}
      onLogin={(user) => {
        console.log('User logged in:', user.uid);
      }}
      onLogout={() => {
        console.log('User logged out');
      }}
    >
      <Navigation />
    </AccountProvider>
  );
}

export default App;
```

## Local Development

### Switching Between Firebase and Local

```tsx
import {
  AccountService,
  FirebaseAccountService,
  InMemoryAccountService,
} from '@spezivibe/account';

const BACKEND_TYPE = process.env.EXPO_PUBLIC_BACKEND_TYPE || 'local';

async function createAccountService(): Promise<AccountService> {
  if (BACKEND_TYPE === 'firebase') {
    const firebaseService = new FirebaseAccountService({
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
    });
    await firebaseService.initialize();
    return firebaseService;
  }

  const inMemoryService = new InMemoryAccountService();
  await inMemoryService.initialize();
  return inMemoryService;
}

function App() {
  const [accountService, setAccountService] = useState(null);

  useEffect(() => {
    createAccountService().then(setAccountService);
  }, []);

  if (!accountService) return <LoadingScreen />;

  return (
    <AccountProvider accountService={accountService}>
      <YourApp />
    </AccountProvider>
  );
}
```

## Account Configuration

### Configuring Profile Fields

Control which profile fields to collect during registration and whether they're required:

```tsx
import React from 'react';
import {
  AccountProvider,
  FirebaseAccountService,
  AccountConfiguration,
} from '@spezivibe/account';

const configuration: AccountConfiguration = {
  // Fields to collect
  collects: ['name', 'dateOfBirth', 'sex'],

  // Required fields (must be subset of collects)
  required: ['name'],

  // Allow users to edit profile after creation
  allowsEditing: true,
};

function App() {
  return (
    <AccountProvider
      accountService={accountService}
      configuration={configuration}
    >
      <YourApp />
    </AccountProvider>
  );
}
```

### Example: Minimal Profile

Only collect name (required):

```tsx
const minimalConfig: AccountConfiguration = {
  collects: ['name'],
  required: ['name'],
  allowsEditing: true,
};

// RegisterForm will show:
// - Email field
// - Password fields
// - Name field (required, marked with *)
```

### Example: Health Research App

Collect demographic data for health research:

```tsx
const healthConfig: AccountConfiguration = {
  collects: ['name', 'dateOfBirth', 'sex'],
  required: ['name', 'dateOfBirth', 'sex'],
  allowsEditing: false, // Demographic data shouldn't change
};

// RegisterForm will show:
// - Email field
// - Password fields
// - Name field (required, marked with *)
// - Date of Birth picker (required, marked with *)
// - Sex dropdown (required, marked with *)
//
// AccountOverview won't show "Edit Profile" button
```

### Example: Social App

Collect optional profile information:

```tsx
const socialConfig: AccountConfiguration = {
  collects: ['name', 'biography', 'phoneNumber', 'profileImageUrl'],
  required: ['name'],
  allowsEditing: true,
};

// RegisterForm will show:
// - Email field
// - Password fields
// - Name field (required, marked with *)
// - Biography field (optional)
// - Phone number field (optional)
//
// Users can fill optional fields during registration or edit later
```

### Example: Read-Only Profile

Prevent profile editing after creation:

```tsx
const readOnlyConfig: AccountConfiguration = {
  collects: ['name', 'phoneNumber'],
  required: ['name', 'phoneNumber'],
  allowsEditing: false,
};

// Both name and phone are required during registration
// After creation, users cannot edit their profile
// AccountOverview hides the edit button
```

### Accessing Configuration in Components

The configuration is accessible via `useAccount()`:

```tsx
import { useAccount } from '@spezivibe/account';

function MyComponent() {
  const { configuration } = useAccount();

  const canEdit = configuration?.allowsEditing ?? true;
  const collectsPhone = configuration?.collects?.includes('phoneNumber') ?? false;

  return (
    <View>
      {canEdit && <Button title="Edit Profile" />}
      {collectsPhone && <Text>Phone: {user?.phoneNumber}</Text>}
    </View>
  );
}
```

## Custom Authentication Flows

### Building a Custom Login Screen

```tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAccount } from '@spezivibe/account';

function CustomLoginScreen({ navigation }) {
  const { login, isLoading, error, clearError } = useAccount();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      clearError();
      await login(email, password);
    } catch (err) {
      Alert.alert('Login Failed', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        title={isLoading ? 'Signing In...' : 'Sign In'}
        onPress={handleLogin}
        disabled={isLoading}
      />

      <Button
        title="Create Account"
        onPress={() => navigation.navigate('Register')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  error: {
    color: 'red',
    marginBottom: 12,
  },
});
```

## Navigation Integration

### With React Navigation

```tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAccount } from '@spezivibe/account';

const Stack = createNativeStackNavigator();

function Navigation() {
  const { signedIn, isLoading } = useAccount();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {signedIn ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### With Expo Router

```tsx
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAccount } from '@spezivibe/account';

function useProtectedRoute() {
  const { signedIn, isLoading } = useAccount();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!signedIn && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (signedIn && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [signedIn, isLoading, segments]);
}

function RootLayout() {
  useProtectedRoute();
  return <Slot />;
}
```

## Custom Form Components

### Styled Sign-In Form

```tsx
import { SignInForm } from '@spezivibe/account';
import { StyleSheet } from 'react-native';

function StyledLoginScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <SignInForm
        onSuccess={() => navigation.navigate('Home')}
        onError={(error) => Alert.alert('Error', error.message)}
        onRegisterPress={() => navigation.navigate('Register')}
        containerStyle={styles.formContainer}
        inputStyle={styles.input}
        buttonStyle={styles.button}
        buttonTextStyle={styles.buttonText}
        errorStyle={styles.error}
        buttonText="Log In"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    height: 56,
  },
  buttonText: {
    fontSize: 18,
  },
  error: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    color: '#c00',
  },
});
```

### Custom Register Form with Validation

```tsx
import { RegisterForm } from '@spezivibe/account';

function CustomRegisterScreen({ navigation }) {
  const handleError = (error: Error) => {
    if (error.message.includes('email-already-in-use')) {
      Alert.alert(
        'Email Already Used',
        'This email is already registered. Would you like to sign in instead?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Login') },
        ]
      );
    } else {
      Alert.alert('Registration Failed', error.message);
    }
  };

  return (
    <RegisterForm
      onSuccess={() => {
        Alert.alert(
          'Success',
          'Your account has been created',
          [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
        );
      }}
      onError={handleError}
      onSignInPress={() => navigation.navigate('Login')}
      minPasswordLength={8}
      buttonStyle={{ backgroundColor: '#34C759' }}
    />
  );
}
```

## Error Handling

### Comprehensive Error Handling

```tsx
function LoginWithErrorHandling() {
  const { login, error, clearError } = useAccount();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    clearError();

    if (!email || !password) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email');
      return;
    }

    try {
      await login(email, password);
    } catch (err: any) {
      console.error('Login error:', err);
    }
  };

  return (
    <View>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Dismiss" onPress={clearError} />
        </View>
      )}

      <Button title="Sign In" onPress={handleLogin} />
    </View>
  );
}
```

## Advanced Patterns

### Integrating with Backend Data Sync

```tsx
import { AccountProvider } from '@spezivibe/account';
import { useBackend } from './your-backend-service';

function App() {
  const accountService = useAccountService();
  const backend = useBackend();

  return (
    <AccountProvider
      accountService={accountService}
      onLogin={async (user) => {
        try {
          await backend.syncFromRemote();
        } catch (error) {
          console.warn('Background sync failed:', error);
        }
      }}
      onLogout={async () => {
        await backend.clearLocalData();
      }}
    >
      <Navigation />
    </AccountProvider>
  );
}
```

### Auth State Persistence

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccountService } from '@spezivibe/account';

class PersistentAccountService implements AccountService {
  constructor(private innerService: AccountService) {}

  async initialize() {
    await this.innerService.initialize();

    this.innerService.onAuthStateChanged((user) => {
      if (user) {
        AsyncStorage.setItem('@last_user_email', user.email || '');
      } else {
        AsyncStorage.removeItem('@last_user_email');
      }
    });
  }

  async login(credentials) {
    return this.innerService.login(credentials);
  }

  // Implement other methods...
}

const firebaseService = new FirebaseAccountService(config);
const persistentService = new PersistentAccountService(firebaseService);
await persistentService.initialize();
```

### Testing

```tsx
import { AccountService, User } from '@spezivibe/account';

class MockAccountService implements AccountService {
  private mockUser: User | null = null;
  private listeners: Array<(user: User | null) => void> = [];

  async initialize() {}

  async isAuthenticated() {
    return this.mockUser !== null;
  }

  async getCurrentUser() {
    return this.mockUser;
  }

  async login(credentials) {
    this.mockUser = {
      uid: 'test-user-id',
      email: credentials.email,
    };
    this.notifyListeners();
  }

  async logout() {
    this.mockUser = null;
    this.notifyListeners();
  }

  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    callback(this.mockUser);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.mockUser));
  }

  // Implement other methods...
}

describe('Login Flow', () => {
  it('should login successfully', async () => {
    const mockService = new MockAccountService();
    const { result } = renderHook(() => useAccount(), {
      wrapper: ({ children }) => (
        <AccountProvider accountService={mockService}>
          {children}
        </AccountProvider>
      ),
    });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.signedIn).toBe(true);
    expect(result.current.user?.email).toBe('test@example.com');
  });
});
```

## Performance Tips

1. Initialize account service instances at app startup
2. Memoize callbacks using `useCallback` for onLogin/onLogout handlers
3. Load auth UI components only when needed
4. Don't block login/logout on data sync operations
5. Wrap auth flows in error boundaries
