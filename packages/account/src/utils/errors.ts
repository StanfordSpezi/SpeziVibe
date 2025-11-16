/**
 * Centralized error handling for account operations
 * Provides consistent error codes and user-friendly messages
 */

/**
 * Standard error codes for account operations
 */
export enum AccountErrorCode {
  // Authentication errors
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  WRONG_PASSWORD = 'WRONG_PASSWORD',
  EMAIL_IN_USE = 'EMAIL_IN_USE',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  OPERATION_IN_PROGRESS = 'OPERATION_IN_PROGRESS',

  // Profile errors
  PROFILE_UPDATE_FAILED = 'PROFILE_UPDATE_FAILED',
  EMAIL_UPDATE_FAILED = 'EMAIL_UPDATE_FAILED',
  PASSWORD_UPDATE_FAILED = 'PASSWORD_UPDATE_FAILED',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Generic errors
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Custom error class for account operations
 * Extends Error with additional metadata
 */
export class AccountError extends Error {
  /**
   * @param code - Error code from AccountErrorCode enum
   * @param message - User-friendly error message
   * @param originalError - Original error that caused this error (for debugging)
   */
  constructor(
    public code: AccountErrorCode,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AccountError';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AccountError);
    }
  }
}

/**
 * Map Firebase error codes to user-friendly messages
 *
 * @param firebaseCode - Firebase error code
 * @returns AccountError with appropriate code and message
 */
export function mapFirebaseError(firebaseCode: string): AccountError {
  switch (firebaseCode) {
    case 'auth/invalid-email':
      return new AccountError(
        AccountErrorCode.INVALID_EMAIL,
        'Please enter a valid email address'
      );

    case 'auth/user-disabled':
      return new AccountError(
        AccountErrorCode.USER_NOT_FOUND,
        'This account has been disabled'
      );

    case 'auth/user-not-found':
      return new AccountError(
        AccountErrorCode.USER_NOT_FOUND,
        'No account found with this email'
      );

    case 'auth/wrong-password':
      return new AccountError(
        AccountErrorCode.WRONG_PASSWORD,
        'Incorrect password'
      );

    case 'auth/email-already-in-use':
      return new AccountError(
        AccountErrorCode.EMAIL_IN_USE,
        'An account with this email already exists'
      );

    case 'auth/weak-password':
      return new AccountError(
        AccountErrorCode.WEAK_PASSWORD,
        'Password is too weak. Please use at least 8 characters'
      );

    case 'auth/too-many-requests':
      return new AccountError(
        AccountErrorCode.TOO_MANY_REQUESTS,
        'Too many attempts. Please try again later'
      );

    case 'auth/network-request-failed':
      return new AccountError(
        AccountErrorCode.NETWORK_ERROR,
        'Network error. Please check your connection'
      );

    case 'auth/requires-recent-login':
      return new AccountError(
        AccountErrorCode.NOT_AUTHENTICATED,
        'Please sign in again to continue'
      );

    default:
      return new AccountError(
        AccountErrorCode.UNKNOWN_ERROR,
        'An unexpected error occurred. Please try again'
      );
  }
}

/**
 * Convert any error to a user-friendly message
 *
 * @param error - Error of any type
 * @returns User-friendly error message
 *
 * @example
 * ```typescript
 * try {
 *   await accountService.login(credentials);
 * } catch (error) {
 *   const message = getErrorMessage(error);
 *   showAlert(message);
 * }
 * ```
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AccountError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

/**
 * Check if an error is a specific AccountError code
 *
 * @param error - Error to check
 * @param code - AccountErrorCode to match
 * @returns True if error matches the code
 *
 * @example
 * ```typescript
 * catch (error) {
 *   if (isAccountError(error, AccountErrorCode.USER_NOT_FOUND)) {
 *     // Show signup prompt
 *   }
 * }
 * ```
 */
export function isAccountError(
  error: unknown,
  code: AccountErrorCode
): error is AccountError {
  return error instanceof AccountError && error.code === code;
}
