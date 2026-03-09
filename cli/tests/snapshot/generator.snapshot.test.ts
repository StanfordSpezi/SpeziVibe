import path from 'path';
import { jest, describe, it, expect, beforeAll } from '@jest/globals';
import { generateProject } from '../../src/generator.js';
import { createProjectSnapshot, createTempDir, cleanupTempDir, ProjectSnapshot } from './utils.js';
import type { ProjectOptions } from '../../src/types.js';

// Increase timeout for generation tests
jest.setTimeout(60000);

/**
 * Helper to generate a project and create a snapshot
 */
async function generateAndSnapshot(
  options: Omit<ProjectOptions, 'outputDir'>
): Promise<ProjectSnapshot> {
  const tempDir = createTempDir(options.projectName);
  const fullOptions: ProjectOptions = {
    ...options,
    outputDir: tempDir,
  };

  try {
    await generateProject(fullOptions);
    return await createProjectSnapshot(tempDir);
  } finally {
    await cleanupTempDir(tempDir);
  }
}

describe('Generator Snapshots', () => {
  describe('Minimal Configuration', () => {
    let snapshot: ProjectSnapshot;

    beforeAll(async () => {
      snapshot = await generateAndSnapshot({
        projectName: 'minimal-app',
        displayName: 'Minimal App',
        backend: 'local',
        features: [],
        llmProviders: [],
        hipaaMode: false,
      });
    });

    it('should match file structure snapshot', () => {
      expect(snapshot.files).toMatchSnapshot('files');
    });

    it('should have no packages (local mode)', () => {
      expect(snapshot.packages).toEqual([]);
    });

    it('should have base tabs only', () => {
      expect(snapshot.tabs).toEqual(['contacts', 'explore', 'index']);
    });

    it('should have minimal route groups', () => {
      expect(snapshot.routeGroups).toEqual(['(tabs)']);
    });

    it('should match package.json snapshot', () => {
      expect(snapshot.keyFiles['package.json']).toMatchSnapshot('package.json');
    });

    it('should match app/_layout.tsx snapshot', () => {
      expect(snapshot.keyFiles['app/_layout.tsx']).toMatchSnapshot('app/_layout.tsx');
    });

    it('should match tabs layout snapshot', () => {
      expect(snapshot.keyFiles['app/(tabs)/_layout.tsx']).toMatchSnapshot('tabs/_layout.tsx');
    });

    it('should match .env.example snapshot', () => {
      expect(snapshot.keyFiles['.env.example']).toMatchSnapshot('.env.example');
    });
  });

  describe('Full Configuration (Firebase + All Features)', () => {
    let snapshot: ProjectSnapshot;

    beforeAll(async () => {
      snapshot = await generateAndSnapshot({
        projectName: 'full-app',
        displayName: 'Full App',
        backend: 'firebase',
        features: ['chat', 'scheduler', 'questionnaire'],  // onboarding is auto-added with Firebase
        llmProviders: ['openai', 'anthropic', 'google'],
        hipaaMode: false,
      });
    });

    it('should match file structure snapshot', () => {
      expect(snapshot.files).toMatchSnapshot('files');
    });

    it('should include all packages', () => {
      expect(snapshot.packages).toEqual([
        'account',
        'chat',
        'firebase',
        'onboarding',
        'questionnaire',
        'scheduler',
      ]);
    });

    it('should have all tabs', () => {
      expect(snapshot.tabs).toEqual(['chat', 'contacts', 'explore', 'index', 'schedule']);
    });

    it('should have all route groups', () => {
      expect(snapshot.routeGroups).toEqual(['(account)', '(onboarding)', '(tabs)']);
    });

    it('should match package.json snapshot', () => {
      expect(snapshot.keyFiles['package.json']).toMatchSnapshot('package.json');
    });

    it('should match app/_layout.tsx snapshot', () => {
      expect(snapshot.keyFiles['app/_layout.tsx']).toMatchSnapshot('app/_layout.tsx');
    });

    it('should match tabs layout snapshot', () => {
      expect(snapshot.keyFiles['app/(tabs)/_layout.tsx']).toMatchSnapshot('tabs/_layout.tsx');
    });

    it('should match .env.example snapshot', () => {
      expect(snapshot.keyFiles['.env.example']).toMatchSnapshot('.env.example');
    });
  });

  describe('Firebase Only (No Extra Features)', () => {
    let snapshot: ProjectSnapshot;

    beforeAll(async () => {
      snapshot = await generateAndSnapshot({
        projectName: 'firebase-only-app',
        displayName: 'Firebase Only App',
        backend: 'firebase',
        features: [],  // onboarding is auto-added with Firebase
        llmProviders: [],
        hipaaMode: false,
      });
    });

    it('should include firebase, onboarding, and account packages', () => {
      expect(snapshot.packages).toContain('firebase');
      expect(snapshot.packages).toContain('onboarding');
      expect(snapshot.packages).toContain('account');
    });

    it('should have onboarding route group', () => {
      expect(snapshot.routeGroups).toContain('(onboarding)');
    });

    it('should match app/_layout.tsx snapshot', () => {
      expect(snapshot.keyFiles['app/_layout.tsx']).toMatchSnapshot('app/_layout.tsx');
    });
  });

  describe('Chat Only (Local)', () => {
    let snapshot: ProjectSnapshot;

    beforeAll(async () => {
      snapshot = await generateAndSnapshot({
        projectName: 'chat-app',
        displayName: 'Chat App',
        backend: 'local',
        features: ['chat'],
        llmProviders: ['anthropic'],
        hipaaMode: false,
      });
    });

    it('should include chat package', () => {
      expect(snapshot.packages).toContain('chat');
    });

    it('should have chat tab', () => {
      expect(snapshot.tabs).toContain('chat');
    });

    it('should match package.json snapshot', () => {
      expect(snapshot.keyFiles['package.json']).toMatchSnapshot('package.json');
    });

    it('should have only anthropic in env', () => {
      const env = snapshot.keyFiles['.env.example'];
      expect(env).toContain('ANTHROPIC');
      expect(env).not.toContain('OPENAI');
      expect(env).not.toContain('GOOGLE');
    });
  });

  describe('HealthKit (Local)', () => {
    let snapshot: ProjectSnapshot;

    beforeAll(async () => {
      snapshot = await generateAndSnapshot({
        projectName: 'healthkit-app',
        displayName: 'HealthKit App',
        backend: 'local',
        features: ['healthkit'],
        llmProviders: [],
        hipaaMode: false,
      });
    });

    it('should include healthkit package', () => {
      expect(snapshot.packages).toContain('healthkit');
    });

    it('should have health tab', () => {
      expect(snapshot.tabs).toContain('health');
    });

    it('should have healthkit config file', () => {
      expect(snapshot.files).toContain('lib/healthkit-config.ts');
    });

    it('should match package.json snapshot', () => {
      expect(snapshot.keyFiles['package.json']).toMatchSnapshot('package.json');
    });

    it('should match app.config.js snapshot', () => {
      expect(snapshot.keyFiles['app.config.js']).toMatchSnapshot('app.config.js');
    });

    it('should have HealthKit plugin in app.config.js', () => {
      const appConfig = snapshot.keyFiles['app.config.js'];
      expect(appConfig).toContain('@kingstinct/react-native-healthkit');
    });

    it('should match tabs layout snapshot', () => {
      expect(snapshot.keyFiles['app/(tabs)/_layout.tsx']).toMatchSnapshot('tabs/_layout.tsx');
    });
  });

  describe('Firebase + Onboarding Combination', () => {
    let snapshot: ProjectSnapshot;

    beforeAll(async () => {
      snapshot = await generateAndSnapshot({
        projectName: 'firebase-onboarding-app',
        displayName: 'Firebase Onboarding App',
        backend: 'firebase',
        features: [],  // onboarding is auto-added with Firebase
        llmProviders: [],
        hipaaMode: false,
      });
    });

    it('should include firebase and onboarding packages', () => {
      expect(snapshot.packages).toContain('firebase');
      expect(snapshot.packages).toContain('onboarding');
    });

    it('should match app/_layout.tsx snapshot (combined)', () => {
      // This tests the firebase+onboarding combination logic
      expect(snapshot.keyFiles['app/_layout.tsx']).toMatchSnapshot('app/_layout.tsx');
    });

    it('should have Firebase env vars', () => {
      const env = snapshot.keyFiles['.env.example'];
      expect(env).toContain('FIREBASE_API_KEY');
      expect(env).toContain('FIREBASE_PROJECT_ID');
    });
  });

  describe('Scheduler + Questionnaire (Firebase)', () => {
    let snapshot: ProjectSnapshot;

    beforeAll(async () => {
      snapshot = await generateAndSnapshot({
        projectName: 'scheduler-questionnaire-app',
        displayName: 'Scheduler Questionnaire App',
        backend: 'firebase',
        features: ['scheduler', 'questionnaire'],
        llmProviders: [],
        hipaaMode: false,
      });
    });

    it('should include scheduler and questionnaire packages', () => {
      expect(snapshot.packages).toContain('scheduler');
      expect(snapshot.packages).toContain('questionnaire');
    });

    it('should have schedule tab', () => {
      expect(snapshot.tabs).toContain('schedule');
    });

    it('should NOT have chat tab', () => {
      expect(snapshot.tabs).not.toContain('chat');
    });

    it('should match tabs layout snapshot', () => {
      expect(snapshot.keyFiles['app/(tabs)/_layout.tsx']).toMatchSnapshot('tabs/_layout.tsx');
    });
  });

  describe('Firebase + HIPAA', () => {
    let snapshot: ProjectSnapshot;

    beforeAll(async () => {
      snapshot = await generateAndSnapshot({
        projectName: 'hipaa-firebase-app',
        displayName: 'HIPAA Firebase App',
        backend: 'firebase',
        features: [],
        llmProviders: [],
        hipaaMode: true,
      });
    });

    it('should match file structure snapshot', () => {
      expect(snapshot.files).toMatchSnapshot('files');
    });

    it('should include audit package', () => {
      expect(snapshot.packages).toContain('audit');
    });

    it('should include firebase packages', () => {
      expect(snapshot.packages).toContain('firebase');
      expect(snapshot.packages).toContain('account');
    });

    it('should have HIPAA checklist', () => {
      expect(snapshot.files).toContain('HIPAA_CHECKLIST.md');
    });

    it('should have HIPAA checklist with Firebase content', () => {
      const checklist = snapshot.keyFiles['HIPAA_CHECKLIST.md'];
      expect(checklist).toContain('Firebase');
      expect(checklist).toContain('Google-managed encryption');
      expect(checklist).toContain('BAA');
    });

    it('should have HIPAA-enhanced firestore rules', () => {
      const rules = snapshot.keyFiles['firestore.rules'];
      expect(rules).toContain('audit_log');
      expect(rules).toContain('isAdmin');
      expect(rules).toContain('hasRole');
    });

    it('should have storage HIPAA rules', () => {
      expect(snapshot.files).toContain('storage.rules');
    });

    it('should match package.json snapshot', () => {
      expect(snapshot.keyFiles['package.json']).toMatchSnapshot('package.json');
    });
  });

  describe('Local + HIPAA', () => {
    let snapshot: ProjectSnapshot;

    beforeAll(async () => {
      snapshot = await generateAndSnapshot({
        projectName: 'hipaa-local-app',
        displayName: 'HIPAA Local App',
        backend: 'local',
        features: [],
        llmProviders: [],
        hipaaMode: true,
      });
    });

    it('should match file structure snapshot', () => {
      expect(snapshot.files).toMatchSnapshot('files');
    });

    it('should include audit package', () => {
      expect(snapshot.packages).toContain('audit');
    });

    it('should have HIPAA checklist', () => {
      expect(snapshot.files).toContain('HIPAA_CHECKLIST.md');
    });

    it('should have HIPAA checklist with local content', () => {
      const checklist = snapshot.keyFiles['HIPAA_CHECKLIST.md'];
      expect(checklist).toContain('Local');
      expect(checklist).toContain('iOS Data Protection');
    });

    it('should NOT have firestore rules', () => {
      expect(snapshot.files).not.toContain('firestore.rules');
    });

    it('should match package.json snapshot', () => {
      expect(snapshot.keyFiles['package.json']).toMatchSnapshot('package.json');
    });
  });
});
