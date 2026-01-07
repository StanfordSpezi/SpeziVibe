# @spezivibe/medplum

Medplum FHIR integration for SpeziVibe applications, providing Medplum-backed implementations of account management and backend services using FHIR R4 resources.

## Overview

This package provides Medplum implementations for the `@spezivibe/account` and backend service interfaces, following the Stanford Spezi architecture pattern. It uses FHIR R4 resources for data storage:

- **Users** are stored as FHIR `Patient` resources
- **Tasks** are stored as FHIR `Task` resources
- **Outcomes** are stored as FHIR `Observation` resources
- **Questionnaire responses** are stored as FHIR `QuestionnaireResponse` resources
- **Consent** is stored as FHIR `Consent` resources

## Platform Support

| Platform | Status |
|----------|--------|
| iOS | Supported |
| Android | Supported |
| Web | Supported |

The package uses `@medplum/expo-polyfills` to provide React Native compatibility and `expo-secure-store` for secure token storage.

## Features

### MedplumAccountService

Firebase-compatible account service implementation:

- Email/password authentication via Medplum
- User profiles stored as FHIR Patient resources
- Password reset functionality
- Profile management (name, date of birth, gender, phone, photo)
- Auth state change listeners

### MedplumBackend

Backend service for FHIR data storage:

- Task CRUD operations (stored as FHIR Task)
- Outcome tracking (stored as FHIR Observation)
- Questionnaire response storage (stored as FHIR QuestionnaireResponse)
- Consent management (stored as FHIR Consent)
- Real-time sync with Medplum server

### FHIR Mapping Utilities

Bidirectional mapping between SpeziVibe types and FHIR resources:

- `patientToUser` / `userToPatient` - User <-> Patient
- `taskToFhirTask` / `fhirTaskToTask` - Task <-> FHIR Task
- `outcomeToObservation` / `observationToOutcome` - Outcome <-> Observation
- `consentDataToFhirConsent` / `fhirConsentToConsentData` - ConsentData <-> Consent

## Installation

```bash
npm install @spezivibe/medplum @medplum/core @medplum/expo-polyfills @spezivibe/account
```

For Expo projects, also install:

```bash
npx expo install expo-secure-store
```

> **Note**: This package defines its own scheduler types (`Task`, `Outcome`, `SchedulerState`, etc.) internally and does not require `@spezivibe/scheduler` as a dependency. If you're using the scheduler feature separately, the types are compatible.

## Quick Start

### 1. Create a Medplum Project

Follow these steps to set up your Medplum project:

#### Step 1: Sign Up for Medplum

