/**
 * Platform Registry
 *
 * Discovers and registers available platform generators.
 * New platforms are added by importing and registering them here.
 */

import type { PlatformGenerator } from './types.js';
import { ReactNativePlatformGenerator } from './react-native/index.js';
import { SwiftPlatformGenerator } from './swift/index.js';

const platforms: PlatformGenerator[] = [
  new ReactNativePlatformGenerator(),
  new SwiftPlatformGenerator(),
];

/**
 * Get all registered platform generators
 */
export function getAvailablePlatforms(): PlatformGenerator[] {
  return platforms;
}

/**
 * Get only platforms that are ready for use (not stubs)
 */
export function getReadyPlatforms(): PlatformGenerator[] {
  return platforms.filter((p) => p.ready !== false);
}

/**
 * Get a platform generator by ID
 */
export function getPlatform(id: string): PlatformGenerator | undefined {
  return platforms.find((p) => p.id === id);
}
