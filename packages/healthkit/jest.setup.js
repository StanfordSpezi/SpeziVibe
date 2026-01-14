// Configure testing library defaults
import { configure } from '@testing-library/react-native';

configure({
  asyncUtilTimeout: 10000,
});

// Mock Platform - default to iOS for HealthKit tests
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Platform.OS = 'ios';
  return RN;
});

// Mock expo-constants for Expo Go detection
jest.mock('expo-constants', () => ({
  appOwnership: 'standalone', // Not Expo Go by default
}));

// Mock HealthKit native module
let mockAuthorized = false;
let mockHealthData = {};

jest.mock('@kingstinct/react-native-healthkit', () => ({
  requestAuthorization: jest.fn(() => {
    mockAuthorized = true;
    return Promise.resolve(true);
  }),
  isHealthDataAvailable: jest.fn(() => Promise.resolve(true)),
  getMostRecentQuantitySample: jest.fn((type) => {
    return Promise.resolve(
      mockHealthData[type]
        ? {
            value: mockHealthData[type],
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
          }
        : null
    );
  }),
  queryQuantitySamples: jest.fn(() => Promise.resolve([])),
  getStatisticsForQuantity: jest.fn(() => Promise.resolve({ sum: 0 })),
  subscribeToChanges: jest.fn(() => jest.fn()),
}));

// Test helpers - attached to global for use in tests
global.setMockHealthData = (type, value) => {
  mockHealthData[type] = value;
};

global.resetHealthKitMocks = () => {
  mockAuthorized = false;
  mockHealthData = {};
  jest.clearAllMocks();
};

global.setMockAuthorized = (authorized) => {
  mockAuthorized = authorized;
};

global.getMockAuthorized = () => mockAuthorized;

// Silence console errors during tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
