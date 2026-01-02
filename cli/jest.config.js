/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    // Map .js imports from test files to source files (without extension)
    '^(\\.{1,2}/.*)\\.(js)$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        useESM: true,
      },
    ],
  },
  testMatch: ['**/tests/**/*.test.ts'],
  testTimeout: 300000, // 5 minutes for smoke tests
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  rootDir: '.',
};
