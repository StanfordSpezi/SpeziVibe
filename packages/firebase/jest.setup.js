// Configure testing library defaults for CI environments
import { configure } from '@testing-library/react-native';

configure({
  asyncUtilTimeout: 10000, // Increase default waitFor timeout for slower CI
});

// Mock React Native components for testing
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  RN.Platform.OS = 'ios';

  return RN;
});

// Mock AsyncStorage for auth persistence tests
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock Firebase modules
const mockFirebaseUser = {
  uid: 'firebase-test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
  metadata: {
    creationTime: new Date('2024-01-01').toISOString(),
    lastSignInTime: new Date('2024-01-15').toISOString(),
  },
};

let authStateCallback = null;
let mockCurrentUser = null;
let mockAuth = null;

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({ name: 'test-app' })),
  getApps: jest.fn(() => []),
  FirebaseError: class FirebaseError extends Error {
    constructor(code, message) {
      super(message);
      this.code = code;
      this.name = 'FirebaseError';
    }
  },
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => {
    if (!mockAuth) {
      mockAuth = {
        name: 'test-auth',
        get currentUser() {
          return mockCurrentUser;
        }
      };
    }
    return mockAuth;
  }),
  initializeAuth: jest.fn(() => {
    if (!mockAuth) {
      mockAuth = {
        name: 'test-auth',
        get currentUser() {
          return mockCurrentUser;
        }
      };
    }
    return mockAuth;
  }),
  signInWithEmailAndPassword: jest.fn((auth, email, password) => {
    mockCurrentUser = { ...mockFirebaseUser, email };
    return Promise.resolve({ user: mockCurrentUser });
  }),
  createUserWithEmailAndPassword: jest.fn((auth, email, password) => {
    mockCurrentUser = { ...mockFirebaseUser, email };
    return Promise.resolve({ user: mockCurrentUser });
  }),
  signOut: jest.fn(() => {
    mockCurrentUser = null;
    return Promise.resolve();
  }),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
  updateProfile: jest.fn(() => Promise.resolve()),
  updateEmail: jest.fn(() => Promise.resolve()),
  updatePassword: jest.fn(() => Promise.resolve()),
  EmailAuthProvider: {
    credential: jest.fn((email, password) => ({ email, password })),
  },
  reauthenticateWithCredential: jest.fn(() => Promise.resolve()),
  deleteUser: jest.fn(() => {
    mockCurrentUser = null;
    return Promise.resolve();
  }),
  onAuthStateChanged: jest.fn((auth, callback) => {
    authStateCallback = callback;
    // Immediately call with current state
    setTimeout(() => callback(mockCurrentUser), 0);
    return jest.fn(); // unsubscribe function
  }),
  getReactNativePersistence: jest.fn(() => 'react-native-persistence'),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({ name: 'test-firestore' })),
  doc: jest.fn((db, path) => ({ db, path })),
  setDoc: jest.fn(() => Promise.resolve()),
  getDoc: jest.fn(() =>
    Promise.resolve({
      exists: () => false,
      data: () => ({}),
    })
  ),
  deleteDoc: jest.fn(() => Promise.resolve()),
  deleteField: jest.fn(() => ({ _fieldValue: 'deleteField' })),
}));

// Helper to trigger auth state change in tests
global.triggerAuthStateChange = (user) => {
  if (authStateCallback) {
    authStateCallback(user);
  }
};

// Helper to reset Firebase mocks
global.resetFirebaseMocks = () => {
  mockCurrentUser = null;
  mockAuth = null;
  authStateCallback = null;
};

// Silence console errors/warnings during tests but keep original methods accessible
// Tests can access original console via global.originalConsole if needed
const originalConsole = { ...console };
global.originalConsole = originalConsole;

// Override console methods to silence output during tests
// Tests can still spy on these using jest.spyOn(console, 'error') etc.
console.error = jest.fn();
console.warn = jest.fn();
