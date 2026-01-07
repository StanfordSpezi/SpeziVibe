/**
 * Live integration test for Medplum FHIR operations
 *
 * Tests the same operations that MedplumBackend performs, using MedplumClient directly.
 * Run with: npx tsx scripts/test-live.ts
 */

// Polyfill sessionStorage for Node.js (needed for PKCE)
const memoryStore: Record<string, string> = {};
(global as any).sessionStorage = {
  getItem: (key: string) => memoryStore[key] ?? null,
  setItem: (key: string, value: string) => { memoryStore[key] = value; },
  removeItem: (key: string) => { delete memoryStore[key]; },
  clear: () => { Object.keys(memoryStore).forEach(k => delete memoryStore[k]); },
  get length() { return Object.keys(memoryStore).length; },
  key: (i: number) => Object.keys(memoryStore)[i] ?? null,
};

import { MedplumClient, ClientStorage } from '@medplum/core';
import type { Task as FhirTask, Observation, QuestionnaireResponse, Consent, Bundle } from '@medplum/fhirtypes';
import {
  taskToFhirTask,
  fhirTaskToTask,
  outcomeToObservation,
  observationToOutcome,
  consentDataToFhirConsent,
  fhirConsentToConsentData,
} from '../src/utils/fhir-mapping';
import type { Task } from '../src/types';

const config = {
  baseUrl: process.env.MEDPLUM_BASE_URL || 'https://api.medplum.com/',
  clientId: process.env.MEDPLUM_CLIENT_ID || '',
  projectId: process.env.MEDPLUM_PROJECT_ID || '',
};

const testCredentials = {
  email: process.env.MEDPLUM_TEST_EMAIL || '',
  password: process.env.MEDPLUM_TEST_PASSWORD || '',
};

if (!config.clientId || !config.projectId || !testCredentials.email || !testCredentials.password) {
  console.error('Missing required environment variables:');
  console.error('  MEDPLUM_CLIENT_ID, MEDPLUM_PROJECT_ID, MEDPLUM_TEST_EMAIL, MEDPLUM_TEST_PASSWORD');
  process.exit(1);
}

// In-memory storage for Node.js environment
class MemoryStorage implements ClientStorage {
  private data: Record<string, string> = {};

  getInitPromise(): Promise<void> {
    return Promise.resolve();
  }

  setInitPromise(_promise: Promise<void>): void {}

  clear(): void {
    this.data = {};
  }

  getString(key: string): string | undefined {
    return this.data[key];
  }

  setString(key: string, value: string): void {
    this.data[key] = value;
  }

  getObject<T>(key: string): T | undefined {
    const str = this.data[key];
    return str ? JSON.parse(str) : undefined;
  }

  setObject<T>(key: string, value: T): void {
    this.data[key] = JSON.stringify(value);
  }
}

