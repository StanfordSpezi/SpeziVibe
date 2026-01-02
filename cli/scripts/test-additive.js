#!/usr/bin/env node

import { generateProject, printNextSteps } from '../dist/generator.js';

const options = {
  projectName: 'test-spezi-additive-app',
  displayName: 'Test App',
  backend: 'local',
  features: ['chat', 'scheduler'],
  llmProviders: ['openai'],
  outputDir: '/tmp/test-spezi-additive-app',
};

async function main() {
  console.log('Testing additive generator...\n');

  try {
    await generateProject(options);
    printNextSteps(options);
    console.log('\n✅ Test passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();
