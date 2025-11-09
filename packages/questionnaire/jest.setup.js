// Mock React Native components for testing
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  RN.Platform.OS = 'ios';

  return RN;
});

// Silence console errors during tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
