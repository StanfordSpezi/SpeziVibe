import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BackendService } from './types';
import { useScheduler } from '../scheduler/context';

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
  const { scheduler } = useScheduler();

  // Get backend service from scheduler
  const getBackend = (): BackendService | null => {
    if (!scheduler) return null;
    // Access private backend through type assertion
    return (scheduler as any).backend;
  };

  useEffect(() => {
    checkAuthStatus();
  }, [scheduler]);

  async function checkAuthStatus() {
    const backend = getBackend();
    if (!backend) {
      setIsLoading(false);
      return;
    }

    try {
      const authenticated = await backend.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (err) {
      console.error('Failed to check auth status:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const backend = getBackend();
    if (!backend) {
      throw new Error('Backend not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      await backend.login({ email, password });
      await backend.syncFromRemote();
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function register(email: string, password: string) {
    const backend = getBackend();
    if (!backend) {
      throw new Error('Backend not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      // For Firebase, registration is done through Firebase Auth
      await backend.login({ email, password });
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    const backend = getBackend();
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
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        error,
      }}
    >
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
