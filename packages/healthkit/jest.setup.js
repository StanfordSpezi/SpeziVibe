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
  appOwnership: null, // null means standalone/dev client build (not Expo Go)
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
            quantity: mockHealthData[type],
            unit: 'count',
            startDate: new Date(),
            endDate: new Date(),
            uuid: 'mock-uuid',
            quantityType: type,
            metadata: {},
          }
        : undefined
    );
  }),
  queryQuantitySamples: jest.fn(() => Promise.resolve([])),
  queryStatisticsForQuantity: jest.fn(() =>
    Promise.resolve({
      sumQuantity: { quantity: 0, unit: 'count' },
    })
  ),
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
