---
sidebar_position: 6
---

# health-data-model-planning

Plans health data entities, relationships, and governance choices before committing to a storage layer. Biased toward FHIR for clinically meaningful or shareable data, but allows opt-out with justification.

## What It Covers

- Core entities (person, observation, questionnaire, task, condition, medication, consent, care plan)
- Required and optional attributes
- Entity relationships and versioning needs
- Lifecycle states (draft, active, completed, cancelled, archived)
- FHIR resource fit assessment
- Terminology recommendations (LOINC, SNOMED CT, RxNorm, ICD-10)
- Library recommendations for the target stack (e.g., apple/FHIRModels for Swift)
- Governance and data-quality notes

## Output

Produces `docs/planning/data-model-brief.md`.

## Example

```
AI:   What does your app track or coordinate? And who creates,
      reads, and updates that data?

You:  Medication schedules, adherence logs, and vital signs.
      Patients log adherence, nurses review it, doctors
      adjust prescriptions.

AI:   For each of those, here's a starting data model:

      Medication Schedule
      — Required: medication name, dose, frequency, start date
      — Optional: end date, refill reminders, prescriber
      — FHIR fit: MedicationRequest
      — Lifecycle: draft → active → completed | cancelled

      Adherence Log
      — Required: medication ref, timestamp, taken (yes/no)
      — Optional: reason skipped, notes
      — FHIR fit: MedicationAdministration
      — Lifecycle: recorded (immutable)

      Should adherence data be shareable with external EHRs,
      or is it self-contained within the app?
```

## Limitations

- Does not assume a specific database or framework
- Does not implement FHIR models — recommends existing libraries
- Requires clinical input to validate terminology choices
- Does not address implementation details like database indexes or API pagination
