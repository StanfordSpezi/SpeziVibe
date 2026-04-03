---
sidebar_position: 8
---

# fhir-data-model-design

Maps clinical data types to specific FHIR R4 resources, terminology bindings, and relationships. Unlike most other skills, this one is expert-driven — it provides recommendations rather than asking Socratic questions.

## What It Produces

For each FHIR resource used:

- Profile (base FHIR or specific IG profile URL)
- Clinical use description
- Key fields with types and value set bindings
- Terminology bindings (LOINC, SNOMED CT, RxNorm, ICD-10-CM)
- Sample FHIR JSON with realistic values

Plus:
- Terminology bindings table
- Resource relationships
- FHIR REST API patterns (read, search, write, transaction bundles)
- Data flow descriptions
- Implementation notes and known gaps

## Output

Produces `docs/planning/fhir-data-model.md`.

## Limitations

- Assumes FHIR R4; older versions not addressed
- Does not resolve individual terminology codes (provides system URIs; you look up specific codes)
- Does not provide clinical validation of terminology — flags where clinical review is needed
- Does not address storage layer details (database choice, indexing)
- Does not implement backend API code — provides the specification
