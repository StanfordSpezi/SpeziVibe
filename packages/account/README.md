# @spezivibe/account

Account management module for React Native applications.

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
import { FirebaseAccountService, AccountProvider } from '@spezivibe/account';

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
      name: 'John Doe',
      dateOfBirth: new Date('1990-01-01'),
      sex: Sex.Male,
      phoneNumber: '+1234567890',
      biography: 'Software developer',
    });
  };
}
```

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
  - `'name'` - User's full name
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
import { FirebaseAccountService } from '@spezivibe/account';

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

### Local Account Service

For local development and testing without a backend.

```tsx
import { LocalAccountService } from '@spezivibe/account';

const accountService = new LocalAccountService();
await accountService.initialize();
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

## Architecture

This module follows the Spezi Standard pattern:

1. **Storage-Agnostic** - Account module only manages authentication
2. **Dependency Injection** - Services injected via props
3. **Interface-Based** - `AccountService` interface allows multiple implementations
4. **Context API** - State managed through React Context

```
App
 └─ AccountProvider (manages auth state)
     └─ AccountService (interface)
         ├─ FirebaseAccountService
         └─ LocalAccountService
```

## Development

### Building

```bash
npm run build
npm run typecheck
```

### Testing

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
