# @spezivibe/account

Account management module for React Native applications.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Key Concepts](#key-concepts)
- [Common Tasks](#common-tasks)
- [Core Features](#core-features)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Testing](#testing)
- [Architecture](#architecture)

## Features

- Storage-agnostic architecture - delegates storage to consuming applications
- Multiple backend support (Firebase Authentication, local development)
- Email/password authentication with password reset
- Profile management (name, date of birth, sex, phone, biography)
- Account configuration with `.requires()` and `.collects()` patterns
- Pre-built UI components (SignInForm, RegisterForm, PasswordResetForm, AccountOverview)
- TypeScript with comprehensive type definitions
- RFC 5322 email validation and strong password requirements
- Accessibility support (WCAG 2.1 Level AA compliant)
- Production-safe logging

## Installation

```bash
# Install the package
npm install @spezivibe/account

# Install peer dependencies
npm install react react-native

# For Firebase support (optional)
npm install firebase
```

## Quick Start

### 1. Set up the Account Service

```tsx
import { FirebaseAccountService } from '@spezivibe/firebase';
import { AccountProvider } from '@spezivibe/account';

const firebaseConfig = {
  apiKey: 'your-api-key',
  authDomain: 'your-auth-domain',
  projectId: 'your-project-id',
  storageBucket: 'your-storage-bucket',
  messagingSenderId: 'your-messaging-sender-id',
  appId: 'your-app-id',
};

const accountService = new FirebaseAccountService(firebaseConfig);
await accountService.initialize();
```

### 2. Wrap Your App with AccountProvider

```tsx
import { AccountProvider } from '@spezivibe/account';

function App() {
  return (
    <AccountProvider accountService={accountService}>
      <YourApp />
    </AccountProvider>
  );
}
```

### 3. Use the Account Hook

```tsx
import { useAccount } from '@spezivibe/account';

function ProfileScreen() {
  const { user, signedIn, logout } = useAccount();

  if (!signedIn) {
    return <Text>Please log in</Text>;
  }

  return (
    <View>
      <Text>Welcome, {user?.email}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
```

### 4. Use Pre-built Forms (Optional)

```tsx
import { SignInForm } from '@spezivibe/account';

function LoginScreen() {
  const navigation = useNavigation();

  return (
    <SignInForm
      onSuccess={() => navigation.navigate('Home')}
      onError={(error) => alert(error.message)}
      buttonStyle={{ backgroundColor: '#007AFF' }}
    />
  );
}
```

## Key Concepts

### Architecture Overview

The `@spezivibe/account` package follows a **provider-service architecture**:

1. **AccountService** (Interface): Defines how authentication works
   - You can swap implementations (Firebase, local, custom)
   - Handles: login, register, logout, profile updates, password reset

2. **AccountProvider** (React Component): Manages authentication state
   - Wraps your app to provide auth context
   - Connects to an AccountService
   - Exposes auth state and methods via useAccount hook

3. **Pre-built UI Components**: Optional ready-to-use forms
   - SignInForm, RegisterForm, PasswordResetForm, AccountOverview
   - Automatically connected to AccountProvider
   - Fully customizable styles

### Data Flow

```
User Action (e.g., login button)
  ↓
UI Component (SignInForm) or Custom Code using useAccount hook
  ↓
AccountProvider (manages state)
  ↓
AccountService (Firebase/Local implementation)
  ↓
Backend (Firebase Auth, etc.)
```

### When to Use What

**Use Firebase Account Service when:**
- You want production-ready authentication
- You need profile storage in Firestore
- You want password reset emails
- You're building a real app

**Use InMemory Account Service when:**
- Local development without Firebase setup
- Testing UI flows
- Demos or prototypes
- Offline-first apps

**Use pre-built forms when:**
- You want quick integration
- Standard auth UI is acceptable
- You want built-in validation

**Use useAccount hook directly when:**
- Building custom UI
- Need fine-grained control
- Integrating with existing forms

## Common Tasks

### Complete Example: Firebase Authentication Setup

```tsx
// App.tsx - Complete setup example
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AccountProvider, AccountConfiguration } from '@spezivibe/account';
import { FirebaseAccountService } from '@spezivibe/firebase';

// Step 1: Create Firebase service instance (do this once, outside component)
const firebaseConfig = {
  apiKey: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  authDomain: 'your-app.firebaseapp.com',
  projectId: 'your-app',
  storageBucket: 'your-app.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:xxxxx',
};

const accountService = new FirebaseAccountService(firebaseConfig);

// Step 2: Define account configuration
const accountConfig: AccountConfiguration = {
  collects: ['name', 'dateOfBirth', 'sex'],
  required: ['name'],
  allowsEditing: true,
};

// Step 3: Initialize service and wrap app
export default function App() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    accountService.initialize().then(() => setInitialized(true));
  }, []);

  if (!initialized) {
    return <ActivityIndicator />;
  }

  return (
    <AccountProvider
      accountService={accountService}
      configuration={accountConfig}
      onLogin={(user) => console.log('User logged in:', user.email)}
      onLogout={() => console.log('User logged out')}
    >
      <YourAppNavigator />
    </AccountProvider>
  );
}
```

### Task: Check If User Is Logged In

```tsx
import { useAccount } from '@spezivibe/account';

function HomeScreen() {
  const { signedIn, user, isLoading } = useAccount();

  // Always check isLoading first
  if (isLoading) {
    return <ActivityIndicator />;
  }

  // Then check signedIn status
  if (!signedIn) {
    return <Text>Please log in to continue</Text>;
  }

  // User is logged in, safe to access user object
  // Use formatPersonName utility to display the name
  return <Text>Welcome {user?.name?.givenName || user.email}</Text>;
}
```

### Task: Implement Login Screen

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SignInForm } from '@spezivibe/account';
import { useNavigation } from '@react-navigation/native';

function LoginScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <SignInForm
        onSuccess={() => {
          // User successfully logged in
          navigation.navigate('Home');
        }}
        onError={(error) => {
          // Handle error (already displayed in form)
          console.error('Login error:', error);
        }}
        onRegisterPress={() => {
          // Navigate to registration
          navigation.navigate('Register');
        }}
        // Customize appearance
        containerStyle={styles.form}
        buttonStyle={styles.button}
        buttonTextStyle={styles.buttonText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  form: { width: '100%' },
  button: { backgroundColor: '#007AFF', borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: 'bold' },
});
```

### Task: Create Custom Login Form

```tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { useAccount } from '@spezivibe/account';

function CustomLoginForm() {
  const { login, isLoading, error } = useAccount();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(email, password);
      // Success - user is now logged in
      // AccountProvider will update signedIn state automatically
    } catch (err) {
      // Error is also available in `error` from useAccount
      console.error(err);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <Button
        title={isLoading ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
        disabled={isLoading}
      />
    </View>
  );
}
```

### Task: Register New User with Profile

```tsx
import React, { useState } from 'react';
import { useAccount, Sex } from '@spezivibe/account';

function RegistrationForm() {
  const { register, isLoading } = useAccount();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date('2000-01-01'));
  const [sex, setSex] = useState<Sex>(Sex.PreferNotToState);

  const handleRegister = async () => {
    try {
      await register(email, password, {
        name: {
          givenName: firstName,
          familyName: lastName,
        },
        dateOfBirth,
        sex,
      });
      // Success - user is registered and logged in
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <View>
      {/* Email and password inputs */}
      <TextInput value={email} onChangeText={setEmail} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />

      {/* Profile fields - PersonName components */}
      <TextInput placeholder="First Name" value={firstName} onChangeText={setFirstName} />
      <TextInput placeholder="Last Name" value={lastName} onChangeText={setLastName} />

      {/* Date picker component would go here */}

      <Button title="Register" onPress={handleRegister} disabled={isLoading} />
    </View>
  );
}
```

### Task: Update User Profile

```tsx
import React, { useState, useEffect } from 'react';
import { useAccount } from '@spezivibe/account';

function EditProfileScreen() {
  const { user, updateProfile, isLoading } = useAccount();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [biography, setBiography] = useState('');

  // Load current values from PersonName
  useEffect(() => {
    if (user) {
      setFirstName(user.name?.givenName || '');
      setLastName(user.name?.familyName || '');
      setBiography(user.biography || '');
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateProfile({
        name: {
          givenName: firstName,
          familyName: lastName,
        },
        biography,
      });
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  return (
    <View>
      <TextInput placeholder="First Name" value={firstName} onChangeText={setFirstName} />
      <TextInput placeholder="Last Name" value={lastName} onChangeText={setLastName} />
      <TextInput value={biography} onChangeText={setBiography} multiline />
      <Button title="Save" onPress={handleSave} disabled={isLoading} />
    </View>
  );
}
```

### Task: Implement Password Reset Flow

```tsx
// ForgotPasswordScreen.tsx
import React from 'react';
import { View, Alert } from 'react-native';
import { PasswordResetForm } from '@spezivibe/account';
import { useNavigation } from '@react-navigation/native';

function ForgotPasswordScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ padding: 20 }}>
      <PasswordResetForm
        onSuccess={() => {
          Alert.alert(
            'Email Sent',
            'Check your email for password reset instructions',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }}
        onBackToLogin={() => navigation.goBack()}
      />
    </View>
  );
}
```

### Task: Protect Routes/Screens (Require Authentication)

```tsx
import { useAccount } from '@spezivibe/account';
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

function ProtectedScreen() {
  const { signedIn, isLoading } = useAccount();
  const navigation = useNavigation();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !signedIn) {
      navigation.navigate('Login');
    }
  }, [signedIn, isLoading, navigation]);

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (!signedIn) {
    return null; // Will redirect
  }

  return <YourProtectedContent />;
}
```

### Task: Listen to Authentication Events

```tsx
import { AccountProvider, AccountEvent } from '@spezivibe/account';

