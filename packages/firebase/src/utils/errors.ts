/**
 * Firebase-specific error handling utilities
 */

import { AccountError, AccountErrorCode } from '@spezivibe/account';

/**
 * Map Firebase error codes to user-friendly AccountError instances
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
