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

## Limitations

- Does not assume a specific database or framework
- Does not implement FHIR models — recommends existing libraries
- Requires clinical input to validate terminology choices
- Does not address implementation details like database indexes or API pagination
