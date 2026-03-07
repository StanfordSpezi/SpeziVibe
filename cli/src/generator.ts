/**
 * Project generation orchestrator
 *
 * Thin wrapper that delegates to the appropriate PlatformGenerator.
 * The actual generation logic lives in platforms/react-native/index.ts.
 */

import type { ProjectOptions } from './types.js';
import type { PlatformGenerator } from './platforms/types.js';
import { getPlatform } from './platforms/registry.js';
import {
  blank,
  heading,
  command,
  note,
} from './pretty.js';

/**
 * Main project generation function
 * Delegates to the appropriate platform generator
 */
export async function generateProject(
  options: ProjectOptions,
  platformId = 'react-native'
): Promise<{ duration: number }> {
  const platform = getPlatform(platformId);
  if (!platform) {
    throw new Error(`Unknown platform: ${platformId}`);
  }

  const result = await platform.generate({
    projectName: options.projectName,
    displayName: options.displayName,
    backend: options.backend,
    features: options.features,
    llmProviders: options.llmProviders,
    outputDir: options.outputDir,
    envValues: options.envValues,
  });

  return { duration: result.duration };
}

/**
 * Get the platform generator instance
 */
export function getPlatformGenerator(platformId = 'react-native'): PlatformGenerator {
  const platform = getPlatform(platformId);
  if (!platform) {
    throw new Error(`Unknown platform: ${platformId}`);
  }
  return platform;
}

/**
 * Print next steps for the user
 */
export function printNextSteps(
  options: ProjectOptions,
  dependenciesInstalled = false,
  platformId = 'react-native'
): void {
  blank();
  heading('Next steps');
  blank();

  const platform = getPlatformGenerator(platformId);
  let steps = platform.getNextSteps({
    projectName: options.projectName,
    displayName: options.displayName,
    backend: options.backend,
    features: options.features,
    llmProviders: options.llmProviders,
    outputDir: options.outputDir,
    envValues: options.envValues,
  });

  if (dependenciesInstalled) {
    steps = steps.filter((step) => step !== 'npm install');
  }

  for (const step of steps) {
    command(step);
  }
  blank();

  note('See GETTING_STARTED.md for setup details');
  blank();
}
