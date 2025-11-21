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

// Silence console errors during tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