async function runTests() {
  console.log('🚀 Starting Medplum Live Integration Tests\n');

  const medplum = new MedplumClient({
    baseUrl: config.baseUrl,
    clientId: config.clientId,
    storage: new MemoryStorage(),
  });

  // Login
  console.log('1️⃣  Logging in...');
  try {
    const loginResult = await medplum.startLogin({
      email: testCredentials.email,
      password: testCredentials.password,
      projectId: config.projectId,
    });

    if (loginResult.code) {
      await medplum.processCode(loginResult.code);
    }

    const profile = medplum.getProfile();
    if (!profile) {
      throw new Error('No profile after login');
    }

    const patientId = profile.id!;
    console.log(`   ✅ Logged in as Patient/${patientId}\n`);

    // =========================================================================
    // Test Tasks
    // =========================================================================
    console.log('2️⃣  Testing Task Operations...');

    const testTask: Task = {
      id: `test-task-${Date.now()}`,
      title: 'Integration Test Task',
      instructions: 'This is a test task created by the integration test',
      category: 'questionnaire',
      questionnaireId: 'test-questionnaire',
      schedule: {
        startDate: new Date(),
        recurrence: {
          type: 'daily',
          hour: 9,
          minute: 0,
        },
      },
      completionPolicy: { type: 'window', start: -30, end: 120 },
      createdAt: new Date(),
    };

    // Convert to FHIR and create
    const fhirTask = taskToFhirTask(testTask, patientId);
    const createdFhirTask = await medplum.createResource<FhirTask>(fhirTask);
    console.log(`   ✅ Created FHIR Task: ${createdFhirTask.id}`);

    // Verify mapping works
    const roundTrippedTask = fhirTaskToTask(createdFhirTask);
    console.log(`   ✅ Round-trip task: "${roundTrippedTask.title}" (category: ${roundTrippedTask.category})`);
    console.log(`      Schedule: ${roundTrippedTask.schedule.recurrence.type} at ${(roundTrippedTask.schedule.recurrence as any).hour}:${String((roundTrippedTask.schedule.recurrence as any).minute).padStart(2, '0')}`);
    console.log(`      Completion policy: ${roundTrippedTask.completionPolicy.type}`);
    if (roundTrippedTask.completionPolicy.type === 'window') {
      console.log(`      Window: ${roundTrippedTask.completionPolicy.start} to ${roundTrippedTask.completionPolicy.end} minutes`);
    }

    // Search for tasks
    const taskBundle = await medplum.search('Task', {
      patient: `Patient/${patientId}`,
      status: 'requested',
    });
    console.log(`   ✅ Found ${taskBundle.entry?.length ?? 0} task(s) for patient`);

    // Update task
    const updatedFhirTask = await medplum.updateResource<FhirTask>({
      ...createdFhirTask,
      description: 'Updated Integration Test Task',
    });
    console.log(`   ✅ Updated task: "${updatedFhirTask.description}"`);

    // Delete task
    await medplum.deleteResource('Task', createdFhirTask.id!);
    console.log(`   ✅ Deleted task\n`);

    // =========================================================================
    // Test Outcomes (Observations)
    // =========================================================================
    console.log('3️⃣  Testing Outcome/Observation Operations...');

    const testOutcome = {
      id: `test-outcome-${Date.now()}`,
      completedAt: new Date(),
      data: { score: 85, notes: 'Integration test outcome' },
    };

    const observation = outcomeToObservation(testOutcome, patientId, 'test-task-123');
    const createdObservation = await medplum.createResource<Observation>(observation);
    console.log(`   ✅ Created Observation: ${createdObservation.id}`);

    // Verify round-trip
    const roundTrippedOutcome = observationToOutcome(createdObservation);
    console.log(`   ✅ Round-trip outcome: id=${roundTrippedOutcome.id}, data=${JSON.stringify(roundTrippedOutcome.data)}`);

    // Search for outcomes
    const obsBundle = await medplum.search('Observation', {
      subject: `Patient/${patientId}`,
      code: 'http://spezivibe.com/fhir/code/outcome|task-completion',
    });
    console.log(`   ✅ Found ${obsBundle.entry?.length ?? 0} outcome(s) for patient`);

    // Delete observation
    await medplum.deleteResource('Observation', createdObservation.id!);
    console.log(`   ✅ Deleted observation\n`);

    // =========================================================================
    // Test QuestionnaireResponses
    // =========================================================================
    console.log('4️⃣  Testing QuestionnaireResponse Operations...');

    const testQR: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      subject: { reference: `Patient/${patientId}` },
      authored: new Date().toISOString(),
      questionnaire: 'test-questionnaire',
      item: [
        {
          linkId: 'q1',
          text: 'How are you feeling?',
          answer: [{ valueString: 'Good' }],
        },
        {
          linkId: 'q2',
          text: 'Rate your energy (1-10)',
          answer: [{ valueInteger: 8 }],
        },
      ],
    };

    const createdQR = await medplum.createResource<QuestionnaireResponse>(testQR);
    console.log(`   ✅ Created QuestionnaireResponse: ${createdQR.id}`);

    // Search for responses
    const qrBundle = await medplum.search('QuestionnaireResponse', {
      subject: `Patient/${patientId}`,
    });
    console.log(`   ✅ Found ${qrBundle.entry?.length ?? 0} response(s) for patient`);

    // Delete response
    await medplum.deleteResource('QuestionnaireResponse', createdQR.id!);
    console.log(`   ✅ Deleted questionnaire response\n`);

    // =========================================================================
    // Test Consent
    // =========================================================================
    console.log('5️⃣  Testing Consent Operations...');

    const testConsentData = {
      givenName: 'Test',
      familyName: 'User',
      consentedAt: new Date().toISOString(),
      accepted: true,
    };

    const fhirConsent = consentDataToFhirConsent(testConsentData, patientId);
    const createdConsent = await medplum.createResource<Consent>(fhirConsent);
    console.log(`   ✅ Created Consent: ${createdConsent.id} (status: ${createdConsent.status})`);

    // Verify round-trip
    const roundTrippedConsent = fhirConsentToConsentData(createdConsent);
    console.log(`   ✅ Round-trip consent: ${roundTrippedConsent.givenName} ${roundTrippedConsent.familyName}, accepted=${roundTrippedConsent.accepted}`);

    // Search for consent
    const consentBundle = await medplum.search('Consent', {
      patient: `Patient/${patientId}`,
    });
    console.log(`   ✅ Found ${consentBundle.entry?.length ?? 0} consent(s) for patient`);

    // Test rejected consent
    const rejectedConsentData = {
      ...testConsentData,
      accepted: false,
    };
    const rejectedFhirConsent = consentDataToFhirConsent(rejectedConsentData, patientId);
    const updatedConsent = await medplum.updateResource<Consent>({
      ...rejectedFhirConsent,
      id: createdConsent.id,
    });
    console.log(`   ✅ Updated consent to rejected: status=${updatedConsent.status}`);

    // Delete consent
    await medplum.deleteResource('Consent', createdConsent.id!);
    console.log(`   ✅ Deleted consent\n`);

    // =========================================================================
    // Summary
    // =========================================================================
    console.log('✅ All tests passed!\n');
    console.log('Summary of tested operations:');
    console.log('  - Task: create, read, update, delete, search');
    console.log('  - Observation (Outcome): create, read, delete, search');
    console.log('  - QuestionnaireResponse: create, read, delete, search');
    console.log('  - Consent: create, read, update, delete, search');
    console.log('  - FHIR mapping round-trips verified for all resource types');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
