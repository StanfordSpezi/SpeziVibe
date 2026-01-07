import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AccountContextValue, AccountProviderProps, User } from '../types';
import { getErrorMessage } from '../utils/errors';

const AccountContext = createContext<AccountContextValue | null>(null);

/**
 * AccountProvider - Provides account management context to the app
 *
 * This provider manages authentication state and provides login/register/logout
 * functionality to child components. It wraps an AccountService implementation
 * and exposes a clean React API via the useAccount hook.
 *
 * This provider is storage-agnostic - it delegates all authentication
 * logic to the injected AccountService.
 *
 * @example
 * ```tsx
 * import { AccountProvider, InMemoryAccountService } from '@spezivibe/account';
 * // Or for Firebase: import { FirebaseAccountService } from '@spezivibe/firebase';
 *
 * const accountService = new InMemoryAccountService();
 *
 * function App() {
 *   return (
 *     <AccountProvider
 *       accountService={accountService}
 *       onLogin={(user) => console.log('User logged in:', user)}
 *     >
 *       <YourApp />
 *     </AccountProvider>
 *   );
 * }
 * ```
 */
export function AccountProvider({
  accountService,
  configuration,
  children,
  onLogin,
  onLogout,
  onAccountEvent,
}: AccountProviderProps) {
  const [signedIn, setSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [operationInProgress, setOperationInProgress] = useState(false);

  // Subscribe to auth state changes from the service
  useEffect(() => {
    let cancelled = false;

    const unsubscribe = accountService.onAuthStateChanged((newUser) => {
      if (cancelled) return;

      setUser(newUser);
      setSignedIn(newUser !== null);
      setIsLoading(false);
    });

    return () => {
      unsubscribe(); // Unsubscribe first to stop callbacks
      cancelled = true; // Then set flag
    };
  }, [accountService]);

  const login = useCallback(
    async (email: string, password: string) => {
      if (operationInProgress) {
        throw new Error('An authentication operation is already in progress');
      }

      setOperationInProgress(true);
      setIsLoading(true);
      setError(null);

      try {
        await accountService.login({ email, password });

        // Get the updated user
        const currentUser = await accountService.getCurrentUser();

        if (currentUser) {
          // Call onLogin callback
          if (onLogin) {
            await onLogin(currentUser);
          }
          // Emit login event
          if (onAccountEvent) {
            await onAccountEvent({ type: 'login', user: currentUser });
          }
        }
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
        setOperationInProgress(false);
      }
    },
    [accountService, onLogin, onAccountEvent, operationInProgress]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      details?: Partial<import('../types').UserProfile>
    ) => {
      if (operationInProgress) {
        throw new Error('An authentication operation is already in progress');
      }

      setOperationInProgress(true);
      setIsLoading(true);
      setError(null);

      try {
        await accountService.register({
          email,
          password,
          ...details,
        });

        // Get the updated user
        const currentUser = await accountService.getCurrentUser();

        if (currentUser) {
          // Call onLogin callback for registration too
          if (onLogin) {
            await onLogin(currentUser);
          }
          // Emit login event (registration logs in the user)
          if (onAccountEvent) {
            await onAccountEvent({ type: 'login', user: currentUser });
          }
        }
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
        setOperationInProgress(false);
      }
    },
    [accountService, onLogin, onAccountEvent, operationInProgress]
  );

  const logout = useCallback(async () => {
    if (operationInProgress) {
      throw new Error('An authentication operation is already in progress');
    }

    setOperationInProgress(true);
    setIsLoading(true);
    setError(null);

    try {
      await accountService.logout();

      if (onLogout) {
        await onLogout();
      }
      // Emit logout event
      if (onAccountEvent) {
        await onAccountEvent({ type: 'logout' });
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
      setOperationInProgress(false);
    }
  }, [accountService, onLogout, onAccountEvent, operationInProgress]);

  const resetPassword = useCallback(
    async (email: string) => {
      if (operationInProgress) {
        throw new Error('An authentication operation is already in progress');
      }

      setOperationInProgress(true);
      setIsLoading(true);
      setError(null);

      try {
        await accountService.resetPassword(email);
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
        setOperationInProgress(false);
      }
    },
    [accountService, operationInProgress]
  );

  const updateProfile = useCallback(
    async (updates: import('../types').UserProfileUpdate) => {
      if (operationInProgress) {
        throw new Error('An operation is already in progress');
      }

      setOperationInProgress(true);
      setIsLoading(true);
      setError(null);

      try {
        await accountService.updateProfile(updates);

        // Get the updated user and emit update event
        const currentUser = await accountService.getCurrentUser();
        if (currentUser && onAccountEvent) {
          await onAccountEvent({ type: 'update', user: currentUser });
        }
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
        setOperationInProgress(false);
      }
    },
    [accountService, onAccountEvent, operationInProgress]
  );

  const updateEmail = useCallback(
    async (newEmail: string, password: string) => {
      if (!accountService.updateEmail) {
        throw new Error('Email update is not supported by this account service');
      }

      if (operationInProgress) {
        throw new Error('An operation is already in progress');
      }

      setOperationInProgress(true);
      setIsLoading(true);
      setError(null);

      try {
        await accountService.updateEmail(newEmail, password);
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
        setOperationInProgress(false);
      }
    },
    [accountService, operationInProgress]
  );

  const updatePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!accountService.updatePassword) {
        throw new Error('Password update is not supported by this account service');
      }

      if (operationInProgress) {
        throw new Error('An operation is already in progress');
      }

      setOperationInProgress(true);
      setIsLoading(true);
      setError(null);

      try {
        await accountService.updatePassword(currentPassword, newPassword);
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
        setOperationInProgress(false);
      }
    },
    [accountService, operationInProgress]
  );

  const deleteAccount = useCallback(
    async (password: string) => {
      if (!accountService.deleteAccount) {
        throw new Error('Account deletion is not supported by this account service');
      }

      if (operationInProgress) {
        throw new Error('An operation is already in progress');
      }

      setOperationInProgress(true);
      setIsLoading(true);
      setError(null);

      try {
        await accountService.deleteAccount(password);

        // Emit delete event
        if (onAccountEvent) {
          await onAccountEvent({ type: 'delete' });
        }
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
        setOperationInProgress(false);
      }
    },
    [accountService, onAccountEvent, operationInProgress]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      signedIn,
      isLoading,
      user,
      configuration,
      login,
      register,
      logout,
      resetPassword,
      updateProfile,
      updateEmail,
      updatePassword,
      deleteAccount,
      error,
      clearError,
    }),
    [signedIn, isLoading, user, configuration, login, register, logout, resetPassword, updateProfile, updateEmail, updatePassword, deleteAccount, error, clearError]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

/**
 * Hook to access account context
 *
 * Must be used within an AccountProvider. Provides access to authentication
 * state and methods for login, register, and logout.
 *
 * @example
 * ```tsx
 * function LoginScreen() {
 *   const { login, isLoading, error } = useAccount();
 *
 *   const handleLogin = async () => {
 *     try {
 *       await login('user@example.com', 'password');
 *       // Navigate to main app
 *     } catch (err) {
 *       // Error is available in the error state
 *     }
 *   };
 *
 *   return (
 *     <View>
 *       <Button onPress={handleLogin} disabled={isLoading}>
 *         {isLoading ? 'Logging in...' : 'Login'}
 *       </Button>
 *       {error && <Text>{error}</Text>}
 *     </View>
 *   );
 * }
 * ```
 */
export function useAccount(): AccountContextValue {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}
