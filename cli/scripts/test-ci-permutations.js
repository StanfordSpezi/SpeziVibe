#!/usr/bin/env node

/**
 * CI-optimized permutation tests.
 * Tests the most important configurations to ensure coverage without excessive CI time.
 *
 * Key permutations tested:
 * 1. minimal-local - Base template with no features
 * 2. minimal-firebase - Firebase backend alone
 * 3. single-feature - One feature (scheduler) to test feature addition
 * 4. all-features-local - All features with local backend
 * 5. all-features-firebase - All features with Firebase backend
 */

import { generateProject } from '../dist/generator.js';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

const TEST_BASE_DIR = '/tmp/spezivibe-ci-tests';

// CI-optimized test configurations (5 key permutations)
const testConfigurations = [
  {
    name: 'minimal-local',
    displayName: 'Minimal Local App',
    backend: 'local',
    features: [],
    llmProviders: [],
    description: 'Base template, no features, local backend',
  },
  {
    name: 'minimal-firebase',
    displayName: 'Minimal Firebase App',
    backend: 'firebase',
    features: [],
    llmProviders: [],
    description: 'Base template, no features, Firebase backend',
  },
  {
    name: 'scheduler-only',
    displayName: 'Scheduler Only App',
    backend: 'local',
    features: ['scheduler'],
    llmProviders: [],
    description: 'Single feature to verify feature addition works',
  },
  {
    name: 'all-features-local',
    displayName: 'All Features Local App',
    backend: 'local',
    features: ['chat', 'scheduler', 'questionnaire', 'onboarding'],
    llmProviders: ['openai', 'anthropic', 'google'],
    description: 'All features with local backend',
  },
  {
    name: 'all-features-firebase',
    displayName: 'All Features Firebase App',
    backend: 'firebase',
    features: ['chat', 'scheduler', 'questionnaire', 'onboarding'],
    llmProviders: ['openai', 'anthropic', 'google'],
    description: 'All features with Firebase backend',
  },
];

async function runTest(config, index, total) {
  const outputDir = path.join(TEST_BASE_DIR, config.name);
  const exportDir = path.join(TEST_BASE_DIR, `${config.name}-export`);
  const startTime = Date.now();

  console.log(`\n[${ index + 1}/${total}] ${config.name}`);
  console.log(`    ${config.description}`);

  try {
    // Clean up any existing test output
    if (await fs.pathExists(outputDir)) {
      await fs.remove(outputDir);
    }
    if (await fs.pathExists(exportDir)) {
      await fs.remove(exportDir);
    }

    // Generate the project (suppress output for cleaner CI logs)
    const originalLog = console.log;
    console.log = () => {};

    await generateProject({
      projectName: config.name,
      displayName: config.displayName,
      backend: config.backend,
      features: config.features,
      llmProviders: config.llmProviders,
      outputDir,
    });

    console.log = originalLog;

    // Install dependencies
    process.stdout.write('    npm install... ');
    execSync('npm install', {
      cwd: outputDir,
      stdio: 'pipe',
      timeout: 180000,
    });
    process.stdout.write('done. ');

    // Run TypeScript check
    process.stdout.write('tsc... ');
    execSync('npx tsc --noEmit', {
      cwd: outputDir,
      stdio: 'pipe',
      timeout: 60000,
    });
    process.stdout.write('done. ');

    // Run Expo export to verify the app actually bundles
    process.stdout.write('expo export... ');
    execSync(`npx expo export --platform web --output-dir "${exportDir}"`, {
      cwd: outputDir,
      stdio: 'pipe',
      timeout: 120000, // 2 minutes for bundling
    });

    // Clean up export directory
    await fs.remove(exportDir);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ (${duration}s)`);

    return { name: config.name, success: true, duration };
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`❌ FAILED (${duration}s)`);

    // Get error details
    let errorMsg = error.message;
    if (error.stderr) {
      errorMsg = error.stderr.toString().split('\n').slice(0, 5).join('\n');
    }
    console.log(`    Error: ${errorMsg}`);

    return { name: config.name, success: false, duration, error: errorMsg };
  }
}

async function main() {
  console.log('SpeziVibe CLI - CI Permutation Tests');
  console.log('=' .repeat(50));

  // Check if we should skip smoke tests (for quick CI feedback)
  if (process.env.SKIP_SMOKE_TESTS === 'true') {
    console.log('\nSKIP_SMOKE_TESTS=true, skipping permutation tests');
    process.exit(0);
  }

  console.log(`\nTesting ${testConfigurations.length} key permutations...`);

  // Clean up test directory
  if (await fs.pathExists(TEST_BASE_DIR)) {
    await fs.remove(TEST_BASE_DIR);
  }
  await fs.ensureDir(TEST_BASE_DIR);

  const results = [];
  const startTime = Date.now();

  for (let i = 0; i < testConfigurations.length; i++) {
    const result = await runTest(testConfigurations[i], i, testConfigurations.length);
    results.push(result);
  }

  // Print summary
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('\n' + '='.repeat(50));
  console.log(`Results: ${passed}/${results.length} passed (${totalDuration}s)`);

  if (failed > 0) {
    console.log('\nFailed:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  ❌ ${r.name}`);
    });
    process.exit(1);
  } else {
    console.log('✅ All CI permutation tests passed!\n');
    // Clean up on success
    await fs.remove(TEST_BASE_DIR);
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
