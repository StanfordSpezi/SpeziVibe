import { AccountService, LoginCredentials, RegisterCredentials, User, UserProfileUpdate } from '../types';
import { createLogger } from '../utils';
import { parsePersonName, normalizePersonName } from '../utils/person-name';

/**
 * Configuration options for InMemoryAccountService
 */
export interface InMemoryAccountServiceOptions {
  /**
   * Initial user to pre-populate (for testing)
   * If provided, the service starts authenticated with this user
   */
  initialUser?: User;
}

/**
 * In-memory implementation of AccountService for development/testing
 *
 * This service simulates authentication without requiring a backend.
 * By default, it starts unauthenticated. You can provide an initial user
 * to start in an authenticated state.
 *
 * Use this service for:
 * - Local development without Firebase
 * - Testing UI flows without auth dependencies
 * - Offline-first applications
 */
export class InMemoryAccountService implements AccountService {
  private mockUser: User | null = null;
  private isLoggedIn: boolean = false;
  private authStateListeners: ((user: User | null) => void)[] = [];
  private logger = createLogger('InMemoryAccountService');

  constructor(private options: InMemoryAccountServiceOptions = {}) {
    if (options.initialUser) {
      this.mockUser = options.initialUser;
      this.isLoggedIn = true;
    }
  }

  async initialize(): Promise<void> {
    if (this.isLoggedIn) {
      this.logger.info('Initialized - starting with pre-configured user');
    } else {
      this.logger.info('Initialized - starting unauthenticated');
    }
    // Immediately notify listeners with current state
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

    // Create mock user with provided email
    // Parse email username as given name
    const emailUsername = credentials.email.split('@')[0];
    this.mockUser = {
      uid: 'local-user',
      email: credentials.email,
      name: parsePersonName(emailUsername),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.isLoggedIn = true;
    this.notifyListeners();
  }

  async register(credentials: RegisterCredentials): Promise<void> {
    this.logger.debug('Mock registration');

    // Simulate slight delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Normalize name: accept PersonName or string
    const name = credentials.name
      ? normalizePersonName(credentials.name)
      : parsePersonName(credentials.email.split('@')[0]);

    // Update mock user with provided credentials
    this.mockUser = {
      uid: 'local-user',
      email: credentials.email,
      name,
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
    if (!this.isLoggedIn || !this.mockUser) {
      throw new Error('No authenticated user');
    }

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
    if (!this.isLoggedIn || !this.mockUser) {
      throw new Error('No authenticated user');
    }

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
    if (!this.isLoggedIn || !this.mockUser) {
      throw new Error('No authenticated user');
    }

    this.logger.debug('Mock password update');

    // Simulate slight delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.logger.info('Password updated (simulated)');
  }

  async deleteAccount(password: string): Promise<void> {
    if (!this.isLoggedIn || !this.mockUser) {
      throw new Error('No authenticated user');
    }

    this.logger.debug('Mock account deletion');

    // Simulate slight delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.isLoggedIn = false;
    this.mockUser = null;
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

  /**
   * Cleanup resources and reset state
   */
  cleanup(): void {
    this.authStateListeners = [];
    this.mockUser = null;
    this.isLoggedIn = false;
    this.logger.info('Service cleanup completed');
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
