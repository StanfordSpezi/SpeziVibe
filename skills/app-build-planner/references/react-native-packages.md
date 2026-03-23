<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# React Native Packages

Pre-built `@spezivibe/*` packages available in the React Native Template App.

## @spezivibe/account

Storage-agnostic authentication and profile management.

| Export | Kind | Purpose |
|--------|------|---------|
| `AccountProvider` | Provider | Wraps the app to supply account context |
| `useAccount()` | Hook | Access login, logout, register, profile, and state |
| `SignInForm` | Component | Email/password sign-in |
| `RegisterForm` | Component | Registration with password confirmation |
| `PasswordResetForm` | Component | Password reset flow |
| `AccountOverview` | Component | Display user profile |
| `EditProfileForm` | Component | Update profile fields |
| `ChangePasswordForm` | Component | Change password |
| `InMemoryAccountService` | Service | In-memory adapter for development and testing |
| `AccountConfiguration` | Type | Configure required vs optional profile fields |
| `User`, `UserProfile`, `PersonName` | Types | Core identity types |
| `validateEmail`, `validatePassword` | Utility | Input validation helpers |
| `formatPersonName`, `parsePersonName` | Utility | Name formatting |

**Use when:** Every app needs account management. Wrap with `FirebaseAccountService` or `MedplumAccountService` for production.

---

## @spezivibe/chat

Multi-provider LLM chat interface using the Vercel AI SDK.

| Export | Kind | Purpose |
|--------|------|---------|
| `ChatView` | Component | Full chat UI with streaming support |
| `MessageBubble` | Component | Individual message display |
| `MessageInput` | Component | Text input with send button |
| `streamChatCompletion()` | Service | Stream responses from OpenAI, Anthropic, or Google |
| `ChatProvider` | Type | Union of `OpenAIProvider`, `AnthropicProvider`, `GoogleProvider` |
| `ChatTheme` | Type | Full theme configuration |
| `defaultLightChatTheme`, `defaultDarkChatTheme` | Theme | Presets |

**Use when:** Building conversational AI features — symptom checkers, coaching, care navigation.

---

## @spezivibe/firebase

Firebase Authentication and Firestore backend adapter.

| Export | Kind | Purpose |
|--------|------|---------|
| `FirebaseAccountService` | Service | Implements `AccountService` with Firebase Auth + Firestore |
| `mapFirebaseError()` | Utility | Map Firebase errors to `AccountError` |

Stores profiles at `users/{userId}/profile/data` in Firestore. Supports Firebase Emulator for local development.

**Use when:** The app uses Firebase as its backend. Plug into `AccountProvider` from `@spezivibe/account`.

**Note:** This package covers authentication and profile storage only. For general data persistence (storing questionnaire responses, task outcomes, or other app data in Firestore), use the Firebase JS SDK directly or consider `@spezivibe/medplum` for FHIR-compliant data storage.

---

## @spezivibe/healthkit

HealthKit integration for iOS.

**Status:** Package exists but is not yet built. Intended for reading and writing Apple HealthKit data from React Native.

**Use when:** The app collects health data from iPhone sensors (steps, heart rate, sleep, workouts). Requires a development build with native modules — Expo Go is not sufficient.

---

## @spezivibe/medplum

FHIR-compliant account management and backend data persistence via Medplum.

| Export | Kind | Purpose |
|--------|------|---------|
| `MedplumAccountService` | Service | Auth using Medplum (users as FHIR Patients) |
| `MedplumBackend` | Service | FHIR resource persistence — tasks, outcomes, questionnaire responses, consent |
| `MedplumConfig` | Type | Base URL, clientId, projectId, pagination settings |
| `BackendService` | Interface | Contract for task/outcome/questionnaire/sync operations |
| `Task`, `Schedule`, `RecurrenceRule`, `Outcome` | Types | Scheduling domain types |
| `patientToUser`, `userToPatient` | Utility | User/Patient mapping |
| `taskToFhirTask`, `fhirTaskToTask` | Utility | Task/FHIR conversion |
| `outcomeToObservation`, `observationToOutcome` | Utility | Outcome/FHIR conversion |
| `consentDataToFhirConsent`, `fhirConsentToConsentData` | Utility | Consent/FHIR conversion |

