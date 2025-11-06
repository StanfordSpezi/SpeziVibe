import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useStandard } from './standard-context';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { backend, isLoading: backendLoading } = useStandard();

  useEffect(() => {
    if (backendLoading || !backend) {
      return;
    }

    let cancelled = false;

    async function checkAuth() {
      try {
        const authenticated = await backend.isAuthenticated();
        if (!cancelled) {
          setIsAuthenticated(authenticated);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to check auth status:', err);
          setIsLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [backend, backendLoading]);

  const login = useCallback(async (email: string, password: string) => {
    if (!backend) {
      throw new Error('Backend not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      await backend.login({ email, password });
      setIsAuthenticated(true);

      // Sync in background, don't block login
      backend.syncFromRemote().catch(err => {
        console.warn('Background sync failed:', err);
      });
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [backend]);

  const register = useCallback(async (email: string, password: string) => {
    if (!backend) {
      throw new Error('Backend not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if backend has a register method, otherwise use login
      if ('register' in backend && typeof backend.register === 'function') {
        await backend.register({ email, password });
      } else {
        // Fallback for backends without register (shouldn't happen with Firebase)
        await backend.login({ email, password });
      }
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [backend]);

  const logout = useCallback(async () => {
    if (!backend) return;

    setIsLoading(true);
    setError(null);

    try {
      await backend.logout();
      setIsAuthenticated(false);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [backend]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      error,
    }),
    [isAuthenticated, isLoading, login, register, logout, error]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
