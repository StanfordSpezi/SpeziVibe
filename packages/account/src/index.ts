/**
 * @spezivibe/account
 *
 * Spezi-compliant account management module for React Native applications.
 * Following the Spezi standard, this module is storage-agnostic and provides
 * a clean interface for authentication and account management.
 *
 * @example
 * ```tsx
 * import {
 *   AccountProvider,
 *   useAccount,
 *   FirebaseAccountService,
 *   SignInForm,
 * } from '@spezivibe/account';
 *
 * const accountService = new FirebaseAccountService(firebaseConfig);
 *
 * function App() {
 *   return (
 *     <AccountProvider accountService={accountService}>
 *       <YourApp />
 *     </AccountProvider>
 *   );
 * }
 *
 * function LoginScreen() {
 *   return <SignInForm onSuccess={() => navigate('Home')} />;
 * }
 * ```
 */

// Types
export * from './types';

// Providers and Hooks
export { AccountProvider, useAccount } from './providers/AccountProvider';

// Services
export { FirebaseAccountService } from './services/firebase-account-service';
export { InMemoryAccountService, LocalAccountService } from './services/local-account-service';

// Components
export { SignInForm, RegisterForm, PasswordResetForm, AccountOverview, EditProfileForm, ChangePasswordForm } from './components';
export type { SignInFormProps, RegisterFormProps, PasswordResetFormProps, AccountOverviewProps, EditProfileFormProps, ChangePasswordFormProps } from './components';

// Utilities
export {
  // Error handling
  AccountError,
  AccountErrorCode,
  mapFirebaseError,
  getErrorMessage,
  isAccountError,
  // Validation
  validateEmail,
  validatePassword,
  validatePasswordStrength,
  validatePasswordMatch,
  sanitizeInput,
  normalizeEmail,
  type ValidationResult,
} from './utils';

// Note: Storage and backend integration is NOT provided by this module.
// Following the Spezi standard, consuming applications should handle
// data persistence and backend integration separately. This module only
// manages authentication state and user accounts.
