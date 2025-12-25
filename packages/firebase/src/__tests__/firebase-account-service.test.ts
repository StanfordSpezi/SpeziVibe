import { FirebaseAccountService } from '../services/firebase-account-service';
import { AccountErrorCode } from '@spezivibe/account';
import * as firebaseAuth from 'firebase/auth';
import * as firestore from 'firebase/firestore';

// Helper to create mock Firebase user
const createMockFirebaseUser = (overrides = {}) => ({
  uid: 'firebase-test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
  metadata: {
    creationTime: new Date('2024-01-01').toISOString(),
    lastSignInTime: new Date('2024-01-15').toISOString(),
  },
  ...overrides,
});

describe('FirebaseAccountService', () => {
  let service: FirebaseAccountService;
  const mockConfig = {
    apiKey: 'test-api-key',
    authDomain: 'test.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test.appspot.com',
    messagingSenderId: '123456789',
    appId: 'test-app-id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).resetFirebaseMocks();
    service = new FirebaseAccountService(mockConfig);
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await expect(service.initialize()).resolves.not.toThrow();
    });

    it('should throw error if config is missing', () => {
      expect(() => new FirebaseAccountService(null as any)).toThrow(
        'Firebase configuration is required'
      );
    });

    it('should not be authenticated initially', async () => {
      await service.initialize();
      const isAuth = await service.isAuthenticated();
      expect(isAuth).toBe(false);
    });

    it('should return null user initially', async () => {
      await service.initialize();
      const user = await service.getCurrentUser();
      expect(user).toBeNull();
    });

    it('should initialize Firebase app', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { initializeApp } = require('firebase/app');
      await service.initialize();
      expect(initializeApp).toHaveBeenCalledWith(mockConfig);
    });

    it('should initialize Firebase Auth', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { initializeAuth } = require('firebase/auth');
      await service.initialize();
      expect(initializeAuth).toHaveBeenCalled();
    });

    it('should initialize Firestore', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getFirestore } = require('firebase/firestore');
      await service.initialize();
      expect(getFirestore).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should login successfully with valid credentials', async () => {
      const mockUser = createMockFirebaseUser();
      (firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
        user: mockUser,
      });

      await service.login({ email: 'test@example.com', password: 'password123' });

      expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
    });

    it('should update current user after login', async () => {
      const mockUser = createMockFirebaseUser();
      (firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
        user: mockUser,
      });

      await service.login({ email: 'test@example.com', password: 'password123' });

      const currentUser = await service.getCurrentUser();
      expect(currentUser).not.toBeNull();
      expect(currentUser?.uid).toBe('firebase-test-user-123');
      expect(currentUser?.email).toBe('test@example.com');
    });

    it('should map Firebase error to AccountError', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const FirebaseError = require('firebase/app').FirebaseError;
      (firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(
        new FirebaseError('auth/wrong-password', 'Wrong password')
      );

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toMatchObject({
        code: AccountErrorCode.WRONG_PASSWORD,
      });
    });

    it('should throw service not initialized error if not initialized', async () => {
      const uninitializedService = new FirebaseAccountService(mockConfig);
      await expect(
        uninitializedService.login({ email: 'test@example.com', password: 'password' })
      ).rejects.toThrow('Firebase account service not initialized');
    });
  });

  describe('register', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should register successfully with valid credentials', async () => {
      const mockUser = createMockFirebaseUser();
      (firebaseAuth.createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
        user: mockUser,
      });

      await service.register({
        email: 'newuser@example.com',
        password: 'password123',
        name: { givenName: 'New', familyName: 'User' },
      });

      expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'newuser@example.com',
        'password123'
      );
    });

    it('should update Firebase profile with display name', async () => {
      const mockUser = createMockFirebaseUser();
      (firebaseAuth.createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
        user: mockUser,
      });

      await service.register({
        email: 'newuser@example.com',
        password: 'password123',
        name: { givenName: 'John', familyName: 'Doe' },
      });

      expect(firebaseAuth.updateProfile).toHaveBeenCalledWith(
        mockUser,
        expect.objectContaining({ displayName: expect.stringContaining('John') })
      );
    });

    it('should save user profile to Firestore', async () => {
      const mockUser = createMockFirebaseUser();
      (firebaseAuth.createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
        user: mockUser,
      });

      await service.register({
        email: 'newuser@example.com',
        password: 'password123',
        name: { givenName: 'John', familyName: 'Doe' },
        dateOfBirth: new Date('1990-01-01'),
        sex: 'male',
      });

      expect(firestore.setDoc).toHaveBeenCalled();
    });

    it('should handle registration with string name', async () => {
      const mockUser = createMockFirebaseUser();
      (firebaseAuth.createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
        user: mockUser,
      });

      await service.register({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'John Doe' as any,
      });

      expect(firebaseAuth.updateProfile).toHaveBeenCalled();
    });

    it('should map Firebase error to AccountError', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const FirebaseError = require('firebase/app').FirebaseError;
      (firebaseAuth.createUserWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(
        new FirebaseError('auth/email-already-in-use', 'Email already in use')
      );

      await expect(
        service.register({ email: 'existing@example.com', password: 'password' })
      ).rejects.toMatchObject({
        code: AccountErrorCode.EMAIL_IN_USE,
      });
    });
  });

  describe('logout', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should logout successfully', async () => {
      await service.logout();
      expect(firebaseAuth.signOut).toHaveBeenCalled();
    });

    it('should clear current user after logout', async () => {
      await service.logout();
      const user = await service.getCurrentUser();
      expect(user).toBeNull();
    });

    it('should handle logout error', async () => {
      (firebaseAuth.signOut as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(service.logout()).rejects.toThrow(
        'Failed to log out. Please try again.'
      );
    });
  });

  describe('resetPassword', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should send password reset email', async () => {
      await service.resetPassword('test@example.com');
      expect(firebaseAuth.sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com'
      );
    });

    it('should map Firebase error to AccountError', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const FirebaseError = require('firebase/app').FirebaseError;
      (firebaseAuth.sendPasswordResetEmail as jest.Mock).mockRejectedValueOnce(
        new FirebaseError('auth/user-not-found', 'User not found')
      );

      await expect(service.resetPassword('nonexistent@example.com')).rejects.toMatchObject({
        code: AccountErrorCode.USER_NOT_FOUND,
      });
    });
  });

  describe('updateProfile', () => {
    it('should throw error if not authenticated', async () => {
      await service.initialize();

      await expect(
        service.updateProfile({ name: { givenName: 'Test' } })
      ).rejects.toThrow('No authenticated user');
    });

    it('should update profile when authenticated', async () => {
      await service.initialize();

      // Login first to get authenticated (use default mock behavior which sets currentUser)
      await service.login({ email: 'test@example.com', password: 'password123' });

      // Now update profile
      await service.updateProfile({ name: { givenName: 'Updated', familyName: 'Name' } });

      expect(firebaseAuth.updateProfile).toHaveBeenCalled();
      expect(firestore.setDoc).toHaveBeenCalled();
    });

    it('should notify listeners after profile update', async () => {
      await service.initialize();

      // Login first
      await service.login({ email: 'test@example.com', password: 'password123' });

      const listener = jest.fn();
      service.onAuthStateChanged(listener);
      listener.mockClear();

      await service.updateProfile({ biography: 'New bio' });

      expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        biography: 'New bio',
      }));
    });
  });

  describe('updateEmail', () => {
    it('should throw error if not authenticated', async () => {
      await service.initialize();

      await expect(
        service.updateEmail('newemail@example.com', 'password')
      ).rejects.toThrow('No authenticated user');
    });

    it('should update email when authenticated', async () => {
      await service.initialize();

      // Login first
      await service.login({ email: 'test@example.com', password: 'password123' });

      await service.updateEmail('newemail@example.com', 'password123');

      expect(firebaseAuth.reauthenticateWithCredential).toHaveBeenCalled();
      expect(firebaseAuth.updateEmail).toHaveBeenCalledWith(
        expect.anything(),
        'newemail@example.com'
      );
      expect(firestore.setDoc).toHaveBeenCalled();
    });

  });

  describe('updatePassword', () => {
    it('should throw error if not authenticated', async () => {
      await service.initialize();

      await expect(
        service.updatePassword('oldpassword', 'newpassword')
      ).rejects.toThrow('No authenticated user');
    });

    it('should update password when authenticated', async () => {
      await service.initialize();

      // Login first
      await service.login({ email: 'test@example.com', password: 'password123' });

      await service.updatePassword('password123', 'newpassword456');

      expect(firebaseAuth.reauthenticateWithCredential).toHaveBeenCalled();
      expect(firebaseAuth.updatePassword).toHaveBeenCalledWith(
        expect.anything(),
        'newpassword456'
      );
    });
  });

  describe('deleteAccount', () => {
    it('should throw error if not authenticated', async () => {
      await service.initialize();

      await expect(service.deleteAccount('password')).rejects.toThrow(
        'No authenticated user'
      );
    });

    it('should delete account when authenticated', async () => {
      await service.initialize();

      // Login first
      await service.login({ email: 'test@example.com', password: 'password123' });

      await service.deleteAccount('password123');

      expect(firebaseAuth.reauthenticateWithCredential).toHaveBeenCalled();
      expect(firestore.deleteDoc).toHaveBeenCalled();
      expect(firebaseAuth.deleteUser).toHaveBeenCalled();
    });

    it('should clear current user after deletion', async () => {
      await service.initialize();

      // Login first
      await service.login({ email: 'test@example.com', password: 'password123' });

      await service.deleteAccount('password123');

      const user = await service.getCurrentUser();
      expect(user).toBeNull();
    });

    it('should notify listeners after deletion', async () => {
      await service.initialize();

      // Login first
      await service.login({ email: 'test@example.com', password: 'password123' });

      const listener = jest.fn();
      service.onAuthStateChanged(listener);
      listener.mockClear();

      await service.deleteAccount('password123');

      expect(listener).toHaveBeenCalledWith(null);
    });
  });

  describe('onAuthStateChanged', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should call listener immediately with current state', async () => {
      const listener = jest.fn();
      service.onAuthStateChanged(listener);

      expect(listener).toHaveBeenCalledWith(null);
    });

    it('should return unsubscribe function', () => {
      const listener = jest.fn();
      const unsubscribe = service.onAuthStateChanged(listener);

      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('profile loading from Firestore', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should handle missing Firestore profile gracefully', async () => {
      const mockUser = createMockFirebaseUser();
      (firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
        user: mockUser,
      });
      (firestore.getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => false,
        data: () => ({}),
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'password' })
      ).resolves.not.toThrow();
    });

    it('should handle legacy string name format from Firestore', async () => {
      const mockUser = createMockFirebaseUser();
      const mockProfileData = {
        name: 'John Doe', // Legacy string format
      };

      (firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
        user: mockUser,
      });
      (firestore.getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockProfileData,
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'password' })
      ).resolves.not.toThrow();
    });
  });
});
