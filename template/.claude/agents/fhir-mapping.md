# FHIR Mapping Generator

Generate FHIR R4 resource mappings for healthcare data interoperability.

## When to Use

Invoke `/fhir-mapping` when you need to:
- Create mappings between app types and FHIR resources
- Add support for new FHIR resource types
- Extend existing mappings with new fields

## Mapping Pattern

Every mapping requires bidirectional functions:

```typescript
// App Type -> FHIR Resource
export function appTypeToFhir(appType: AppType, patientId: string): FhirResource {
  return {
    resourceType: 'ResourceType',
    // ... mapping logic
  };
}

// FHIR Resource -> App Type
export function fhirToAppType(fhirResource: FhirResource): AppType {
  return {
    // ... reverse mapping logic
  };
}
```

## Example: User <-> Patient

```typescript
import type { Patient, HumanName } from '@medplum/fhirtypes';

export function userToPatient(user: User): Patient {
  const humanName: HumanName | undefined = user.name
    ? {
        family: user.name.familyName,
        given: [user.name.givenName, user.name.middleName].filter(Boolean),
      }
    : undefined;

  return {
    resourceType: 'Patient',
    id: user.uid || undefined,
    name: humanName ? [humanName] : undefined,
    birthDate: user.dateOfBirth?.toISOString().split('T')[0],
    gender: mapSexToGender(user.sex),
    telecom: [
      user.email ? { system: 'email', value: user.email } : undefined,
      user.phoneNumber ? { system: 'phone', value: user.phoneNumber } : undefined,
    ].filter(Boolean),
  };
}

export function patientToUser(patient: Patient): User {
  return {
    uid: patient.id ?? '',
    email: patient.telecom?.find((t) => t.system === 'email')?.value ?? null,
    name: mapHumanNameToPersonName(patient.name?.[0]),
    dateOfBirth: patient.birthDate ? new Date(patient.birthDate) : undefined,
    sex: mapGenderToSex(patient.gender),
  };
}
```

## Code Systems

Define custom code systems for app-specific values:

```typescript
const TASK_TYPE_SYSTEM = 'http://spezivibe.com/fhir/CodeSystem/task-type';
const TASK_ID_SYSTEM = 'http://spezivibe.com/fhir/identifier/task-id';
const OUTCOME_ID_SYSTEM = 'http://spezivibe.com/fhir/identifier/outcome-id';
```

## Key Patterns

### Use Identifier for App IDs

```typescript
// Let FHIR server assign 'id', use identifier for your app's ID
identifier: [{ system: TASK_ID_SYSTEM, value: task.id }]
```

### Standard Fields Over Extensions

Prefer FHIR standard fields:
- `code` for category
- `focus` for references
- `input` with `valueTiming` for schedules

### Extension Pattern (When Needed)

```typescript
restriction: {
  extension: [{
    url: 'http://spezivibe.com/fhir/StructureDefinition/completion-window',
    extension: [
      { url: 'start', valueInteger: policy.start },
      { url: 'end', valueInteger: policy.end },
    ],
  }],
}
```

## Type Imports

```typescript
import type {
  Patient,
  Task as FhirTask,
  Observation,
  Consent,
  HumanName,
  Timing,
} from '@medplum/fhirtypes';
```

## Testing Requirements

Every mapping must have round-trip tests:

```typescript
describe('Task Mapping', () => {
  it('should round-trip correctly', () => {
    const original = { id: 'test', title: 'Task' };
    const fhir = taskToFhir(original, 'patient-123');
    const roundTripped = fhirToTask(fhir);

    expect(roundTripped.id).toBe(original.id);
  });

  it('should handle optional fields', () => {
    const minimal = { id: 'test' };
    const fhir = taskToFhir(minimal, 'patient-123');
    const roundTripped = fhirToTask(fhir);

    expect(roundTripped.id).toBe(minimal.id);
  });
});
```

## Checklist for New Mappings

- [ ] Bidirectional functions (toFhir and fromFhir)
- [ ] Uses `identifier` for app IDs, not `id`
- [ ] Standard FHIR fields preferred over extensions
- [ ] Proper code system URIs
- [ ] Reference format: `ResourceType/id`
- [ ] Required FHIR fields present
- [ ] Round-trip tests written
- [ ] Edge cases handled (null, undefined, empty)
