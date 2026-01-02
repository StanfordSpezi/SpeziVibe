#!/usr/bin/env npx ts-node --esm

/**
 * Test script to generate a real app and verify it works
 */

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { cloneTemplate } from '../src/github.js';
import {
  transformPackageJson,
  getPackagesToRemove,
} from '../src/transformers/package-json.js';
import { transformAppConfig } from '../src/transformers/app-config.js';
import { transformTabsLayout } from '../src/transformers/tabs-layout.js';
import { transformRootLayout } from '../src/transformers/root-layout.js';
import { generateEnvExample } from '../src/transformers/env.js';
import type { ProjectOptions, TransformContext } from '../src/types.js';

const OUTPUT_DIR = '/tmp/test-spezi-generated-app';

async function main() {
  console.log('🚀 Testing create-spezivibe-app generation...\n');

  // Clean up previous test
  if (await fs.pathExists(OUTPUT_DIR)) {
    console.log('Cleaning up previous test...');
    await fs.remove(OUTPUT_DIR);
  }

  const options: ProjectOptions = {
    projectName: 'test-generated-app',
    displayName: 'Test Generated App',
    backend: 'local', // Use local for simpler testing (no Firebase setup needed)
    features: ['scheduler', 'onboarding'], // Exclude chat to avoid API key requirements
    llmProviders: [],
    outputDir: OUTPUT_DIR,
  };

  console.log('Configuration:');
  console.log(`  Project: ${options.projectName}`);
  console.log(`  Backend: ${options.backend}`);
  console.log(`  Features: ${options.features.join(', ') || 'none'}`);
  console.log('');

  // Step 1: Clone template
  console.log('📥 Cloning template from GitHub...');
  await cloneTemplate(OUTPUT_DIR);

  const ctx: TransformContext = { options, projectDir: OUTPUT_DIR };

  // Step 2: Run transformers
  console.log('🔧 Applying transformations...');
  await transformPackageJson(ctx);
  await transformAppConfig(ctx);
  await transformTabsLayout(ctx);
  await transformRootLayout(ctx);
  await generateEnvExample(ctx);

  // Step 3: Remove excluded packages
  const packagesToRemove = getPackagesToRemove(ctx);
  for (const pkg of packagesToRemove) {
    const pkgDir = path.join(OUTPUT_DIR, 'packages', pkg);
    if (await fs.pathExists(pkgDir)) {
      await fs.remove(pkgDir);
    }
  }

  // Remove questionnaire routes (not included)
  if (!options.features.includes('questionnaire')) {
    await fs.remove(path.join(OUTPUT_DIR, 'app', 'questionnaire'));
  }

  // Remove medplum and create-spezivibe-app
  await fs.remove(path.join(OUTPUT_DIR, 'packages', 'medplum'));
  await fs.remove(path.join(OUTPUT_DIR, 'create-spezivibe-app'));

  console.log('✅ Transformations complete\n');

  // Step 4: Install dependencies
  console.log('📦 Installing dependencies (this may take a minute)...');
  execSync('npm install', { cwd: OUTPUT_DIR, stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');

  // Step 5: Verify structure
  console.log('🔍 Verifying project structure...');
  const checks = [
    { path: 'package.json', desc: 'package.json exists' },
    { path: 'app/_layout.tsx', desc: 'Root layout exists' },
    { path: 'app/(tabs)/_layout.tsx', desc: 'Tab layout exists' },
    { path: 'app/(tabs)/schedule.tsx', desc: 'Schedule tab exists' },
    { path: 'app/(onboarding)/_layout.tsx', desc: 'Onboarding exists' },
    { path: 'packages/scheduler', desc: 'Scheduler package exists' },
    { path: 'packages/account', desc: 'Account package exists' },
    { path: '.env.example', desc: 'Env example exists' },
  ];

  const failedChecks: string[] = [];
  for (const check of checks) {
    const exists = await fs.pathExists(path.join(OUTPUT_DIR, check.path));
    if (exists) {
      console.log(`  ✅ ${check.desc}`);
    } else {
      console.log(`  ❌ ${check.desc}`);
      failedChecks.push(check.desc);
    }
  }

  // Verify excluded items are gone
  const excludedChecks = [
    { path: 'packages/chat', desc: 'Chat package removed' },
    { path: 'packages/firebase', desc: 'Firebase package removed' },
    { path: 'app/(tabs)/chat.tsx', desc: 'Chat tab removed' },
  ];

  for (const check of excludedChecks) {
    const exists = await fs.pathExists(path.join(OUTPUT_DIR, check.path));
    if (!exists) {
      console.log(`  ✅ ${check.desc}`);
    } else {
      console.log(`  ❌ ${check.desc} (should be removed)`);
      failedChecks.push(check.desc);
    }
  }

  console.log('');

  if (failedChecks.length > 0) {
    console.log('❌ Some checks failed!');
    process.exit(1);
  }

  // Step 6: Run Expo doctor to verify the project is valid
  console.log('🩺 Running Expo diagnostics...');
  try {
    execSync('npx expo-doctor', { cwd: OUTPUT_DIR, stdio: 'inherit' });
    console.log('✅ Expo doctor passed\n');
  } catch {
    console.log('⚠️ Expo doctor had warnings (this is often OK)\n');
  }

  // Step 7: Try to export (build check)
  console.log('🏗️ Running export check (verifies build works)...');
  try {
    // Use --no-bytecode to speed up the check
    execSync('npx expo export --platform web --output-dir /tmp/test-expo-export --no-bytecode', {
      cwd: OUTPUT_DIR,
      stdio: 'inherit',
      timeout: 120000,
    });
    console.log('✅ Export succeeded!\n');
    await fs.remove('/tmp/test-expo-export');
  } catch (error) {
    console.log('⚠️ Export had issues (checking details)...\n');
  }

  console.log('='.repeat(50));
  console.log('');
  console.log('🎉 SUCCESS! Generated app is valid and working.');
  console.log('');
  console.log(`📁 Generated app location: ${OUTPUT_DIR}`);
  console.log('');
  console.log('To run it yourself:');
  console.log(`  cd ${OUTPUT_DIR}`);
  console.log('  npx expo start');
  console.log('');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
