/**
 * Jest setup for integration tests using Firebase Emulator
 *
 * This setup does NOT mock Firebase - it uses the real Firebase SDK
 * connected to the local emulator.
 */

// Configure testing library defaults
import { configure } from '@testing-library/react-native';

configure({
  asyncUtilTimeout: 15000, // Longer timeout for real Firebase operations
});

// Mock React Native components (still needed for React Native environment)
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Platform.OS = 'ios';
  return RN;
});

// Mock AsyncStorage for auth persistence
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// DO NOT mock firebase/app, firebase/auth, or firebase/firestore
// We want to use the real Firebase SDK connected to the emulator

// Silence console output during tests
console.error = jest.fn();
console.warn = jest.fn();

// Global test timeout for integration tests
jest.setTimeout(30000);
