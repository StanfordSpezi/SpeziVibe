<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# Apple-native Modules

Spezi Swift modules available in the Apple-native starter template ([Spezi Template Application for Apple Platforms](https://github.com/StanfordSpezi/SpeziTemplateApplication)). Added via Swift Package Manager.

## SpeziAccount

User account management, authentication, and profile editing in SwiftUI.

| Component | Purpose |
|-----------|---------|
| `AccountSetup` | Sign-in and registration view |
| `AccountOverview` | Profile display and editing |
| `AccountConfiguration` | Configure required and optional profile fields |
| `AccountDetails` | Access signed-in user details |

Supports multiple identity providers. Pairs with `SpeziFirebaseAccount` for Firebase Authentication.

**Use when:** Every app needs authentication. Configure account keys for the profile fields your app requires.

---

## SpeziOnboarding

Multi-step onboarding and consent flows in SwiftUI.

| Component | Purpose |
|-----------|---------|
| `OnboardingStack` | Container for sequential onboarding steps |
| `OnboardingView` | Individual step with title, description, and action |
| `OnboardingConsentView` | Informed consent with signature capture |
| `OnboardingActionsView` | Action buttons for step completion |
| `SequentialOnboardingView` | Animated sequential feature list |

**Use when:** Building the initial app experience — welcome screens, feature explanations, informed consent with legally meaningful signature capture.

---

## SpeziFHIR

FHIR resource management and server communication.

| Component | Purpose |
|-----------|---------|
| `FHIR` module | FHIR R4 resource types and utilities |
| `FHIRStore` | Local FHIR resource storage |
| `FHIRClient` | Communication with FHIR servers |

Works with Medplum, HAPI, Azure Health Data Services, and Google Cloud Healthcare API.

**Use when:** The app needs to store, retrieve, or exchange healthcare data in FHIR format.

---

## SpeziScheduler

Task scheduling and adherence tracking.

| Component | Purpose |
|-----------|---------|
| `Scheduler` | Core scheduling engine |
| `Task` | Scheduled item with recurrence rules |
| `Schedule` | Recurrence patterns (daily, weekly, monthly) |
| `InstructionsTile` | UI tile for scheduled task display |
| `EventQuery` | Query upcoming or past events |

**Use when:** Medication reminders, daily assessments, study visit schedules, care plan tasks.

---

## SpeziHealthKit

HealthKit data collection and observation.

| Component | Purpose |
|-----------|---------|
| `HealthKit` module | Configure HealthKit data collection |
| `HealthKitDataSource` | Read specific HealthKit sample types |
| `CollectSample` | Trigger sample collection |

Handles authorization, background delivery, and automatic upload to a configured data store.

**Use when:** Collecting health data from iPhone or Apple Watch — steps, heart rate, sleep, workouts, blood oxygen, electrocardiograms.

---

## SpeziQuestionnaire

FHIR Questionnaire rendering using ResearchKit.

| Component | Purpose |
|-----------|---------|
| `QuestionnaireView` | Render a FHIR R4 Questionnaire as a ResearchKit survey |
| `QuestionnaireResponse` | Captured response in FHIR format |

Supports: boolean, string, integer, decimal, date, dateTime, choice, open-choice, display, group, and quantity items.

**Use when:** Collecting structured health data via standardized instruments (PHQ-9, GAD-7, custom surveys).

---

## SpeziChat

Conversational AI chat interface in SwiftUI.

| Component | Purpose |
|-----------|---------|
| `ChatView` | Full chat interface |
| `MessageView` | Individual message display |
| `MessageInput` | Text input with send action |

Works with OpenAI and local LLM backends.

**Use when:** Building conversational features — symptom checkers, health coaching, care navigation assistants.

---

## SpeziFirebaseAccount

Firebase Authentication adapter for SpeziAccount.

| Component | Purpose |
|-----------|---------|
| `FirebaseAccountConfiguration` | Configure Firebase as the identity provider |
| `FirebaseAccountStorage` | Firestore-backed profile storage |

**Use when:** Using Firebase as the authentication and storage backend.

---

## SpeziFirestore

Firestore data persistence.

| Component | Purpose |
|-----------|---------|
| `Firestore` module | Configure Firestore for data storage |
| `FirestoreSettings` | Connection and caching configuration |

**Use when:** Storing app data in Cloud Firestore alongside Firebase Authentication.

---

## SpeziNotifications

Push and local notification support.

| Component | Purpose |
|-----------|---------|
| `NotificationAuthorization` | Request notification permissions |
| `ScheduleLocalNotification` | Schedule local notifications |

**Use when:** Sending reminders, alerts, or engagement nudges to users.

---

## SpeziViews

Shared SwiftUI view components and utilities.

| Component | Purpose |
|-----------|---------|
| `NameFields` | Given and family name input |
| `MarkdownView` | Render markdown content |
| `AsyncButton` | Button with loading state |
| `ViewState` | Idle, processing, error state management |
| `ValidationRule` | Input validation |

**Use when:** Building any SwiftUI screen. Provides common UI patterns used across Spezi modules.

---

## Summary

| Module | Purpose | Backend |
|--------|---------|---------|
| SpeziAccount | Auth and profiles | Adapter-based |
| SpeziOnboarding | Onboarding and consent | Local |
| SpeziFHIR | FHIR resources | FHIR server |
| SpeziScheduler | Task scheduling | Local |
| SpeziHealthKit | Health data collection | Apple HealthKit |
| SpeziQuestionnaire | FHIR questionnaires | Local |
| SpeziChat | LLM chat | OpenAI / local |
| SpeziFirebaseAccount | Firebase auth | Firebase |
| SpeziFirestore | Firestore storage | Firebase |
| SpeziNotifications | Notifications | Local / APNs |
| SpeziViews | Shared UI components | N/A |
