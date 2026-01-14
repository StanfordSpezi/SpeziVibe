# Data Model Planner

Plan health data models and FHIR resource structures.

## When to Use

Invoke `/data-model` when you need to:
- Design data structures for health information
- Map app concepts to FHIR resources
- Plan database schema for health data
- Define relationships between health entities

## Core Health Data Entities

### Patient/User Data

```typescript
interface User {
  // Identity
  uid: string;
  email: string;

  // Demographics (FHIR Patient)
  name: PersonName;
  dateOfBirth: Date;
  sex: 'male' | 'female' | 'other' | 'unknown';

  // Contact
  phoneNumber?: string;
  address?: Address;

  // Clinical (if needed)
  conditions?: string[];      // Active diagnoses
  medications?: string[];     // Current medications
  allergies?: string[];       // Known allergies
}
```

### Health Observations

```typescript
interface HealthObservation {
  id: string;
  type: ObservationType;
  value: number | string | boolean;
  unit?: string;
  timestamp: Date;
  source: 'manual' | 'healthkit' | 'device';

  // FHIR mapping
  fhirCode: {
    system: string;   // e.g., 'http://loinc.org'
    code: string;     // e.g., '8867-4' (heart rate)
    display: string;  // e.g., 'Heart rate'
  };
}

type ObservationType =
  | 'heart_rate'
  | 'blood_pressure'
  | 'weight'
  | 'steps'
  | 'sleep'
  | 'blood_glucose'
  | 'oxygen_saturation'
  | 'temperature';
```

### Tasks & Activities

```typescript
interface Task {
  id: string;
  title: string;
  instructions: string;
  category: 'questionnaire' | 'measurement' | 'medication' | 'activity';

  // Scheduling
  schedule: Schedule;
  completionPolicy: CompletionPolicy;

  // Relationships
  questionnaireId?: string;   // For questionnaire tasks
  medicationId?: string;      // For medication tasks

  // Status
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

interface Schedule {
  startDate: Date;
  endDate?: Date;
  recurrence:
    | { type: 'once'; date: Date }
    | { type: 'daily'; hour: number; minute: number }
    | { type: 'weekly'; weekday: number; hour: number; minute: number }
    | { type: 'monthly'; day: number; hour: number; minute: number };
}
```

### Questionnaire Responses

```typescript
interface QuestionnaireResponse {
  id: string;
  questionnaireId: string;
  taskId?: string;

  status: 'in-progress' | 'completed';
  authored: Date;

  answers: Answer[];
}

interface Answer {
  questionId: string;
  value:
    | { type: 'boolean'; value: boolean }
    | { type: 'integer'; value: number }
    | { type: 'decimal'; value: number }
    | { type: 'string'; value: string }
    | { type: 'date'; value: string }
    | { type: 'choice'; value: string[] };
}
```

## FHIR Resource Mapping

| App Concept | FHIR Resource | Key Fields |
|-------------|---------------|------------|
| User | Patient | name, birthDate, gender, telecom |
| Health Reading | Observation | code, value, effectiveDateTime |
| Task | Task | description, status, for, focus |
| Task Completion | Observation | code='task-completion', effectiveDateTime |
| Questionnaire | Questionnaire | item[], status |
| Survey Response | QuestionnaireResponse | item[], authored |
| Consent | Consent | status, dateTime, performer |
| Medication | MedicationStatement | medication, status, dosage |
| Condition | Condition | code, clinicalStatus, onsetDateTime |
| Care Plan | CarePlan | status, intent, activity[] |

## LOINC Codes for Common Observations

```typescript
const LOINC_CODES = {
  // Vitals
  heartRate: { code: '8867-4', display: 'Heart rate' },
  bloodPressureSystolic: { code: '8480-6', display: 'Systolic blood pressure' },
  bloodPressureDiastolic: { code: '8462-4', display: 'Diastolic blood pressure' },
  bodyWeight: { code: '29463-7', display: 'Body weight' },
  bodyHeight: { code: '8302-2', display: 'Body height' },
  bodyTemperature: { code: '8310-5', display: 'Body temperature' },
  oxygenSaturation: { code: '2708-6', display: 'Oxygen saturation' },
  respiratoryRate: { code: '9279-1', display: 'Respiratory rate' },

  // Lab
  bloodGlucose: { code: '2339-0', display: 'Glucose [Mass/volume] in Blood' },

  // Activity
  steps: { code: '55423-8', display: 'Number of steps' },

  // Sleep
  sleepDuration: { code: '93832-4', display: 'Sleep duration' },
};
```

## HealthKit Sample Types

```typescript
const HEALTHKIT_MAPPING = {
  // Map HealthKit to FHIR
  stepCount: { loinc: '55423-8', unit: 'count' },
  heartRate: { loinc: '8867-4', unit: 'beats/min' },
  bodyMass: { loinc: '29463-7', unit: 'kg' },
  bloodGlucose: { loinc: '2339-0', unit: 'mg/dL' },
  oxygenSaturation: { loinc: '2708-6', unit: '%' },
  bodyTemperature: { loinc: '8310-5', unit: 'degC' },
  bloodPressureSystolic: { loinc: '8480-6', unit: 'mmHg' },
  bloodPressureDiastolic: { loinc: '8462-4', unit: 'mmHg' },
};
```

## Data Relationships

```
User (Patient)
  ├── Tasks
  │     ├── Outcomes (Observation)
  │     └── QuestionnaireResponses
  ├── HealthObservations (Observation)
  │     └── from HealthKit
  ├── Medications (MedicationStatement)
  ├── Conditions (Condition)
  └── Consent
```

## Storage Patterns

### Local Storage (AsyncStorage)

```typescript
const STORAGE_KEYS = {
  user: 'user-profile',
  tasks: 'tasks',
  outcomes: 'outcomes',
  responses: 'questionnaire-responses',
  healthData: 'health-observations',
  syncState: 'sync-state',
};
```

### Remote Storage (FHIR Server)

```typescript
// Resource URLs
const FHIR_ENDPOINTS = {
  patient: '/Patient',
  task: '/Task',
  observation: '/Observation',
  questionnaire: '/Questionnaire',
  questionnaireResponse: '/QuestionnaireResponse',
  consent: '/Consent',
};

// Search patterns
const SEARCH_EXAMPLES = {
  // Get patient's tasks
  patientTasks: '/Task?patient=Patient/123',

  // Get observations in date range
  recentObservations: '/Observation?patient=Patient/123&date=ge2024-01-01',

  // Get questionnaire responses
  responses: '/QuestionnaireResponse?patient=Patient/123&questionnaire=Questionnaire/daily-checkin',
};
```

## Checklist

- [ ] Core entities identified
- [ ] FHIR resources mapped
- [ ] LOINC codes selected for observations
- [ ] HealthKit types mapped
- [ ] Relationships documented
- [ ] Storage strategy defined
- [ ] Sync strategy planned
- [ ] Data validation rules defined
- [ ] Privacy considerations addressed
