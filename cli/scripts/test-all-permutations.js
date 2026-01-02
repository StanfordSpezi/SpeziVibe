#!/usr/bin/env node

/**
 * Comprehensive test script that verifies all feature permutations generate valid apps.
 * Each generated app is verified with TypeScript compilation.
 */

import { generateProject } from '../dist/generator.js';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

const TEST_BASE_DIR = '/tmp/spezivibe-permutation-tests';

// Define all test configurations
const testConfigurations = [
  // Minimal configurations
  {
    name: 'minimal-local',
    displayName: 'Minimal Local App',
    backend: 'local',
    features: [],
    llmProviders: [],
  },
  {
    name: 'minimal-firebase',
    displayName: 'Minimal Firebase App',
    backend: 'firebase',
    features: [],
    llmProviders: [],
  },

  // Single feature configurations
  {
    name: 'chat-only',
    displayName: 'Chat Only App',
    backend: 'local',
    features: ['chat'],
    llmProviders: ['openai'],
  },
  {
    name: 'scheduler-only',
    displayName: 'Scheduler Only App',
    backend: 'local',
    features: ['scheduler'],
    llmProviders: [],
  },
  {
    name: 'questionnaire-only',
    displayName: 'Questionnaire Only App',
    backend: 'local',
    features: ['questionnaire'],
    llmProviders: [],
  },
  {
    name: 'onboarding-only',
    displayName: 'Onboarding Only App',
    backend: 'local',
    features: ['onboarding'],
    llmProviders: [],
  },

  // Common combinations
  {
    name: 'chat-scheduler',
    displayName: 'Chat and Scheduler App',
    backend: 'local',
    features: ['chat', 'scheduler'],
    llmProviders: ['openai'],
  },
  {
    name: 'onboarding-questionnaire',
    displayName: 'Onboarding Questionnaire App',
    backend: 'local',
    features: ['onboarding', 'questionnaire'],
    llmProviders: [],
  },
  {
    name: 'firebase-onboarding-questionnaire',
    displayName: 'Firebase Onboarding App',
    backend: 'firebase',
    features: ['onboarding', 'questionnaire'],
    llmProviders: [],
  },

  // All features
  {
    name: 'all-features-local',
    displayName: 'All Features Local App',
    backend: 'local',
    features: ['chat', 'scheduler', 'questionnaire', 'onboarding'],
    llmProviders: ['openai', 'anthropic', 'google'],
  },
  {
    name: 'all-features-firebase',
    displayName: 'All Features Firebase App',
    backend: 'firebase',
    features: ['chat', 'scheduler', 'questionnaire', 'onboarding'],
    llmProviders: ['openai', 'anthropic', 'google'],
  },

  // Edge cases
  {
    name: 'chat-all-providers',
    displayName: 'Chat All Providers App',
    backend: 'local',
    features: ['chat'],
    llmProviders: ['openai', 'anthropic', 'google'],
  },
  {
    name: 'scheduler-questionnaire',
    displayName: 'Scheduler Questionnaire App',
    backend: 'firebase',
    features: ['scheduler', 'questionnaire'],
    llmProviders: [],
  },
];

async function runTest(config, index, total) {
  const outputDir = path.join(TEST_BASE_DIR, config.name);
  const exportDir = path.join(TEST_BASE_DIR, `${config.name}-export`);
  const startTime = Date.now();

  console.log(`\n[${ index + 1}/${total}] Testing: ${config.name}`);
  console.log(`    Backend: ${config.backend}`);
  console.log(`    Features: ${config.features.length > 0 ? config.features.join(', ') : 'none'}`);
  console.log(`    LLM Providers: ${config.llmProviders.length > 0 ? config.llmProviders.join(', ') : 'none'}`);

  try {
    // Clean up any existing test output
    if (await fs.pathExists(outputDir)) {
      await fs.remove(outputDir);
    }
    if (await fs.pathExists(exportDir)) {
      await fs.remove(exportDir);
    }

    // Generate the project
    await generateProject({
      projectName: config.name,
      displayName: config.displayName,
      backend: config.backend,
      features: config.features,
      llmProviders: config.llmProviders,
      outputDir,
    });

    // Install dependencies
    console.log('    Installing dependencies...');
    execSync('npm install', {
      cwd: outputDir,
      stdio: 'pipe',
      timeout: 180000, // 3 minutes
    });

    // Run TypeScript check
    console.log('    Running TypeScript check...');
    execSync('npx tsc --noEmit', {
      cwd: outputDir,
      stdio: 'pipe',
      timeout: 60000, // 1 minute
    });

    // Run Expo export to verify the app actually bundles
    console.log('    Running Expo export...');
    execSync(`npx expo export --platform web --output-dir "${exportDir}"`, {
      cwd: outputDir,
      stdio: 'pipe',
      timeout: 120000, // 2 minutes
    });

    // Clean up export directory
    await fs.remove(exportDir);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`    ✅ PASSED (${duration}s)`);

    return { name: config.name, success: true, duration };
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`    ❌ FAILED (${duration}s)`);
    console.log(`    Error: ${error.message}`);

    // Try to get more details from tsc output
    if (error.stdout) {
      console.log(`    stdout: ${error.stdout.toString().slice(0, 500)}`);
    }
    if (error.stderr) {
      console.log(`    stderr: ${error.stderr.toString().slice(0, 500)}`);
    }

    return { name: config.name, success: false, duration, error: error.message };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('SpeziVibe CLI - Comprehensive Permutation Tests');
  console.log('='.repeat(60));
  console.log(`\nTesting ${testConfigurations.length} configurations...\n`);

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

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`\nTotal: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`Duration: ${totalDuration}s`);

  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  ❌ ${r.name}: ${r.error}`);
    });
    console.log('');
    process.exit(1);
  } else {
    console.log('\n✅ All permutation tests passed!\n');

    // Clean up on success
    await fs.remove(TEST_BASE_DIR);
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
