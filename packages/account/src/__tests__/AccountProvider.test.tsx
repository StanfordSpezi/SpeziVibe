import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AccountProvider, useAccount } from '../providers/AccountProvider';
import { InMemoryAccountService } from '../services/in-memory-account-service';
import { AccountService } from '../types';
import { defaultMockUser } from './test-utils';

describe('AccountProvider', () => {
  let accountService: AccountService;

  beforeEach(() => {
    // Create an authenticated service by default
    accountService = new InMemoryAccountService({
      initialUser: defaultMockUser,
    });
  });

  describe('initialization', () => {
    it('should provide account context', async () => {
      const { result } = renderHook(() => useAccount(), {
        wrapper: ({ children }) => (
          <AccountProvider accountService={accountService}>{children}</AccountProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.signedIn).toBe(true);
      });
    });

    it('should throw error when used outside provider', () => {
      // Suppress console error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useAccount());
      }).toThrow('useAccount must be used within an AccountProvider');

      console.error = originalError;
    });

    it('should eventually stop loading', async () => {
      const { result } = renderHook(() => useAccount(), {
        wrapper: ({ children }) => (
          <AccountProvider accountService={accountService}>{children}</AccountProvider>
        ),
      });

      // Eventually should stop loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should load user after initialization', async () => {
      const { result } = renderHook(() => useAccount(), {
        wrapper: ({ children }) => (
          <AccountProvider accountService={accountService}>{children}</AccountProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.user).not.toBeNull();
      });
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const { result } = renderHook(() => useAccount(), {
        wrapper: ({ children }) => (
          <AccountProvider accountService={accountService}>{children}</AccountProvider>
        ),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(result.current.user?.email).toBe('test@example.com');
      expect(result.current.error).toBeNull();
    });

    it('should set loading during login', async () => {
      const { result } = renderHook(() => useAccount(), {
        wrapper: ({ children }) => (
          <AccountProvider accountService={accountService}>{children}</AccountProvider>
        ),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.login('test@example.com', 'password');
      });

      // Should be loading immediately
      expect(result.current.isLoading).toBe(true);
    });

    it('should call onLogin callback', async () => {
      const onLogin = jest.fn();
      const { result } = renderHook(() => useAccount(), {
        wrapper: ({ children }) => (
          <AccountProvider accountService={accountService} onLogin={onLogin}>
            {children}
          </AccountProvider>
        ),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(onLogin).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com' })
      );
    });

    it('should handle login error', async () => {
      // Create a new service and spy on login method
      const errorService = new InMemoryAccountService();
      await errorService.initialize();
      jest.spyOn(errorService, 'login').mockRejectedValue(new Error('Login failed'));

      const { result } = renderHook(() => useAccount(), {
        wrapper: ({ children }) => (
          <AccountProvider accountService={errorService}>{children}</AccountProvider>
        ),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrong-password');
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Login failed');
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const { result } = renderHook(() => useAccount(), {
        wrapper: ({ children }) => (
          <AccountProvider accountService={accountService}>{children}</AccountProvider>
        ),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.register('newuser@example.com', 'password', {
          name: {
            givenName: 'New',
            familyName: 'User',
          },
        });
      });

      expect(result.current.user?.email).toBe('newuser@example.com');
      expect(result.current.user?.name?.givenName).toBe('New');
      expect(result.current.user?.name?.familyName).toBe('User');
    });

    it('should call onLogin callback after registration', async () => {
      const onLogin = jest.fn();
      const { result } = renderHook(() => useAccount(), {
        wrapper: ({ children }) => (
          <AccountProvider accountService={accountService} onLogin={onLogin}>
            {children}
          </AccountProvider>
        ),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.register('newuser@example.com', 'password');
      });

      expect(onLogin).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const { result } = renderHook(() => useAccount(), {
        wrapper: ({ children }) => (
          <AccountProvider accountService={accountService}>{children}</AccountProvider>
        ),
      });

      await waitFor(() => expect(result.current.signedIn).toBe(true));

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.signedIn).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should call onLogout callback', async () => {
      const onLogout = jest.fn();
      const { result } = renderHook(() => useAccount(), {
        wrapper: ({ children }) => (
          <AccountProvider accountService={accountService} onLogout={onLogout}>
            {children}
          </AccountProvider>
        ),
      });

      await waitFor(() => expect(result.current.signedIn).toBe(true));

      await act(async () => {
        await result.current.logout();
      });

      expect(onLogout).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const { result } = renderHook(() => useAccount(), {
        wrapper: ({ children }) => (
          <AccountProvider accountService={accountService}>{children}</AccountProvider>
        ),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.resetPassword('test@example.com');
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const { result } = renderHook(() => useAccount(), {
        wrapper: ({ children }) => (
          <AccountProvider accountService={accountService}>{children}</AccountProvider>
        ),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.updateProfile({
          name: {
            givenName: 'Updated',
            familyName: 'Name',
          },
          phoneNumber: '+1234567890',
        });
      });

      expect(result.current.user?.name?.givenName).toBe('Updated');
      expect(result.current.user?.name?.familyName).toBe('Name');
      expect(result.current.user?.phoneNumber).toBe('+1234567890');
    });
  });

  describe('error handling', () => {
    it('should clear error', async () => {
      const errorService = new InMemoryAccountService({
        initialUser: defaultMockUser,
      });
      jest.spyOn(errorService, 'login').mockRejectedValue(new Error('Login failed'));

      const { result } = renderHook(() => useAccount(), {
        wrapper: ({ children }) => (
          <AccountProvider accountService={errorService}>{children}</AccountProvider>
        ),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Trigger error
      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrong');
        } catch {
          // Expected
        }
      });

      expect(result.current.error).not.toBeNull();

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('optional methods', () => {
    it('should expose updateEmail if service supports it', async () => {
      const { result } = renderHook(() => useAccount(), {
        wrapper: ({ children }) => (
          <AccountProvider accountService={accountService}>{children}</AccountProvider>
        ),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.updateEmail).toBeDefined();
    });

    it('should expose updatePassword if service supports it', async () => {
      const { result } = renderHook(() => useAccount(), {
        wrapper: ({ children }) => (
          <AccountProvider accountService={accountService}>{children}</AccountProvider>
        ),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.updatePassword).toBeDefined();
    });

    it('should expose deleteAccount if service supports it', async () => {
      const { result } = renderHook(() => useAccount(), {
        wrapper: ({ children }) => (
          <AccountProvider accountService={accountService}>{children}</AccountProvider>
        ),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.deleteAccount).toBeDefined();
    });
  });
});