function App() {
  const handleAccountEvent = (event: AccountEvent) => {
    switch (event.type) {
      case 'login':
        console.log('User logged in:', event.user.email);
        // Track analytics, etc.
        break;
      case 'logout':
        console.log('User logged out');
        // Clear app state, etc.
        break;
      case 'update':
        console.log('User profile updated:', event.user);
        break;
      case 'delete':
        console.log('User account deleted');
        break;
    }
  };

  return (
    <AccountProvider
      accountService={accountService}
      onAccountEvent={handleAccountEvent}
    >
      <YourApp />
    </AccountProvider>
  );
}
```

## Core Features

### Password Reset

```tsx
import { PasswordResetForm, useAccount } from '@spezivibe/account';

// Using the form component
function ForgotPasswordScreen() {
  return (
    <PasswordResetForm
      onSuccess={() => alert('Check your email!')}
      onBackToLogin={() => navigation.navigate('Login')}
    />
  );
}

// Or use the hook directly
function CustomResetPassword() {
  const { resetPassword } = useAccount();

  const handleReset = async (email: string) => {
    await resetPassword(email);
  };
}
```

### Profile Management

```tsx
import { useAccount, Sex } from '@spezivibe/account';

function EditProfileScreen() {
  const { user, updateProfile } = useAccount();

  const handleUpdate = async () => {
    await updateProfile({
      name: {
        givenName: 'John',
        familyName: 'Doe',
      },
      dateOfBirth: new Date('1990-01-01'),
      sex: Sex.Male,
      phoneNumber: '+1234567890',
      biography: 'Software developer',
    });
  };
}
```

### PersonName Structure

User names are represented using a structured `PersonName` type that supports international name formatting:

```tsx
import { PersonName, formatPersonName, PersonNameStyle } from '@spezivibe/account';

