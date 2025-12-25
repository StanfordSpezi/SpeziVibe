/**
 * Integration tests for FirebaseAccountService using Firebase Emulator
 *
 * These tests use the real Firebase SDK connected to the local emulator.
 * Make sure the emulator is running before running these tests:
 *   npm run emulator:start
 *
 * Then run the tests:
 *   npm run test:integration
 */

import { FirebaseAccountService } from '../../services/firebase-account-service';
import { AccountErrorCode } from '@spezivibe/account';

describe('FirebaseAccountService Integration Tests', () => {
  let service: FirebaseAccountService;

  // Use emulator configuration
  const emulatorConfig = {
    apiKey: 'demo-test-api-key',
    authDomain: 'demo-test.firebaseapp.com',
    projectId: 'demo-test',
    storageBucket: 'demo-test.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:demo',
    useEmulator: true,
    emulatorConfig: {
      authHost: '127.0.0.1',
      authPort: 9099,
      firestoreHost: '127.0.0.1',
      firestorePort: 8080,
    },
  };

  // Generate unique email for each test run to avoid conflicts
  const generateTestEmail = () => `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;

  beforeAll(async () => {
    // Create service and initialize once for all tests
    service = new FirebaseAccountService(emulatorConfig);
    await service.initialize();
  });

  afterAll(() => {
    // Cleanup
    service.cleanup?.();
  });

  afterEach(async () => {
    // Logout after each test to ensure clean state
    try {
      await service.logout();
    } catch {
      // Ignore if not logged in
    }
  });

  describe('initialization', () => {
    it('should initialize and connect to emulator', async () => {
      // Service was initialized in beforeAll
      const isAuth = await service.isAuthenticated();
      expect(isAuth).toBe(false);
    });

    it('should have no user initially', async () => {
      const user = await service.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('registration flow', () => {
    it('should register a new user successfully', async () => {
      const email = generateTestEmail();
      const password = 'TestPassword123!';

      await service.register({
        email,
        password,
        name: { givenName: 'Test', familyName: 'User' },
      });

      const user = await service.getCurrentUser();
      expect(user).not.toBeNull();
      expect(user?.email).toBe(email);
      expect(user?.name?.givenName).toBe('Test');
      expect(user?.name?.familyName).toBe('User');
    });

    it('should register with profile data', async () => {
      const email = generateTestEmail();
      const password = 'TestPassword123!';
      const dateOfBirth = new Date('1990-05-15');

      await service.register({
        email,
        password,
        name: { givenName: 'John', familyName: 'Doe' },
        dateOfBirth,
        sex: 'male',
      });

      const user = await service.getCurrentUser();
      expect(user).not.toBeNull();
      expect(user?.sex).toBe('male');
      expect(user?.dateOfBirth).toBeInstanceOf(Date);
    });

    it('should fail to register with invalid email', async () => {
      await expect(
        service.register({
          email: 'invalid-email',
          password: 'TestPassword123!',
        })
      ).rejects.toMatchObject({
        message: expect.stringMatching(/email/i),
      });
    });

    it('should fail to register with weak password', async () => {
      const email = generateTestEmail();

      await expect(
        service.register({
          email,
          password: '123', // Too short
        })
      ).rejects.toThrow();
    });

    it('should fail to register with duplicate email', async () => {
      const email = generateTestEmail();
      const password = 'TestPassword123!';

      // First registration should succeed
      await service.register({ email, password });
      await service.logout();

      // Second registration with same email should fail
      await expect(
        service.register({ email, password })
      ).rejects.toMatchObject({
        code: AccountErrorCode.EMAIL_IN_USE,
      });
    });
  });

  describe('login flow', () => {
    const testEmail = generateTestEmail();
    const testPassword = 'TestPassword123!';

    beforeAll(async () => {
      // Create a test user for login tests
      await service.register({ email: testEmail, password: testPassword });
      await service.logout();
    });

    it('should login with valid credentials', async () => {
      await service.login({ email: testEmail, password: testPassword });

      const isAuth = await service.isAuthenticated();
      expect(isAuth).toBe(true);

      const user = await service.getCurrentUser();
      expect(user?.email).toBe(testEmail);
    });

    it('should fail to login with wrong password', async () => {
      await expect(
        service.login({ email: testEmail, password: 'WrongPassword123!' })
      ).rejects.toMatchObject({
        code: AccountErrorCode.WRONG_PASSWORD,
      });
    });

    it('should fail to login with non-existent user', async () => {
      await expect(
        service.login({ email: 'nonexistent@example.com', password: testPassword })
      ).rejects.toMatchObject({
        code: AccountErrorCode.USER_NOT_FOUND,
      });
    });

    it('should fail to login with invalid email format', async () => {
      await expect(
        service.login({ email: 'not-an-email', password: testPassword })
      ).rejects.toThrow();
    });
  });

  describe('logout flow', () => {
    it('should logout successfully', async () => {
      const email = generateTestEmail();
      await service.register({ email, password: 'TestPassword123!' });

      expect(await service.isAuthenticated()).toBe(true);

      await service.logout();

      expect(await service.isAuthenticated()).toBe(false);
      expect(await service.getCurrentUser()).toBeNull();
    });
  });

  describe('profile management', () => {
    let testEmail: string;
    const testPassword = 'TestPassword123!';

    beforeEach(async () => {
      testEmail = generateTestEmail();
      await service.register({
        email: testEmail,
        password: testPassword,
        name: { givenName: 'Original', familyName: 'Name' },
      });
    });

    it('should update profile name', async () => {
      await service.updateProfile({
        name: { givenName: 'Updated', familyName: 'User' },
      });

      const user = await service.getCurrentUser();
      expect(user?.name?.givenName).toBe('Updated');
      expect(user?.name?.familyName).toBe('User');
    });

    it('should update profile with multiple fields', async () => {
      await service.updateProfile({
        name: { givenName: 'John', familyName: 'Doe' },
        biography: 'Test bio',
        phoneNumber: '+1234567890',
      });

      const user = await service.getCurrentUser();
      expect(user?.biography).toBe('Test bio');
      expect(user?.phoneNumber).toBe('+1234567890');
    });

    it('should persist profile across logout/login', async () => {
      await service.updateProfile({
        biography: 'Persistent bio',
      });

      await service.logout();
      await service.login({ email: testEmail, password: testPassword });

      const user = await service.getCurrentUser();
      expect(user?.biography).toBe('Persistent bio');
    });

    it('should clear profile field when set to null', async () => {
      // First set a biography
      await service.updateProfile({ biography: 'Initial bio' });
      let user = await service.getCurrentUser();
      expect(user?.biography).toBe('Initial bio');

      // Then clear it
      await service.updateProfile({ biography: null as any });

      // Re-fetch to verify
      await service.logout();
      await service.login({ email: testEmail, password: testPassword });

      user = await service.getCurrentUser();
      expect(user?.biography).toBeUndefined();
    });
  });

  describe('password reset', () => {
    it('should send password reset email', async () => {
      const email = generateTestEmail();
      await service.register({ email, password: 'TestPassword123!' });
      await service.logout();

      // In emulator, this doesn't actually send an email but should not throw
      await expect(service.resetPassword(email)).resolves.not.toThrow();
    });

    it('should handle reset for non-existent email gracefully', async () => {
      // Firebase may or may not throw for non-existent emails depending on settings
      // In emulator it typically doesn't throw for security reasons
      await expect(
        service.resetPassword('nonexistent@example.com')
      ).resolves.not.toThrow();
    });
  });

  describe('email update', () => {
    it('should update email with correct password', async () => {
      const originalEmail = generateTestEmail();
      const newEmail = generateTestEmail();
      const password = 'TestPassword123!';

      await service.register({ email: originalEmail, password });

      await service.updateEmail(newEmail, password);

      const user = await service.getCurrentUser();
      expect(user?.email).toBe(newEmail);
    });

    it('should fail to update email with wrong password', async () => {
      const email = generateTestEmail();
      await service.register({ email, password: 'TestPassword123!' });

      await expect(
        service.updateEmail(generateTestEmail(), 'WrongPassword!')
      ).rejects.toThrow();
    });
  });

  describe('password update', () => {
    it('should update password successfully', async () => {
      const email = generateTestEmail();
      const oldPassword = 'OldPassword123!';
      const newPassword = 'NewPassword456!';

      await service.register({ email, password: oldPassword });

      await service.updatePassword(oldPassword, newPassword);

      // Verify by logging out and back in with new password
      await service.logout();
      await expect(
        service.login({ email, password: newPassword })
      ).resolves.not.toThrow();
    });

    it('should fail to update password with wrong current password', async () => {
      const email = generateTestEmail();
      await service.register({ email, password: 'TestPassword123!' });

      await expect(
        service.updatePassword('WrongPassword!', 'NewPassword456!')
      ).rejects.toThrow();
    });
  });

  describe('account deletion', () => {
    it('should delete account successfully', async () => {
      const email = generateTestEmail();
      const password = 'TestPassword123!';

      await service.register({ email, password });
      expect(await service.isAuthenticated()).toBe(true);

      await service.deleteAccount(password);

      expect(await service.isAuthenticated()).toBe(false);
      expect(await service.getCurrentUser()).toBeNull();

      // Verify account is actually deleted by trying to login
      await expect(
        service.login({ email, password })
      ).rejects.toMatchObject({
        code: AccountErrorCode.USER_NOT_FOUND,
      });
    });

    it('should fail to delete account with wrong password', async () => {
      const email = generateTestEmail();
      await service.register({ email, password: 'TestPassword123!' });

      await expect(
        service.deleteAccount('WrongPassword!')
      ).rejects.toThrow();

      // Account should still exist
      expect(await service.isAuthenticated()).toBe(true);
    });
  });

  describe('auth state listeners', () => {
    it('should notify listeners on login', async () => {
      const email = generateTestEmail();
      const password = 'TestPassword123!';

      await service.register({ email, password });
      await service.logout();

      const listener = jest.fn();
      const unsubscribe = service.onAuthStateChanged(listener);

      // Initial call with null (not logged in)
      expect(listener).toHaveBeenCalledWith(null);
      listener.mockClear();

      await service.login({ email, password });

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ email })
      );

      unsubscribe();
    });

    it('should notify listeners on logout', async () => {
      const email = generateTestEmail();
      await service.register({ email, password: 'TestPassword123!' });

      const listener = jest.fn();
      const unsubscribe = service.onAuthStateChanged(listener);
      listener.mockClear();

      await service.logout();

      expect(listener).toHaveBeenCalledWith(null);

      unsubscribe();
    });

    it('should stop notifications after unsubscribe', async () => {
      const email = generateTestEmail();
      await service.register({ email, password: 'TestPassword123!' });
      await service.logout();

      const listener = jest.fn();
      const unsubscribe = service.onAuthStateChanged(listener);
      listener.mockClear();

      unsubscribe();

      await service.login({ email, password: 'TestPassword123!' });

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
