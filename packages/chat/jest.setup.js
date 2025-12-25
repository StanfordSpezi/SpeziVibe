// Configure testing library defaults
import { configure } from '@testing-library/react-native';

configure({
  asyncUtilTimeout: 10000,
});

// Mock React Native
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Platform.OS = 'ios';
  return RN;
});

// Mock expo/fetch for AI SDK
jest.mock('expo/fetch', () => ({
  fetch: jest.fn(),
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock AI SDK
jest.mock('ai', () => ({
  streamText: jest.fn(),
  generateText: jest.fn(),
}));

jest.mock('@ai-sdk/openai', () => ({
  createOpenAI: jest.fn(() => jest.fn()),
}));

// Silence console errors during tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
