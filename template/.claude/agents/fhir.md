# FHIR Compliance Checker

Validate FHIR R4 compliance in your digital health app for healthcare data integrity.

## When to Use

Invoke `/fhir` when you need to:
- Review code for FHIR R4 compliance
- Validate resource mappings
- Check value set usage
- Ensure healthcare data standards compliance

## FHIR Resources Used

| App Type | FHIR Resource |
|----------|---------------|
| User | Patient |
| Task | Task |
| Outcome | Observation |
| ConsentData | Consent |
| Questionnaire | Questionnaire |
| QuestionnaireResponse | QuestionnaireResponse |

## Code Systems

```typescript
// Task type categories
'http://spezivibe.com/fhir/CodeSystem/task-type'

// Resource identifiers
'http://spezivibe.com/fhir/identifier/task-id'
'http://spezivibe.com/fhir/identifier/outcome-id'
```

## Compliance Checklist

### Required FHIR Fields

**All Resources:**
- [ ] `resourceType` is set correctly
- [ ] Required fields per FHIR R4 spec are present

**Patient:**
- [ ] `gender` uses AdministrativeGender: `male | female | other | unknown`
- [ ] `name` uses HumanName structure
- [ ] `telecom` uses ContactPoint with valid `system` (email, phone)
- [ ] `birthDate` format: `YYYY-MM-DD`

**Task:**
- [ ] `status` uses TaskStatus value set
- [ ] `intent` is set (use `order` for executable tasks)
- [ ] `for` references a Patient: `Patient/{id}`

**Observation:**
- [ ] `status` uses ObservationStatus value set
- [ ] `code` is required with proper coding
- [ ] `subject` references a Patient

**Consent:**
- [ ] `scope` is required
- [ ] `category` is required
- [ ] `policyRule` is required (FHIR constraint ppc-1)

### References Format

Always use format: `ResourceType/id`

```typescript
// Correct
{ reference: 'Patient/123' }
{ reference: 'Questionnaire/abc' }

// Incorrect
{ reference: '123' }
```

### Identifier Systems

When using custom identifiers:

```typescript
// Correct - with system
identifier: [{
  system: 'http://spezivibe.com/fhir/identifier/task-id',
  value: task.id
}]

// Incorrect - no system
identifier: [{ value: task.id }]
```

## Common Compliance Issues

1. **Missing resourceType** - Every FHIR resource must have `resourceType`
2. **Invalid status codes** - Using app-specific statuses instead of FHIR value sets
3. **Incorrect reference format** - Missing resource type prefix
4. **Missing required fields** - Consent without `policyRule`, Observation without `code`
5. **Wrong date format** - Using Date objects instead of ISO strings

## Review Process

1. **Identify FHIR resources** in the code
2. **Check required fields** against FHIR R4 spec
3. **Validate code systems** use correct URIs
4. **Verify references** use proper format
5. **Check value sets** for status and code fields
6. **Test round-trips** ensure data integrity

## FHIR R4 References

- [Patient](https://hl7.org/fhir/R4/patient.html)
- [Task](https://hl7.org/fhir/R4/task.html)
- [Observation](https://hl7.org/fhir/R4/observation.html)
- [Consent](https://hl7.org/fhir/R4/consent.html)
- [Questionnaire](https://hl7.org/fhir/R4/questionnaire.html)

## Key Files

- `lib/services/fhir-mapping.ts` - FHIR mappings (if using Medplum)
- `lib/services/types.ts` - App type definitions
