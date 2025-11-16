import { AccountService, LoginCredentials, RegisterCredentials, User, UserProfileUpdate } from '../types';
import { createLogger } from '../utils';

/**
 * In-memory implementation of AccountService for development/testing
 *
 * This service simulates authentication without requiring a backend.
 * It always returns an authenticated state with a mock user.
 *
 * Use this service for:
 * - Local development without Firebase
 * - Testing UI flows without auth dependencies
 * - Offline-first applications
 */
export class InMemoryAccountService implements AccountService {
  private mockUser: User = {
    uid: 'local-user',
    email: 'local@example.com',
    displayName: 'Local User',
    name: 'Local User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  private isLoggedIn: boolean = true;
  private authStateListeners: Array<(user: User | null) => void> = [];
  private logger = createLogger('InMemoryAccountService');

  async initialize(): Promise<void> {
    this.logger.info('Initialized - always authenticated');
    // Immediately notify listeners with mock user
    this.notifyListeners();
  }

  async isAuthenticated(): Promise<boolean> {
    return this.isLoggedIn;
  }

  async getCurrentUser(): Promise<User | null> {
    return this.isLoggedIn ? this.mockUser : null;
  }

  async login(credentials: LoginCredentials): Promise<void> {
    this.logger.debug('Mock login');

    // Simulate slight delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Update mock user with provided email
    this.mockUser = {
      ...this.mockUser,
      email: credentials.email,
      name: credentials.email.split('@')[0],
      displayName: credentials.email.split('@')[0],
      updatedAt: new Date(),
    };

    this.isLoggedIn = true;
    this.notifyListeners();
  }

  async register(credentials: RegisterCredentials): Promise<void> {
    this.logger.debug('Mock registration');

    // Simulate slight delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Update mock user with provided credentials
    this.mockUser = {
      uid: 'local-user',
      email: credentials.email,
      name: credentials.name || credentials.email.split('@')[0],
      displayName: credentials.name || credentials.email.split('@')[0],
      dateOfBirth: credentials.dateOfBirth,
      sex: credentials.sex,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.isLoggedIn = true;
    this.notifyListeners();
  }

  async logout(): Promise<void> {
    this.logger.debug('Mock logout');

    // Simulate slight delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.isLoggedIn = false;
    this.notifyListeners();
  }

  async resetPassword(email: string): Promise<void> {
    this.logger.debug('Mock password reset');

    // Simulate slight delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // In local mode, just log the reset
    this.logger.info('Password reset email sent (simulated)');
  }

  async updateProfile(updates: UserProfileUpdate): Promise<void> {
    this.logger.debug('Mock profile update');

    // Simulate slight delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Update mock user
    this.mockUser = {
      ...this.mockUser,
      ...updates,
      updatedAt: new Date(),
    };

    this.notifyListeners();
  }

  async updateEmail(newEmail: string, password: string): Promise<void> {
    this.logger.debug('Mock email update');

    // Simulate slight delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Update mock user email
    this.mockUser = {
      ...this.mockUser,
      email: newEmail,
      updatedAt: new Date(),
    };

    this.notifyListeners();
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    this.logger.debug('Mock password update');

    // Simulate slight delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.logger.info('Password updated (simulated)');
  }

  async deleteAccount(password: string): Promise<void> {
    this.logger.debug('Mock account deletion');

    // Simulate slight delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.isLoggedIn = false;
    this.notifyListeners();
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback);

    // Immediately call with current state
    callback(this.isLoggedIn ? this.mockUser : null);

    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    const user = this.isLoggedIn ? this.mockUser : null;
    this.authStateListeners.forEach((listener) => {
      try {
        listener(user);
      } catch (error) {
        this.logger.error('Error in auth state listener', error);
      }
    });
  }
}

/**
 * @deprecated Use InMemoryAccountService instead. Kept for backward compatibility.
 */
export const LocalAccountService = InMemoryAccountService;
