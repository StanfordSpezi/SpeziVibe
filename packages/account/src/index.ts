/**
 * @spezivibe/account
 *
 * Account management module for React Native applications.
 * This module is storage-agnostic and provides a clean interface
 * for authentication and account management.
 *
 * @example
 * ```tsx
 * import {
 *   AccountProvider,
 *   useAccount,
 *   InMemoryAccountService,
 *   SignInForm,
 * } from '@spezivibe/account';
 *
 * const accountService = new InMemoryAccountService();
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
export { InMemoryAccountService } from './services/in-memory-account-service';
export type { InMemoryAccountServiceOptions } from './services/in-memory-account-service';

// Components
export { SignInForm, RegisterForm, PasswordResetForm, AccountOverview, EditProfileForm, ChangePasswordForm } from './components';
export type { SignInFormProps, RegisterFormProps, PasswordResetFormProps, AccountOverviewProps, EditProfileFormProps, ChangePasswordFormProps } from './components';

// Utilities
export {
  // Error handling
  AccountError,
  AccountErrorCode,
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
  // Logging
  createLogger,
  LogLevel,
} from './utils';

// PersonName utilities
export {
  formatPersonName,
  parsePersonName,
  normalizePersonName,
  isPersonNameEmpty,
  getPersonNameInitials,
  PersonNameStyle,
} from './utils/person-name';

// Note: Storage and backend integration is NOT provided by this module.
// Consuming applications should handle data persistence and backend
// integration separately. This module only manages authentication
// state and user accounts.
