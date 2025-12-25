/**
 * Test setup and mocks for Firebase SDK
 */

// Mock Firebase Auth User
export const createMockFirebaseUser = (overrides = {}) => ({
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

// Mock Firestore document
export const createMockFirestoreDoc = (data: any = {}) => ({
  exists: () => Object.keys(data).length > 0,
  data: () => data,
});

// Setup global mocks for Firebase modules
export const setupFirebaseMocks = () => {
  // These will be set up in jest.setup.js
  return {
    mockSignInWithEmailAndPassword: jest.fn(),
    mockCreateUserWithEmailAndPassword: jest.fn(),
    mockSignOut: jest.fn(),
    mockSendPasswordResetEmail: jest.fn(),
    mockUpdateProfile: jest.fn(),
    mockUpdateEmail: jest.fn(),
    mockUpdatePassword: jest.fn(),
    mockReauthenticateWithCredential: jest.fn(),
    mockDeleteUser: jest.fn(),
    mockOnAuthStateChanged: jest.fn(),
    mockGetDoc: jest.fn(),
    mockSetDoc: jest.fn(),
  };
};