**Use when:** The app needs FHIR compliance, interoperability, or connects to a healthcare data server. Medplum provides standards-based storage and API access.

---

## @spezivibe/onboarding

Multi-step onboarding flows with consent collection.

| Export | Kind | Purpose |
|--------|------|---------|
| `PaginationDots` | Component | Step indicator dots |
| `FeatureCard` | Component | Feature highlight card with icon |
| `ConsentCheckbox` | Component | Consent checkbox with checkmark |
| `OnboardingButton` | Component | Styled action button |
| `NameInputSection` | Component | Given/family name input |
| `ConsentService` | Service | AsyncStorage-based consent persistence |
| `useOnboardingStatus()` | Hook | Check if onboarding is complete |
| `markOnboardingCompleted()` | Utility | Mark onboarding done |
| `resetOnboardingStatus()` | Utility | Reset onboarding flag |
| `ConsentData` | Type | Name, timestamp, accepted flag |

**Use when:** Building the app's first-run experience — welcome screens, feature highlights, informed consent, and name collection.

---

## @spezivibe/questionnaire

FHIR Questionnaire rendering with conditional logic, validation, and theming.

| Export | Kind | Purpose |
|--------|------|---------|
| `QuestionnaireForm` | Component | Render a full FHIR Questionnaire |
| `QuestionRenderer` | Component | Render a single question item |
| `QuestionnaireBuilder` | Builder | Fluent API to create FHIR Questionnaires programmatically |
| `enableWhen()` | Builder | Create conditional display logic |
| `EnableWhenEvaluator` | Service | Evaluate FHIR enableWhen conditions |
| `createValidationSchema()` | Utility | Generate validation rules from a questionnaire |
| `QuestionnaireFormProps` | Type | Props including questionnaire, onResult callback, theme |
| `QuestionnaireResult` | Type | Union: completed, cancelled, or failed |
| `QuestionnaireTheme` | Type | Colors, spacing, border radius, font size |
| `defaultLightTheme`, `defaultDarkTheme` | Theme | Presets |

Supported question types: boolean, string, text, integer, decimal, date, dateTime, time, choice, display, group.

**Use when:** Collecting structured health data — symptom surveys (PHQ-9, GAD-7), intake forms, daily check-ins, study assessments.

---

## @spezivibe/scheduler

Local task scheduling with calendar UI.

| Export | Kind | Purpose |
|--------|------|---------|
| `SchedulerProvider` | Provider | Context for scheduling state |
| `useScheduler()` | Hook | Access scheduler and state |
| `useScheduleScreen()` | Hook | Get events formatted for display |
| `ScheduleView` | Component | Complete calendar + event list screen |
| `EventCard` | Component | Individual event display |
| `EventList` | Component | Scrollable event list |
| `CompletionBadge` | Component | Status indicator |
| `CalendarStrip` | Component | Date navigation |
| `Scheduler` | Service | Core engine — manage tasks, calculate occurrences, track outcomes |
| `Task`, `Schedule`, `RecurrenceRule` | Types | Task definition with recurrence |
| `Occurrence`, `Event`, `Outcome` | Types | Runtime scheduling types |
| `TaskCategory` | Type | questionnaire, task, reminder, measurement |
| `calculateOccurrences()` | Utility | Generate upcoming task instances |
| `isAllowedToComplete()` | Utility | Check completion window |
| `groupEventsByDate()` | Utility | Group for list display |

Fully local — no backend dependency. Designed for backend sync via the app's orchestration layer.

**Use when:** Any app with scheduled activities — medication reminders, daily assessments, study visit windows, care plan tasks.
