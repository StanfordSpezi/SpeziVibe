/**
 * Medplum-specific error handling utilities
 */

import { AccountError, AccountErrorCode } from '@spezivibe/account';

/**
 * Map Medplum errors to user-friendly AccountError instances
 *
 * @param error - Original error from Medplum SDK
 * @returns AccountError with appropriate code and message
 */
export function mapMedplumError(error: unknown): AccountError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Invalid credentials
    if (message.includes('invalid') && message.includes('credential')) {
      return new AccountError(
        AccountErrorCode.WRONG_PASSWORD,
        'Invalid email or password',
        error
      );
    }

    // Email already in use
    if (message.includes('email') && message.includes('already')) {
      return new AccountError(
        AccountErrorCode.EMAIL_IN_USE,
        'An account with this email already exists',
        error
      );
    }

    // User not found
    if (message.includes('not found')) {
      return new AccountError(
        AccountErrorCode.USER_NOT_FOUND,
        'Account not found',
        error
      );
    }

    // Invalid email
    if (message.includes('invalid') && message.includes('email')) {
      return new AccountError(
        AccountErrorCode.INVALID_EMAIL,
        'Please enter a valid email address',
        error
      );
    }

    // Weak password
    if (message.includes('weak') && message.includes('password')) {
      return new AccountError(
        AccountErrorCode.WEAK_PASSWORD,
        'Password is too weak. Please use at least 8 characters',
        error
      );
    }

    // Rate limiting / too many requests
    if (message.includes('too many') || message.includes('rate limit')) {
      return new AccountError(
        AccountErrorCode.TOO_MANY_REQUESTS,
        'Too many attempts. Please try again later',
        error
      );
    }

    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return new AccountError(
        AccountErrorCode.NETWORK_ERROR,
        'Network error. Please check your connection',
        error
      );
    }

    // reCAPTCHA errors - direct users to disable it in Medplum settings
    if (message.includes('recaptcha') || message.includes('captcha')) {
      return new AccountError(
        AccountErrorCode.UNKNOWN_ERROR,
        'Registration requires reCAPTCHA verification. ' +
          'Please disable reCAPTCHA in your Medplum project settings ' +
          '(Project Admin > Security > uncheck "Require reCAPTCHA").',
        error
      );
    }

    // Unauthorized / not authenticated
    if (message.includes('unauthorized') || message.includes('not authenticated')) {
      return new AccountError(
        AccountErrorCode.NOT_AUTHENTICATED,
        'Please sign in to continue',
        error
      );
    }

    // Service unavailable
    if (message.includes('unavailable') || message.includes('503') || message.includes('500')) {
      return new AccountError(
        AccountErrorCode.SERVICE_UNAVAILABLE,
        'Service temporarily unavailable. Please try again later',
        error
      );
    }

    // Return unknown error with original message for debugging
    return new AccountError(
      AccountErrorCode.UNKNOWN_ERROR,
      error.message || 'An unexpected error occurred',
      error
    );
  }

  // Non-Error thrown
  return new AccountError(
    AccountErrorCode.UNKNOWN_ERROR,
    'An unexpected error occurred'
  );
}

/**
 * Create an AccountError for "not authenticated" scenarios
 */
export function notAuthenticatedError(): AccountError {
  return new AccountError(
    AccountErrorCode.NOT_AUTHENTICATED,
    'No authenticated user'
  );
}

/**
 * Create an AccountError for profile-related failures
 */
export function profileUpdateError(originalError?: unknown): AccountError {
  return new AccountError(
    AccountErrorCode.PROFILE_UPDATE_FAILED,
    'Failed to update profile',
    originalError
  );
}
