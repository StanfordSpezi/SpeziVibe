/**
 * Jest configuration for integration tests using Firebase Emulator
 */
module.exports = {
  preset: 'react-native',
  testTimeout: 30000,
  setupFiles: ['./jest.integration.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-community|@react-navigation|@testing-library|firebase|@firebase)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs'],
  testMatch: ['**/__tests__/integration/**/*.test.ts?(x)'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': 'babel-jest',
  },
  // Don't run in parallel to avoid Firebase initialization conflicts
  maxWorkers: 1,
};