// PersonName interface
interface PersonName {
  givenName?: string;        // First name
  familyName?: string;       // Last name
  middleName?: string;       // Middle name
  namePrefix?: string;       // Title (Dr., Prof., etc.)
  nameSuffix?: string;       // Suffix (Jr., Sr., III, etc.)
  nickname?: string;         // Preferred name
}

// Creating a PersonName
const name: PersonName = {
  givenName: 'John',
  familyName: 'Doe',
};

// Formatting PersonName for display
const displayName = formatPersonName(name, PersonNameStyle.Long);
// Result: "John Doe"

const shortName = formatPersonName(name, PersonNameStyle.Short);
// Result: "John"

const initials = getPersonNameInitials(name);
// Result: "JD"
```

**PersonName Utilities:**

- `formatPersonName(name, style)` - Format PersonName for display
  - `PersonNameStyle.Long` - Full name (e.g., "Dr. John Michael Doe Jr.")
  - `PersonNameStyle.Medium` - Given and family names (e.g., "John Doe")
  - `PersonNameStyle.Short` - Given name only (e.g., "John")
  - `PersonNameStyle.Abbreviated` - Initials (e.g., "JMD")

- `parsePersonName(string)` - Parse a string into PersonName components
- `normalizePersonName(input)` - Accept either PersonName or string, return PersonName
- `isPersonNameEmpty(name)` - Check if PersonName has any components
- `getPersonNameInitials(name)` - Get initials from PersonName

**Why PersonName?**

Using structured names instead of strings provides:
- Better support for international name formats
- Separate storage of name components
- Flexible formatting for different contexts
- Proper handling of titles, suffixes, and middle names

### Account Configuration

Configure which profile fields to collect and which are required:

```tsx
import { AccountProvider, AccountConfiguration } from '@spezivibe/account';