1. Go to [Medplum Console](https://app.medplum.com)
2. Click "Sign up" and create an account
3. Verify your email address

#### Step 2: Create a New Project

1. After logging in, click "Create new project"
2. Enter a project name (e.g., "My Health App")
3. Click "Create"
4. **Copy your Project ID** from the URL: `https://app.medplum.com/admin/project/{PROJECT_ID}`

#### Step 3: Create a Client Application

A Client Application allows your app to authenticate users via OAuth2.

1. In the Medplum Console, go to **Project Admin** (gear icon) → **Clients**
2. Click **"Create new client"**
3. Fill in the details:
   - **Name**: Your app name (e.g., "My Health App Mobile")
   - **Description**: Optional description
   - **Redirect URI**: For Expo apps, use: `exp://localhost:8081` (development)
4. Click **Create**
5. **Copy the Client ID** from the client details page

### 2. Configure Your App

```typescript
import { MedplumAccountService, MedplumBackend } from '@spezivibe/medplum';
import { AccountProvider } from '@spezivibe/account';

const medplumConfig = {
  baseUrl: 'https://api.medplum.com/',
  clientId: 'your-client-id',      // From Medplum Console
  projectId: 'your-project-id',    // From Medplum Console
};

// Create services
const accountService = new MedplumAccountService(medplumConfig);
const backend = new MedplumBackend(medplumConfig);

function App() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    Promise.all([
      accountService.initialize(),
      backend.initialize(),
    ]).then(() => setInitialized(true));
  }, []);

  if (!initialized) return <ActivityIndicator />;

  return (
    <AccountProvider accountService={accountService}>
      <YourApp />
    </AccountProvider>
  );
}
```

### 3. Environment Variables

For Expo/React Native apps, use environment variables:

```bash
# .env
EXPO_PUBLIC_BACKEND_TYPE=medplum
EXPO_PUBLIC_MEDPLUM_BASE_URL=https://api.medplum.com/
EXPO_PUBLIC_MEDPLUM_CLIENT_ID=your-client-id
EXPO_PUBLIC_MEDPLUM_PROJECT_ID=your-project-id
```

## Configuration Options

### MedplumConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `baseUrl` | string | Yes | Medplum server URL (e.g., `https://api.medplum.com/`) |
| `clientId` | string | No | OAuth2 client ID for authentication |
| `projectId` | string | No | Medplum project ID |
| `pagination.pageSize` | number | No | Results per page for FHIR queries (default: 100) |
| `pagination.maxResults` | number | No | Maximum total results to fetch (default: 1000) |

## API Reference

### MedplumAccountService

Implements the `AccountService` interface from `@spezivibe/account`.

```typescript
const accountService = new MedplumAccountService(config);

// Initialize (checks for existing session)
await accountService.initialize();

// Authentication
await accountService.login({ email, password });
await accountService.register({ email, password, name });
await accountService.logout();
await accountService.resetPassword(email);

// Profile management
const user = await accountService.getCurrentUser();
await accountService.updateProfile({ name, dateOfBirth, sex });
await accountService.updateEmail(newEmail, password);
// Note: updatePassword() throws an error - use resetPassword() instead

// Auth state listener
const unsubscribe = accountService.onAuthStateChanged((user) => {
  console.log('Auth state changed:', user);
});
```

### MedplumBackend

Implements the `BackendService` interface for data persistence.

```typescript
const backend = new MedplumBackend(config);

await backend.initialize();
backend.setUserId(patientId); // Set after user logs in

// Tasks
const task = await backend.createTask({ title, schedule, ... });
const tasks = await backend.getTasks();
await backend.updateTask(task);
await backend.deleteTask(taskId);

// Outcomes
const outcome = await backend.createOutcome({ completedAt, data });
const outcomes = await backend.getOutcomes();

// Questionnaire responses
await backend.saveQuestionnaireResponse(response);
const responses = await backend.getQuestionnaireResponses();

// Consent
await backend.saveConsent({ givenName, familyName, consentedAt, accepted: true });
const consent = await backend.getConsent();
const hasConsent = await backend.hasConsented();

// Scheduler state (bulk operations)
const state = await backend.loadSchedulerState();
await backend.saveSchedulerState(state);
```

### BackendService Interface

The `MedplumBackend` implements the `BackendService` interface, which defines the contract for data persistence:

```typescript
interface BackendService {
  // Lifecycle
  initialize(): Promise<void>;
  setUserId(userId: string | null): void;

  // Scheduler state (bulk operations)
  loadSchedulerState(): Promise<SchedulerState | null>;
  saveSchedulerState(state: SchedulerState): Promise<void>;

  // Tasks
  createTask(task: Task): Promise<Task>;
  updateTask(task: Task): Promise<Task>;
  deleteTask(taskId: string): Promise<void>;
  getTasks(): Promise<Task[]>;

  // Outcomes
  createOutcome(outcome: Outcome): Promise<Outcome>;
  getOutcomes(): Promise<Outcome[]>;

  // Questionnaire responses
  saveQuestionnaireResponse(response: QuestionnaireResponse): Promise<void>;
  getQuestionnaireResponses(taskId?: string): Promise<QuestionnaireResponse[]>;

  // Sync (no-op for Medplum - data syncs in real-time)
  syncToRemote(): Promise<void>;
  syncFromRemote(): Promise<void>;
}

interface SchedulerState {
  tasks: Task[];
  outcomes: Outcome[];
}
```

> **Note**: The `BackendService` interface only supports Patient profiles. Practitioner and RelatedPerson profiles are not currently supported.

### Exported Types

The package exports all types needed for backend operations, eliminating the need for `@spezivibe/scheduler`:

```typescript
import type {
  // Backend types
  BackendService,
  SchedulerState,
  MedplumConfig,
  MedplumBackendConfig,

  // Scheduler-compatible types (defined internally)
  Task,
  Outcome,
  Schedule,
  RecurrenceRule,
  TaskCategory,
  AllowedCompletionPolicy,
} from '@spezivibe/medplum';
```

### FHIR Mapping Utilities

```typescript
import {
  patientToUser,
  userToPatient,
  taskToFhirTask,
  fhirTaskToTask,
  outcomeToObservation,
  observationToOutcome,
  consentDataToFhirConsent,
  fhirConsentToConsentData,
  generateFhirId,
} from '@spezivibe/medplum';

// Convert FHIR Patient to User
const user = patientToUser(patient);

// Convert User to FHIR Patient
const patient = userToPatient(user);

// Convert Task to FHIR Task
const fhirTask = taskToFhirTask(task, patientId);

// Convert consent data to FHIR Consent
const fhirConsent = consentDataToFhirConsent(consentData, patientId);

// Generate unique FHIR resource ID
const id = generateFhirId();
```

## FHIR Resource Mappings

### User <-> Patient

| User Field | FHIR Patient Field |
|------------|-------------------|
| `uid` | `id` |
| `email` | `telecom[system=email].value` |
| `name.givenName` | `name[0].given[0]` |
| `name.familyName` | `name[0].family` |
| `dateOfBirth` | `birthDate` |
| `sex` | `gender` |
| `phoneNumber` | `telecom[system=phone].value` |
| `profileImageUrl` | `photo[0].url` |

### Task <-> FHIR Task

SpeziVibe Tasks are stored as FHIR Task resources using standard FHIR fields where possible:

| Task Field | FHIR Task Field |
|------------|-----------------|
| `id` | `identifier[0].value` |
| `title` | `description` |
| `instructions` | `note[0].text` |
| `category` | `code.coding[0].code` |
| `schedule` | `input[valueTiming]` (FHIR Timing) |
| `completionPolicy` | `restriction` (with extension for window) |
| `questionnaireId` | `focus.reference` → `Questionnaire/{id}` |
| `createdAt` | `authoredOn` |

**Schedule Timing Examples:**

```typescript
// Daily at 9:00 AM
input: [{
  type: { coding: [{ code: 'schedule' }] },
  valueTiming: {
    repeat: {
      frequency: 1,
      period: 1,
      periodUnit: 'd',
      timeOfDay: ['09:00:00']
    }
  }
}]

// Weekly on Monday
input: [{
  valueTiming: {
    repeat: {
      periodUnit: 'wk',
      dayOfWeek: ['mon'],
      timeOfDay: ['10:00:00']
    }
  }
}]
```

### Outcome <-> Observation

Outcomes are stored as FHIR Observations with code `task-completion`:

| Outcome Field | FHIR Observation Field |
|---------------|----------------------|
| `id` | `identifier[0].value` (original ID), `id` (FHIR ID) |
| `completedAt` | `effectiveDateTime` |
| `data` | `valueString` (JSON) |

### ConsentData <-> Consent

Consent is stored as a FHIR Consent resource with research scope:

| ConsentData Field | FHIR Consent Field |
|-------------------|-------------------|
| `accepted` | `status` (`active` or `rejected`) |
| `consentedAt` | `dateTime` |
| `givenName` + `familyName` | `performer[0].display` |
| (patient reference) | `patient.reference` |

The consent uses:
- **Scope**: `research` (from `http://terminology.hl7.org/CodeSystem/consentscope`)
- **Category**: `59284-0` Consent Document (LOINC)

## Self-Hosted Medplum

For self-hosted Medplum servers, update the `baseUrl`:

```typescript
const config = {
  baseUrl: 'https://your-medplum-server.com/',
  clientId: 'your-client-id',
  projectId: 'your-project-id',
};
```

## Password Management

### Password Reset

Medplum uses an email-based password reset flow:

```typescript
// Send reset email to user
await accountService.resetPassword('user@example.com');
// User clicks link in email and sets new password via Medplum's /auth/setpassword page
```

### Changing Passwords

**Important:** Medplum does not provide a direct "change password" API for authenticated users. The `updatePassword()` method will throw an error.

To change a password, users must go through the password reset flow:

```typescript
// This will throw an error
await accountService.updatePassword(currentPassword, newPassword); // ❌ Not supported

// Instead, use the reset flow
await accountService.resetPassword(user.email); // ✅ Sends reset email
```

For self-hosted Medplum instances, super admins can force-set passwords via the admin UI.

## Architecture

This package follows the Stanford Spezi pattern with pluggable backends:

```
@spezivibe/account     - Defines AccountService interface
@spezivibe/medplum     - Provides Medplum/FHIR implementation ← this package
@spezivibe/firebase    - Provides Firebase implementation
@spezivibe/scheduler   - Optional scheduling UI (not required by medplum)
```

This separation allows applications to:
- Use different backends without changing application code
- Store healthcare data in FHIR-compliant format
- Leverage Medplum's healthcare-specific features (audit logs, FHIR R4, patient portals)
- Swap implementations easily (local → Medplum → Firebase)
- Use Medplum backend with or without the scheduler feature

**When to choose Medplum**:
- Healthcare/clinical applications requiring FHIR R4 compliance
- Apps that need audit trails and healthcare-grade security
- Integration with EHR systems via FHIR APIs
- Clinical research applications with data export requirements

## Troubleshooting

### "MedplumClient has not been initialized"

Ensure you call `initialize()` before using the service:

```typescript
await accountService.initialize();
await backend.initialize();
```

### "Profile is not a Patient resource"

Medplum supports multiple profile types (Patient, Practitioner, etc.). This package currently only supports Patient profiles. Ensure your users are registered as Patients.

### Network errors on React Native

Ensure `@medplum/expo-polyfills` is imported before creating the client:

```typescript
// This is done automatically by the package, but verify it's installed
import '@medplum/expo-polyfills';
```

### Token storage issues

The package uses `expo-secure-store` via `@medplum/expo-polyfills`. Ensure it's installed:

```bash
npx expo install expo-secure-store
```

## FHIR R4 Compliance

This package follows FHIR R4 specifications for all resource mappings:

### Task Resources

- **intent**: Uses `order` (appropriate for tasks that should be executed)
- **status**: Uses `requested` for pending tasks
- **identifier**: Stores original app ID for searchability
- **code**: Standard coding for task category
- **focus**: References linked Questionnaire resources
- **restriction**: Uses extension for completion window policy

### Observation Resources

- **identifier**: Stores original outcome ID for searchability and deduplication
- **code**: Custom code system for task completion tracking
- **focus**: References related Task resources

### Pagination

All search queries use FHIR pagination to handle large result sets:
- Default page size: 100 resources per page
- Automatically follows `next` links to fetch all pages
- Maximum limit: 1000 resources per query

### Code Systems

Custom code systems used:
- `http://spezivibe.com/fhir/CodeSystem/task-type` - Task categories
- `http://spezivibe.com/fhir/CodeSystem/task-input-type` - Task input types
- `http://spezivibe.com/fhir/code/outcome` - Outcome observation codes
- `http://spezivibe.com/fhir/StructureDefinition/completion-window` - Completion policy extension

## License

MIT
