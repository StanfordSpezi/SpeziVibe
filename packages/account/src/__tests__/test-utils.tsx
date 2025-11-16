import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { AccountProvider } from '../providers/AccountProvider';
import { AccountProviderProps } from '../types';
import { InMemoryAccountService } from '../services/local-account-service';

/**
 * Test utilities for @spezivibe/account tests
 */

/**
 * Create a mock account service for testing
 */
export function createMockAccountService() {
  const service = new InMemoryAccountService();
  return service;
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
 * Mock user data for tests
 */
export const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  displayName: 'Test User',
  dateOfBirth: new Date('1990-01-01'),
  sex: 'male' as const,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

/**
 * Mock Firebase error
 */
export function createFirebaseError(code: string, message: string) {
  const error = new Error(message);
  (error as any).code = code;
  return error;
}
