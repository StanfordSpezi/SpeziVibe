#!/usr/bin/env node

import { generateProject, printNextSteps } from '../dist/generator.js';

const options = {
  projectName: 'test-firebase-onboarding',
  displayName: 'Firebase Onboarding App',
  backend: 'firebase',
  features: ['onboarding', 'questionnaire'],
  llmProviders: [],
  outputDir: '/tmp/test-firebase-onboarding',
};

async function main() {
  console.log('Testing Firebase + Onboarding generator...\n');

  try {
    await generateProject(options);
    printNextSteps(options);
    console.log('\n✅ Test passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
