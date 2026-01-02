import { InMemoryAccountService } from '../services/in-memory-account-service';

describe('InMemoryAccountService', () => {
  let service: InMemoryAccountService;

  beforeEach(() => {
    // Tests use startUnauthenticated mode to verify auth flows
    service = new InMemoryAccountService({ startUnauthenticated: true });
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await expect(service.initialize()).resolves.not.toThrow();
    });

    it('should be unauthenticated when startUnauthenticated is true', async () => {
      await service.initialize();
      const isAuth = await service.isAuthenticated();
      expect(isAuth).toBe(false);
    });

    it('should have no user when startUnauthenticated is true', async () => {
      await service.initialize();
      const user = await service.getCurrentUser();
      expect(user).toBeNull();
    });

    it('should be authenticated by default (no options)', async () => {
      const defaultService = new InMemoryAccountService();
      await defaultService.initialize();
      const isAuth = await defaultService.isAuthenticated();
      expect(isAuth).toBe(true);
    });

    it('should have default local user by default (no options)', async () => {
      const defaultService = new InMemoryAccountService();
      await defaultService.initialize();
      const user = await defaultService.getCurrentUser();
      expect(user).not.toBeNull();
      expect(user?.email).toBe('local@example.com');
    });

    it('should be authenticated with initialUser option', async () => {
      const serviceWithUser = new InMemoryAccountService({
        initialUser: {
          uid: 'test-user',
          email: 'test@example.com',
        },
      });
      await serviceWithUser.initialize();
      const isAuth = await serviceWithUser.isAuthenticated();
      expect(isAuth).toBe(true);
    });

    it('should have the provided user with initialUser option', async () => {
      const serviceWithUser = new InMemoryAccountService({
        initialUser: {
          uid: 'test-user',
          email: 'test@example.com',
        },
      });
      await serviceWithUser.initialize();
      const user = await serviceWithUser.getCurrentUser();
      expect(user).not.toBeNull();
      expect(user?.uid).toBe('test-user');
      expect(user?.email).toBe('test@example.com');
    });
  });

  describe('login', () => {
    it('should update user email on login', async () => {
      await service.initialize();

      await service.login({ email: 'newuser@example.com', password: 'password' });

      const user = await service.getCurrentUser();
      expect(user?.email).toBe('newuser@example.com');
    });

    it('should set user name from email', async () => {
      await service.initialize();

      await service.login({ email: 'john.doe@example.com', password: 'password' });

      const user = await service.getCurrentUser();
      expect(user?.name?.givenName).toBe('john.doe');
    });

    it('should notify auth state listeners', async () => {
      await service.initialize();
      const listener = jest.fn();
      service.onAuthStateChanged(listener);
      listener.mockClear(); // Clear the immediate call

      await service.login({ email: 'test@example.com', password: 'password' });

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com' })
      );
    });
  });

  describe('register', () => {
    it('should create user with provided credentials', async () => {
      await service.initialize();

      await service.register({
        email: 'newuser@example.com',
        password: 'password',
        name: {
          givenName: 'New',
          familyName: 'User',
        },
        dateOfBirth: new Date('1995-05-15'),
        sex: 'female',
      });

      const user = await service.getCurrentUser();
      expect(user?.email).toBe('newuser@example.com');
      expect(user?.name?.givenName).toBe('New');
      expect(user?.name?.familyName).toBe('User');
      expect(user?.dateOfBirth).toEqual(new Date('1995-05-15'));
      expect(user?.sex).toBe('female');
    });

    it('should use email username if name not provided', async () => {
      await service.initialize();

      await service.register({
        email: 'jane.smith@example.com',
        password: 'password',
      });

      const user = await service.getCurrentUser();
      expect(user?.name?.givenName).toBe('jane.smith');
    });
  });

  describe('logout', () => {
    it('should set authentication to false', async () => {
      await service.initialize();
      await service.login({ email: 'test@example.com', password: 'password' });

      await service.logout();

      const isAuth = await service.isAuthenticated();
      expect(isAuth).toBe(false);
    });

    it('should clear current user', async () => {
      await service.initialize();
      await service.login({ email: 'test@example.com', password: 'password' });

      await service.logout();

      const user = await service.getCurrentUser();
      expect(user).toBeNull();
    });

    it('should notify listeners of logout', async () => {
      await service.initialize();
      await service.login({ email: 'test@example.com', password: 'password' });
      const listener = jest.fn();
      service.onAuthStateChanged(listener);
      listener.mockClear();

      await service.logout();

      expect(listener).toHaveBeenCalledWith(null);
    });
  });

  describe('resetPassword', () => {
    it('should resolve successfully', async () => {
      await service.initialize();

      await expect(service.resetPassword('test@example.com')).resolves.not.toThrow();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile fields', async () => {
      await service.initialize();
      await service.login({ email: 'test@example.com', password: 'password' });

      await service.updateProfile({
        name: {
          givenName: 'Updated',
          familyName: 'Name',
        },
        phoneNumber: '+1234567890',
        biography: 'Test bio',
      });

      const user = await service.getCurrentUser();
      expect(user?.name?.givenName).toBe('Updated');
      expect(user?.name?.familyName).toBe('Name');
      expect(user?.phoneNumber).toBe('+1234567890');
      expect(user?.biography).toBe('Test bio');
    });

    it('should throw error when not authenticated', async () => {
      await service.initialize();

      await expect(
        service.updateProfile({ name: { givenName: 'Test' } })
      ).rejects.toThrow('No authenticated user');
    });

    it('should update timestamp', async () => {
      await service.initialize();
      await service.login({ email: 'test@example.com', password: 'password' });
      const originalUser = await service.getCurrentUser();
      const originalUpdatedAt = originalUser?.updatedAt;

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      await service.updateProfile({
        name: {
          givenName: 'New',
          familyName: 'Name',
        },
      });

      const updatedUser = await service.getCurrentUser();
      expect(updatedUser?.updatedAt).not.toEqual(originalUpdatedAt);
    });

    it('should notify listeners of profile update', async () => {
      await service.initialize();
      await service.login({ email: 'test@example.com', password: 'password' });
      const listener = jest.fn();
      service.onAuthStateChanged(listener);
      listener.mockClear();

      await service.updateProfile({
        name: {
          givenName: 'Updated',
        },
      });

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.objectContaining({ givenName: 'Updated' })
        })
      );
    });
  });

  describe('updateEmail', () => {
    it('should update email address', async () => {
      await service.initialize();
      await service.login({ email: 'test@example.com', password: 'password' });

      await service.updateEmail!('newemail@example.com', 'password');

      const user = await service.getCurrentUser();
      expect(user?.email).toBe('newemail@example.com');
    });

    it('should throw error when not authenticated', async () => {
      await service.initialize();

      await expect(
        service.updateEmail!('newemail@example.com', 'password')
      ).rejects.toThrow('No authenticated user');
    });
  });

  describe('updatePassword', () => {
    it('should resolve successfully', async () => {
      await service.initialize();
      await service.login({ email: 'test@example.com', password: 'password' });

      await expect(
        service.updatePassword!('oldPassword', 'newPassword')
      ).resolves.not.toThrow();
    });

    it('should throw error when not authenticated', async () => {
      await service.initialize();

      await expect(
        service.updatePassword!('oldPassword', 'newPassword')
      ).rejects.toThrow('No authenticated user');
    });
  });

  describe('deleteAccount', () => {
    it('should log out user', async () => {
      await service.initialize();
      await service.login({ email: 'test@example.com', password: 'password' });

      await service.deleteAccount!('password');

      const isAuth = await service.isAuthenticated();
      expect(isAuth).toBe(false);
    });

    it('should throw error when not authenticated', async () => {
      await service.initialize();

      await expect(
        service.deleteAccount!('password')
      ).rejects.toThrow('No authenticated user');
    });
  });

  describe('onAuthStateChanged', () => {
    it('should call listener immediately with current state (unauthenticated)', async () => {
      await service.initialize();
      const listener = jest.fn();

      service.onAuthStateChanged(listener);

      expect(listener).toHaveBeenCalledWith(null);
    });

    it('should call listener immediately with current state (authenticated)', async () => {
      const authService = new InMemoryAccountService({
        initialUser: { uid: 'test', email: 'test@example.com' },
      });
      await authService.initialize();
      const listener = jest.fn();

      authService.onAuthStateChanged(listener);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com' })
      );
    });

    it('should return unsubscribe function', async () => {
      await service.initialize();
      const listener = jest.fn();

      const unsubscribe = service.onAuthStateChanged(listener);
      listener.mockClear();

      unsubscribe();
      await service.login({ email: 'test@example.com', password: 'password' });

      // Listener should not be called after unsubscribe
      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle multiple listeners', async () => {
      await service.initialize();
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      service.onAuthStateChanged(listener1);
      service.onAuthStateChanged(listener2);
      listener1.mockClear();
      listener2.mockClear();

      await service.login({ email: 'test@example.com', password: 'password' });

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should clear all listeners', async () => {
      const authService = new InMemoryAccountService({
        initialUser: { uid: 'test', email: 'test@example.com' },
      });
      await authService.initialize();
      const listener = jest.fn();
      authService.onAuthStateChanged(listener);
      listener.mockClear();

      authService.cleanup();
      await authService.login({ email: 'new@example.com', password: 'password' });

      // Listener should not be called after cleanup
      expect(listener).not.toHaveBeenCalled();
    });

    it('should reset authentication state', async () => {
      const authService = new InMemoryAccountService({
        initialUser: { uid: 'test', email: 'test@example.com' },
      });
      await authService.initialize();
      expect(await authService.isAuthenticated()).toBe(true);

      authService.cleanup();

      expect(await authService.isAuthenticated()).toBe(false);
      expect(await authService.getCurrentUser()).toBeNull();
    });
  });
});
