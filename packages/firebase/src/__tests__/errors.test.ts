import { AccountError, AccountErrorCode } from '@spezivibe/account';
import { mapFirebaseError } from '../utils/errors';

describe('mapFirebaseError', () => {
  describe('authentication errors', () => {
    it('should map invalid-email error', () => {
      const error = mapFirebaseError('auth/invalid-email');
      expect(error).toBeInstanceOf(AccountError);
      expect(error.code).toBe(AccountErrorCode.INVALID_EMAIL);
      expect(error.message).toBe('Please enter a valid email address');
    });

    it('should map user-disabled error', () => {
      const error = mapFirebaseError('auth/user-disabled');
      expect(error).toBeInstanceOf(AccountError);
      expect(error.code).toBe(AccountErrorCode.USER_NOT_FOUND);
      expect(error.message).toBe('This account has been disabled');
    });

    it('should map user-not-found error', () => {
      const error = mapFirebaseError('auth/user-not-found');
      expect(error).toBeInstanceOf(AccountError);
      expect(error.code).toBe(AccountErrorCode.USER_NOT_FOUND);
      expect(error.message).toBe('No account found with this email');
    });

    it('should map wrong-password error', () => {
      const error = mapFirebaseError('auth/wrong-password');
      expect(error).toBeInstanceOf(AccountError);
      expect(error.code).toBe(AccountErrorCode.WRONG_PASSWORD);
      expect(error.message).toBe('Incorrect password');
    });

    it('should map email-already-in-use error', () => {
      const error = mapFirebaseError('auth/email-already-in-use');
      expect(error).toBeInstanceOf(AccountError);
      expect(error.code).toBe(AccountErrorCode.EMAIL_IN_USE);
      expect(error.message).toBe('An account with this email already exists');
    });

    it('should map weak-password error', () => {
      const error = mapFirebaseError('auth/weak-password');
      expect(error).toBeInstanceOf(AccountError);
      expect(error.code).toBe(AccountErrorCode.WEAK_PASSWORD);
      expect(error.message).toBe('Password is too weak. Please use at least 8 characters');
    });
  });

  describe('rate limiting errors', () => {
    it('should map too-many-requests error', () => {
      const error = mapFirebaseError('auth/too-many-requests');
      expect(error).toBeInstanceOf(AccountError);
      expect(error.code).toBe(AccountErrorCode.TOO_MANY_REQUESTS);
      expect(error.message).toBe('Too many attempts. Please try again later');
    });
  });

  describe('network errors', () => {
    it('should map network-request-failed error', () => {
      const error = mapFirebaseError('auth/network-request-failed');
      expect(error).toBeInstanceOf(AccountError);
      expect(error.code).toBe(AccountErrorCode.NETWORK_ERROR);
      expect(error.message).toBe('Network error. Please check your connection');
    });
  });

  describe('session errors', () => {
    it('should map requires-recent-login error', () => {
      const error = mapFirebaseError('auth/requires-recent-login');
      expect(error).toBeInstanceOf(AccountError);
      expect(error.code).toBe(AccountErrorCode.NOT_AUTHENTICATED);
      expect(error.message).toBe('Please sign in again to continue');
    });
  });

  describe('unknown errors', () => {
    it('should map unknown error code to UNKNOWN_ERROR', () => {
      const error = mapFirebaseError('auth/some-unknown-error');
      expect(error).toBeInstanceOf(AccountError);
      expect(error.code).toBe(AccountErrorCode.UNKNOWN_ERROR);
      expect(error.message).toBe('An unexpected error occurred. Please try again');
    });

    it('should handle non-auth error codes', () => {
      const error = mapFirebaseError('firestore/permission-denied');
      expect(error).toBeInstanceOf(AccountError);
      expect(error.code).toBe(AccountErrorCode.UNKNOWN_ERROR);
    });
  });
});
