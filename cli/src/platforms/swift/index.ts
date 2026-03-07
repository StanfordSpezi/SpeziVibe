/**
 * Swift / iOS Platform Generator (Stub)
 *
 * This is a placeholder for native iOS app generation using Swift and the
 * Stanford Spezi framework. It documents the mapping between SpeziVibe
 * concepts and their Spezi Swift equivalents.
 *
 * Spezi Swift Module Mapping:
 * ---------------------------
 * SpeziVibe Concept       -> Spezi Swift Module
 * AccountService          -> SpeziAccount (https://github.com/StanfordSpezi/SpeziAccount)
 * BackendService           -> SpeziFirebase / SpeziFHIR
 * Scheduler               -> SpeziScheduler (https://github.com/StanfordSpezi/SpeziScheduler)
 * Questionnaire            -> SpeziQuestionnaire (https://github.com/StanfordSpezi/SpeziQuestionnaire)
 * HealthKit               -> SpeziHealthKit (https://github.com/StanfordSpezi/SpeziHealthKit)
 * Chat (LLM)              -> SpeziLLM (https://github.com/StanfordSpezi/SpeziLLM)
 * Onboarding              -> SpeziOnboarding (https://github.com/StanfordSpezi/SpeziOnboarding)
 * Standard pattern        -> Spezi Standard (https://github.com/StanfordSpezi/Spezi)
 *
 * When implemented, this generator would:
 * 1. Create a Swift Package Manager project or Xcode project
 * 2. Add Spezi dependencies via SPM
 * 3. Generate a Standard conforming to SpeziStandard
 * 4. Wire up selected modules (account, scheduler, etc.)
 * 5. Generate SwiftUI views for selected features
 */

import type { PlatformGenerator, GenerationOptions, GenerationResult, BackendOption, FeatureOption } from '../types.js';

export class SwiftPlatformGenerator implements PlatformGenerator {
  readonly id = 'swift';
  readonly name = 'iOS (Swift + Spezi)';
  readonly description = 'Native iOS app with Swift and Stanford Spezi framework (coming soon)';
  readonly ready = false;

  async getBackends(): Promise<BackendOption[]> {
    return [
      { value: 'local', name: 'Local (SwiftData)', description: 'On-device persistence with SwiftData' },
      { value: 'firebase', name: 'Firebase (SpeziFirebase)', description: 'Cloud storage with SpeziFirebase' },
    ];
  }

  async getFeatures(): Promise<FeatureOption[]> {
    return [
      { value: 'account', name: 'Account (SpeziAccount)', description: 'User authentication and profile management', defaultChecked: true },
      { value: 'scheduler', name: 'Scheduler (SpeziScheduler)', description: 'Task scheduling and reminders', defaultChecked: true },
      { value: 'questionnaire', name: 'Questionnaire (SpeziQuestionnaire)', description: 'FHIR-compliant health questionnaires', defaultChecked: true },
      { value: 'healthkit', name: 'HealthKit (SpeziHealthKit)', description: 'Apple Health data collection', defaultChecked: false },
      { value: 'llm', name: 'LLM Chat (SpeziLLM)', description: 'On-device and cloud LLM integration', defaultChecked: false },
      { value: 'onboarding', name: 'Onboarding (SpeziOnboarding)', description: 'Welcome flow and consent', defaultChecked: true },
    ];
  }

  async generate(_options: GenerationOptions): Promise<GenerationResult> {
    throw new Error(
      'Swift platform support is coming soon. ' +
      'For now, use the Spezi Template Application directly: ' +
      'https://github.com/StanfordSpezi/SpeziTemplateApplication'
    );
  }

  getNextSteps(_options: GenerationOptions): string[] {
    return [
      'Visit https://github.com/StanfordSpezi/SpeziTemplateApplication',
      'Clone the Spezi Template Application',
      'Follow the setup instructions in the README',
    ];
  }
}