const configuration: AccountConfiguration = {
  // Fields that will be shown in forms
  collects: ['name', 'dateOfBirth', 'sex', 'phoneNumber', 'biography'],

  // Fields that are required (must be subset of collects)
  required: ['name'],

  // Whether users can edit their profile after creation
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

**Configuration Options:**

- **`collects`**: Array of profile fields to collect. Available fields:
  - `'name'` - User's name (PersonName structure with first/last name)
  - `'dateOfBirth'` - Date of birth (Date picker)
  - `'sex'` - Sex assigned at birth (dropdown)
  - `'phoneNumber'` - Phone number
  - `'biography'` - Text biography
  - `'profileImageUrl'` - Profile image URL

- **`required`**: Array of fields that must be filled (must be subset of `collects`)

- **`allowsEditing`**: Boolean controlling whether "Edit Profile" button appears

**How it affects UI:**
- `RegisterForm` only shows fields listed in `collects`
- Required fields show an asterisk (*) and are validated
- `EditProfileForm` shows validation errors for required fields
- `AccountOverview` hides edit button if `allowsEditing` is false

**Examples:**

Minimal configuration (name only):
```tsx
{
  collects: ['name'],
  required: ['name'],
  allowsEditing: true,
}
```

Health app configuration:
```tsx
{
  collects: ['name', 'dateOfBirth', 'sex'],
  required: ['name', 'dateOfBirth'],
  allowsEditing: true,
}
```

Read-only profile:
```tsx
{
  collects: ['name', 'phoneNumber'],
  required: ['name'],
  allowsEditing: false, // Users cannot edit after creation
}
```

### Secure Account Operations

```tsx
import { useAccount } from '@spezivibe/account';

function AccountSettingsScreen() {
  const { updateEmail, updatePassword, deleteAccount } = useAccount();

  // Change email (requires current password)
  const handleEmailChange = async () => {
    await updateEmail?.('newemail@example.com', 'currentPassword');
  };

  // Change password
  const handlePasswordChange = async () => {
    await updatePassword?.('currentPassword', 'newPassword');
  };

  // Delete account
  const handleDeleteAccount = async () => {
    await deleteAccount?.('currentPassword');
  };
}
```

## Validation & Security

### Input Validation

**Email:**
- RFC 5322 compliant
- Automatic normalization (lowercase, trim)
- Real-time validation

**Password:**
- Minimum 8 characters
- Must contain uppercase, lowercase, and number
- Enforced on registration and password changes

**Input Sanitization:**
- HTML injection protection
- Automatic whitespace trimming
- Applied to all text inputs except passwords

```tsx
import { validateEmail, validatePasswordStrength } from '@spezivibe/account';

const emailResult = validateEmail('user@example.com');
const passwordResult = validatePasswordStrength('weak');
```

### Error Handling

```tsx
import { AccountError, AccountErrorCode } from '@spezivibe/account';

try {
  await login(email, password);
} catch (error) {
  if (error instanceof AccountError) {
    switch (error.code) {
      case AccountErrorCode.INVALID_EMAIL:
        // Handle invalid email
        break;
      case AccountErrorCode.WRONG_PASSWORD:
        // Handle wrong password
        break;
      case AccountErrorCode.USER_NOT_FOUND:
        // Handle user not found
        break;
    }
  }
}
```

## Account Services

### Firebase Account Service

```tsx
import { FirebaseAccountService } from '@spezivibe/firebase';

const accountService = new FirebaseAccountService({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
});

await accountService.initialize();
```

### InMemory Account Service

For local development and testing without a backend. By default, it starts unauthenticated. You can provide an initial user for testing scenarios that require an authenticated state.

```tsx
import { InMemoryAccountService } from '@spezivibe/account';

// Default: starts unauthenticated
const accountService = new InMemoryAccountService();
await accountService.initialize();

// With pre-configured user (for testing)
const authenticatedService = new InMemoryAccountService({
  initialUser: {
    uid: 'test-user',
    email: 'test@example.com',
    name: { givenName: 'Test', familyName: 'User' },
  },
});
await authenticatedService.initialize();
```

## API Reference

### useAccount Hook

```tsx
interface AccountContextValue {
  // Auth state
  signedIn: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;

  // Auth methods
  login: (email, password) => Promise<void>;
  register: (email, password, details?) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email) => Promise<void>;

  // Profile management
  updateProfile: (updates) => Promise<void>;

  // Account management (if supported by service)
  updateEmail?: (newEmail, password) => Promise<void>;
  updatePassword?: (currentPassword, newPassword) => Promise<void>;
  deleteAccount?: (password) => Promise<void>;

  // Utility
  clearError: () => void;
}
```

### SignInForm Props

| Prop | Type | Description |
|------|------|-------------|
| `onSuccess` | `() => void` | Callback when sign in succeeds |
| `onError` | `(error: Error) => void` | Callback when error occurs |
| `containerStyle` | `ViewStyle` | Custom container styles |
| `inputStyle` | `TextStyle` | Custom input field styles |
| `buttonStyle` | `ViewStyle` | Custom button styles |
| `buttonTextStyle` | `TextStyle` | Custom button text styles |
| `errorStyle` | `TextStyle` | Custom error text styles |
| `buttonText` | `string` | Button text (default: "Sign In") |
| `showRegisterLink` | `boolean` | Show register link (default: true) |
| `onRegisterPress` | `() => void` | Callback for register link |
| `emailInputProps` | `Partial<TextInputProps>` | Additional props for email input |
| `passwordInputProps` | `Partial<TextInputProps>` | Additional props for password input |

### RegisterForm Props

| Prop | Type | Description |
|------|------|-------------|
| `onSuccess` | `() => void` | Callback when registration succeeds |
| `onError` | `(error: Error) => void` | Callback when error occurs |
| `containerStyle` | `ViewStyle` | Custom container styles |
| `inputStyle` | `TextStyle` | Custom input field styles |
| `buttonStyle` | `ViewStyle` | Custom button styles |
| `buttonTextStyle` | `TextStyle` | Custom button text styles |
| `errorStyle` | `TextStyle` | Custom error text styles |
| `buttonText` | `string` | Button text (default: "Register") |
| `minPasswordLength` | `number` | Minimum password length (default: 6) |
| `showSignInLink` | `boolean` | Show sign in link (default: true) |
| `onSignInPress` | `() => void` | Callback for sign in link |
| `emailInputProps` | `Partial<TextInputProps>` | Additional props for email input |
| `passwordInputProps` | `Partial<TextInputProps>` | Additional props for password input |
| `confirmPasswordInputProps` | `Partial<TextInputProps>` | Additional props for confirm password input |

### PasswordResetForm Props

| Prop | Type | Description |
|------|------|-------------|
| `onSuccess` | `() => void` | Callback when reset email is sent |
| `onError` | `(error: Error) => void` | Callback when error occurs |
| `containerStyle` | `ViewStyle` | Custom container styles |
| `inputStyle` | `TextStyle` | Custom input field styles |
| `buttonStyle` | `ViewStyle` | Custom button styles |
| `buttonTextStyle` | `TextStyle` | Custom button text styles |
| `errorStyle` | `TextStyle` | Custom error text styles |
| `successStyle` | `TextStyle` | Custom success message styles |
| `buttonText` | `string` | Button text (default: "Send Reset Email") |
| `successMessage` | `string` | Success message text |
| `showBackToLogin` | `boolean` | Show back to login link (default: true) |
| `onBackToLogin` | `() => void` | Callback for back to login link |
| `emailInputProps` | `Partial<TextInputProps>` | Additional props for email input |

## Troubleshooting

### Common Issues and Solutions

#### Error: "Cannot find module '@spezivibe/account'"

**Solution:** Ensure the package is installed:
```bash
npm install @spezivibe/account
```

If using TypeScript, ensure you have type definitions and restart your TypeScript server.

#### Error: "useAccount must be used within AccountProvider"

**Problem:** You're trying to use `useAccount()` hook outside of `<AccountProvider>`.

**Solution:** Wrap your app with AccountProvider:
```tsx
// App.tsx
<AccountProvider accountService={accountService}>
  <YourApp />  {/* All components inside can use useAccount */}
</AccountProvider>
```

#### Error: "accountService.initialize is not a function"

**Problem:** You forgot to call `.initialize()` on your account service.

**Solution:**
```tsx
const accountService = new FirebaseAccountService(config);
await accountService.initialize();  // Don't forget this!
```

#### User stays logged in after logout

**Problem:** AccountService not properly clearing state.

**Solution:**
1. Check that you're calling the `logout` function from useAccount
2. For Firebase, ensure your Firebase project is properly configured
3. Clear app state/cache if testing locally

```tsx
const { logout } = useAccount();
await logout(); // This should work
```

#### Firebase: "Firebase App already initialized"

**Problem:** Creating multiple Firebase app instances.

**Solution:** Create the service instance outside your component:

```tsx
// ❌ Wrong - creates new instance on every render
function App() {
  const accountService = new FirebaseAccountService(config);
  // ...
}

// ✅ Correct - single instance
const accountService = new FirebaseAccountService(config);

function App() {
  // ...
}
```

#### TypeScript: Type errors with User object

**Problem:** `user` might be `null` when not authenticated.

**Solution:** Always check `signedIn` or use optional chaining:

```tsx
const { user, signedIn } = useAccount();

// Option 1: Check signedIn first
if (signedIn && user) {
  console.log(user.email); // Safe
}

// Option 2: Optional chaining
console.log(user?.email); // Safe
```

#### Form validation not working

**Problem:** Email or password not meeting requirements.

**Solution:** Check validation rules:
- **Email:** Must be valid RFC 5322 format (e.g., `user@example.com`)
- **Password:** Minimum 8 characters, must contain uppercase, lowercase, and number

```tsx
import { validateEmail, validatePasswordStrength } from '@spezivibe/account';

// Check if email is valid
const emailResult = validateEmail('test@example.com');
console.log(emailResult.valid); // true or false
console.log(emailResult.error); // error message if invalid

// Check password strength
const passwordResult = validatePasswordStrength('MyPass123');
console.log(passwordResult.valid); // true or false
```

#### Profile fields not saving

**Problem:** Field names don't match UserProfile interface.

**Solution:** Use exact field names from `UserProfile` type:

```tsx
// ✅ Correct field names
await updateProfile({
  name: {
    givenName: 'John',
    familyName: 'Doe',
  },
  dateOfBirth: new Date(),
  sex: Sex.Male,
  phoneNumber: '+1234567890',
  biography: 'My bio',
  profileImageUrl: 'https://...',
});

// ❌ Wrong - these don't exist
await updateProfile({
  firstName: 'John',  // Should be 'name.givenName'
  lastName: 'Doe',    // Should be 'name.familyName'
  fullName: 'John Doe', // Should be PersonName object
  age: 30,            // Should be 'dateOfBirth'
});
```

#### Firebase: Profile not persisting across sessions

**Problem:** Firestore not properly initialized or rules not configured.

**Solution:**
1. Ensure Firestore is enabled in Firebase Console
2. Set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Check that accountService is initialized before use

#### "Invalid email" error for valid emails

**Problem:** Email validation is strict (RFC 5322).

**Solution:** Ensure email format is correct:
- ✅ Valid: `user@example.com`, `name+tag@domain.co.uk`
- ❌ Invalid: `user@`, `@example.com`, `user @example.com` (space)

The package automatically trims whitespace, so accidental spaces should be handled.

## Testing

### Testing Components That Use useAccount

When testing components that use the `useAccount` hook, you need to provide a mock AccountProvider.

#### Option 1: Mock AccountProvider

```tsx
// test-utils.tsx - Create reusable test utilities
import React from 'react';
import { AccountProvider, InMemoryAccountService, User } from '@spezivibe/account';

// Default mock user for tests
const mockUser: User = {
  uid: 'test-user-123',
  email: 'test@example.com',
  name: { givenName: 'Test', familyName: 'User' },
};

export function renderWithAccount(
  component: React.ReactElement,
  authenticated: boolean = true
) {
  const accountService = new InMemoryAccountService({
    initialUser: authenticated ? mockUser : undefined,
  });

  return (
    <AccountProvider accountService={accountService}>
      {component}
    </AccountProvider>
  );
}
```

```tsx
// MyComponent.test.tsx
import { render } from '@testing-library/react-native';
import { renderWithAccount } from './test-utils';
import MyComponent from './MyComponent';

test('displays user email when logged in', () => {
  const { getByText } = render(
    renderWithAccount(<MyComponent />) // authenticated by default
  );

  expect(getByText('test@example.com')).toBeTruthy();
});

test('shows login prompt when not authenticated', () => {
  const { getByText } = render(
    renderWithAccount(<MyComponent />, false) // unauthenticated
  );

  expect(getByText('Please log in')).toBeTruthy();
});
```

#### Option 2: Mock useAccount Hook

```tsx
// MyComponent.test.tsx
import { render } from '@testing-library/react-native';
import * as AccountModule from '@spezivibe/account';

// Mock the useAccount hook
jest.mock('@spezivibe/account', () => ({
  ...jest.requireActual('@spezivibe/account'),
  useAccount: jest.fn(),
}));

const mockUseAccount = AccountModule.useAccount as jest.MockedFunction<typeof AccountModule.useAccount>;

test('shows login prompt when not authenticated', () => {
  // Set up mock return value
  mockUseAccount.mockReturnValue({
    signedIn: false,
    isLoading: false,
    user: null,
    error: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    resetPassword: jest.fn(),
    updateProfile: jest.fn(),
    clearError: jest.fn(),
  });

  const { getByText } = render(<MyComponent />);
  expect(getByText('Please log in')).toBeTruthy();
});

test('shows user profile when authenticated', () => {
  mockUseAccount.mockReturnValue({
    signedIn: true,
    isLoading: false,
    user: {
      uid: '123',
      email: 'test@example.com',
      name: {
        givenName: 'Test',
        familyName: 'User',
      },
    },
    error: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    resetPassword: jest.fn(),
    updateProfile: jest.fn(),
    clearError: jest.fn(),
  });

  const { getByText } = render(<MyComponent />);
  expect(getByText(/Test/)).toBeTruthy();
});
```

#### Option 3: Testing with Real Firebase (Integration Tests)

```tsx
import { FirebaseAccountService } from '@spezivibe/firebase';

// Use Firebase Emulator for testing
const testConfig = {
  apiKey: 'test-api-key',
  authDomain: 'localhost',
  projectId: 'test-project',
  storageBucket: 'test-bucket',
  messagingSenderId: '123',
  appId: 'test-app',
};

describe('Authentication flow', () => {
  let accountService: FirebaseAccountService;

  beforeAll(async () => {
    accountService = new FirebaseAccountService(testConfig);
    await accountService.initialize();
  });

  test('can register and login', async () => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'TestPass123';

    await accountService.register({ email, password });
    const user = await accountService.getCurrentUser();

    expect(user?.email).toBe(email);
  });
});
```

### Example Test Suite

```tsx
// LoginScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithAccount } from './test-utils';
import LoginScreen from './LoginScreen';
import * as AccountModule from '@spezivibe/account';

jest.mock('@spezivibe/account', () => ({
  ...jest.requireActual('@spezivibe/account'),
  useAccount: jest.fn(),
}));

const mockUseAccount = AccountModule.useAccount as jest.MockedFunction<typeof AccountModule.useAccount>;

describe('LoginScreen', () => {
  const mockLogin = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAccount.mockReturnValue({
      signedIn: false,
      isLoading: false,
      user: null,
      error: null,
      login: mockLogin,
      register: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      updateProfile: jest.fn(),
      clearError: jest.fn(),
    });
  });

  test('renders login form', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  test('calls login with email and password', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  test('shows error message on login failure', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrong');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(getByText('Invalid credentials')).toBeTruthy();
    });
  });
});
```

## Architecture

This module follows a **provider-service architecture**:

1. **Storage-Agnostic** - Account module only manages authentication
2. **Dependency Injection** - Services injected via props
3. **Interface-Based** - `AccountService` interface allows multiple implementations
4. **Context API** - State managed through React Context

```
App
 └─ AccountProvider (manages auth state)
     └─ AccountService (interface)
         ├─ FirebaseAccountService
         └─ InMemoryAccountService
```

### Key Design Principles

1. **Separation of Concerns**: Authentication logic is separate from UI and storage
2. **Testability**: Easy to mock services and test components in isolation
3. **Flexibility**: Swap account services without changing application code
4. **Type Safety**: Full TypeScript support with comprehensive type definitions

## Development

### Building

```bash
npm run build
npm run typecheck
```

### Running Package Tests

```bash
npm test
npm run test:coverage
```

## About

Part of the [Stanford Spezi](https://github.com/StanfordSpezi) ecosystem for React Native and TypeScript.

**Core features:**
- Storage-agnostic architecture pattern
- `AccountService` interface abstraction
- Account configuration with `.requires()` and `.collects()` patterns
- `AccountKey` enum for type-safe field references
- `AccountError` with structured error codes
- `AccountEvent` system for account state notifications
- Profile field management
- `InMemoryAccountService` for development/testing

For more on the Spezi framework:
- [Stanford Spezi Documentation](https://swiftpackageindex.com/StanfordSpezi/Spezi/documentation/spezi)

## License

MIT
