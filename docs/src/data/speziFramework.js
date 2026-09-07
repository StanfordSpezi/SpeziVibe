// This source file is part of the Stanford Spezi open-source project.
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT
// Descriptions are based on the linked repositories' READMEs, Spezi app
// configurations, and https://bdh.stanford.edu/projects, reviewed 2026-09-07.
// Projects must use Spezi to appear here.

export const FRAMEWORK_REPO = 'https://github.com/StanfordSpezi/Spezi';
export const FRAMEWORK_DOCS = 'https://swiftpackageindex.com/StanfordSpezi/Spezi/documentation';
export const TEMPLATE_REPO = 'https://github.com/StanfordSpezi/SpeziTemplateApplication';

export const SPEZI_SCREENS = [
  {name: 'Consent', image: 'consent.png', width: 1470, height: 3000,
    alt: 'Spezi Consent example with a document, participant name, and handwritten signature.',
    href: 'https://github.com/StanfordSpezi/SpeziConsent'},
  {name: 'Connected devices', image: 'devices.png', width: 1368, height: 2730,
    alt: 'Spezi Devices example showing paired devices and a blood pressure monitor pairing sheet.',
    href: 'https://github.com/StanfordSpezi/SpeziDevices'},
  {name: 'Questionnaires', image: 'questionnaire.png', width: 392, height: 781,
    alt: 'Spezi Questionnaire example rendering a multiple-choice survey about ice cream.',
    href: 'https://github.com/StanfordSpezi/SpeziQuestionnaire'},
];

export const SPEZI_MODULES = [
  {title: 'Welcome people in', description: 'Create onboarding steps and let people read, sign, and export consent documents.',
    packages: ['SpeziOnboarding', 'SpeziConsent']},
  {title: 'Manage accounts', description: 'Add sign-up, sign-in, password reset, and account details with a configurable account service.',
    packages: ['SpeziAccount']},
  {title: 'Ask and collect', description: 'Display questionnaires in the FHIR health data format and collect structured responses.',
    packages: ['SpeziQuestionnaire']},
  {title: 'Connect devices', description: 'Pair supported Bluetooth devices and collect measurements from devices such as scales and blood pressure monitors.',
    packages: ['SpeziBluetooth', 'SpeziDevices']},
  {title: 'Work with health data', description: 'Collect Apple Health data, organize FHIR records, and develop with mock patient data.',
    packages: ['SpeziHealthKit', 'SpeziFHIR']},
  {title: 'Bring AI into your app', description: 'Add language-model interactions using local models on supported devices or a remote service.',
    packages: ['SpeziLLM']},
];

