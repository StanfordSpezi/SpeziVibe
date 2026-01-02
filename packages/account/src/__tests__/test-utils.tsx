import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { AccountProvider } from '../providers/AccountProvider';
import { AccountProviderProps, User } from '../types';
import { InMemoryAccountService } from '../services/in-memory-account-service';

/**
 * Test utilities for @spezivibe/account tests
 */

/**
 * Default mock user for tests
 */
export const defaultMockUser: User = {
  uid: 'test-user-123',
  email: 'test@example.com',
  name: {
    givenName: 'Test',
    familyName: 'User',
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

/**
 * Create a mock account service for testing
 * @param authenticated - Whether the service should start authenticated (default: true for backward compatibility)
 * @param user - Custom user to use (default: defaultMockUser)
 */
export function createMockAccountService(authenticated: boolean = true, user: User = defaultMockUser) {
  if (authenticated) {
    return new InMemoryAccountService({
      initialUser: user,
    });
  } else {
    return new InMemoryAccountService({
      startUnauthenticated: true,
    });
  }
}

/**
 * Render component wrapped with AccountProvider
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  providerProps?: Partial<AccountProviderProps>;
}

export function renderWithAccountProvider(
  ui: ReactElement,
  { providerProps, ...renderOptions }: CustomRenderOptions = {}
) {
  const accountService = providerProps?.accountService || createMockAccountService();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AccountProvider accountService={accountService} {...providerProps}>
        {children}
      </AccountProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    accountService,
  };
}

/**
 * Wait for async operations to complete
 */
export const waitFor = (ms: number = 0) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock user data for tests (with full profile)
 * @deprecated Use defaultMockUser instead
 */
export const mockUser = {
  ...defaultMockUser,
  dateOfBirth: new Date('1990-01-01'),
  sex: 'male' as const,
};

/**
 * Mock Firebase error
 */
export function createFirebaseError(code: string, message: string) {
  const error = new Error(message);
  (error as any).code = code;
  return error;
}
