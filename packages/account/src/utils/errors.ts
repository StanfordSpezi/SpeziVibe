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

/**
 * Convert unknown error to Error type
 *
 * @param error - Error of any type
 * @returns Error instance
 *
 * @example
 * ```typescript
 * catch (err: unknown) {
 *   onError?.(toError(err));
 * }
 * ```
 */
export function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  return new Error(getErrorMessage(error));
}