export const SPEZI_PROJECTS = [
  {name: 'ENGAGE-HF', label: 'Heart failure', image: 'engage-hf.png', width: 1341, height: 2664,
    alt: 'ENGAGE-HF home screen with study reminders, a symptom questionnaire, and recent vital signs.',
    summary: 'Home monitoring with connected scales, blood pressure readings, and symptom surveys.',
    description: 'Home monitoring for a heart failure study, combining Bluetooth weight and blood pressure readings, symptom surveys, and medication recommendations.',
    href: 'https://github.com/SchmiedmayerLab/ENGAGE-HF-iOS'},
  {name: 'Quantitative DigitoGraphy', shortName: 'QDG', label: 'Parkinson’s research', image: 'qdg.jpg', imageStyle: 'wide', width: 1900, height: 950,
    alt: 'The QDG project team presenting finger-tapping devices and a monitoring dashboard.',
    summary: 'Remote monitoring for Parkinson’s disease using a Bluetooth finger-tapping device.',
    description: 'Connect a Bluetooth finger-tapping device, a Spezi mobile app, and a clinician dashboard for remote monitoring of Parkinson’s disease.',
    href: 'https://www.researchsquare.com/article/rs-3783294/v1', linkLabel: 'Explore QDG'},
  {name: 'LifeSpace', label: 'Mobility & environment', image: 'lifespace.png', width: 1242, height: 2688,
    alt: 'Cardinal LifeSpace project screenshot showing a map of daily movement around Stanford.',
    summary: 'Mapping daily movement to study how our surroundings influence health.',
    description: 'Study the relationship between daily movement, environmental conditions, and health with location tracking, activity data, and daily surveys.',
    href: 'https://github.com/stanfordmed/LifeSpace'},
  {name: 'Pediatric Apple Watch Study', label: 'Cardiac research', image: 'paws.png', imageStyle: 'icon', width: 1024, height: 1024,
    shortName: 'PAWS', summary: 'Apple Watch ECG collection for the Pediatric Apple Watch Study.',
    alt: 'Paw symbol from the Pediatric Apple Watch Study app icon.',
    description: 'Collect Apple Watch ECG recordings for pediatric research, with Spezi handling health data access, accounts, and scheduled reminders.',
    href: 'https://github.com/StanfordBDHG/PediatricAppleWatchStudy', linkLabel: 'Explore PAWS'},
  {name: 'My Heart Counts', label: 'Cardiovascular research', image: 'my-heart-counts.png', width: 3000, height: 6000,
    alt: 'My Heart Counts example dashboard showing a heart health score and its contributing health metrics.',
    summary: 'A cardiovascular study combining health data, walking tests, surveys, and personalized activity coaching.',
    description: 'A Spezi-based cardiovascular study app with HealthKit and SensorKit data collection, active tasks, a heart health dashboard, and personalized physical activity coaching.',
    href: 'https://github.com/StanfordBDHG/MyHeartCounts-iOS'},
  {name: 'NeuroNest', label: 'EEG & screening', image: 'neuronest.png', width: 1339, height: 2716,
    summary: 'Bluetooth EEG recordings and screening questionnaires in one app.',
    alt: 'NeuroNest example showing an EEG recording in progress with four channels of waveforms.',
    description: 'Record EEG signals from supported Bluetooth devices and collect screening questionnaire responses. Explore the app in the NAMS repository.',
    href: 'https://github.com/StanfordBDHG/NAMS'},
  {name: 'HealthGPT', label: 'Experimental app', image: 'healthgpt.png', width: 390, height: 775,
    alt: 'HealthGPT example conversation asking about sleep and summarizing recent sleep data.',
    description: 'Explore Apple Health data through conversation, using Spezi HealthKit, Chat, and LLM modules.',
    href: 'https://github.com/StanfordBDHG/HealthGPT'},
  {name: 'LLMonFHIR', label: 'Research app', image: 'llmonfhir.png', width: 1500, height: 3000,
    alt: 'LLMonFHIR research app showing the instructions for the first task in a user study.',
    description: 'Study how conversational AI can help people understand health records in FHIR format.',
    href: 'https://github.com/StanfordBDHG/LLMonFHIR'},
  {name: 'Spatial Continuity', label: 'Accessibility prototype', image: 'spatial-continuity.png', imageStyle: 'wide', width: 1920, height: 1080,
    summary: 'Exploring low-vision accessibility with Vision Pro, an iPhone camera, and AI.',
    alt: 'Spatial Continuity on Vision Pro showing a live iPhone camera view and an enlarged image of a book cover.',
    description: 'Explore low-vision accessibility with an iPhone camera stream on Vision Pro and spoken image descriptions powered by Spezi LLM.',
    href: 'https://github.com/StanfordBDHG/SpatialContinuity'},
  {name: 'one sec study integration', label: 'Digital interventions', imageStyle: 'integration',
    description: 'Bring Spezi into an existing app. This package implements the integration for the one sec app’s Digital Interventions Outcome study.',
    href: 'https://github.com/StanfordBDHG/OneSecStudySpeziIntegration', linkLabel: 'Explore the integration'},
  {name: 'OwnYourData', label: 'Clinical trial access', imageStyle: 'wordmark',
    summary: 'Using health records to help people find relevant cancer clinical trials.',
    description: 'Use health records to find relevant NCI-supported cancer trials, with the aim of broadening representation in clinical research.',
    href: 'https://github.com/StanfordBDHG/OwnYourData'},
];
