---
sidebar_position: 7
---

# fhir-data-model-design

:::tip Install this skill

```bash
npx skills add StanfordSpezi/SpeziVibe --skill fhir-data-model-design
```

Or install all skills: `npx skills add StanfordSpezi/SpeziVibe --all`. See the [Getting Started guide](/docs/getting-started) for tool-specific options.

:::

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

## Example

```
AI:   What clinical data does your app track? List every type —
      vitals, labs, questionnaires, medications, conditions.

You:  Blood pressure, heart rate, daily step count, and a
      weekly PHQ-9 depression screening.

AI:   Based on that, here's the FHIR resource mapping:

      Blood pressure → Observation (US Core Blood Pressure profile)
        LOINC: 85354-9, components: systolic 8480-6, diastolic 8462-4

      Heart rate → Observation (US Core Heart Rate profile)
        LOINC: 8867-4

      Step count → Observation
        LOINC: 55423-8

      PHQ-9 → QuestionnaireResponse + Observation (score)
        Questionnaire canonical: http://loinc.org/q/44249-1
        Score LOINC: 44261-6

      Sample FHIR JSON for a blood pressure reading:
      {
        "resourceType": "Observation",
        "status": "final",
        "category": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/observation-category", "code": "vital-signs"}]}],
        "code": {"coding": [{"system": "http://loinc.org", "code": "85354-9"}]},
        "component": [
          {"code": {"coding": [{"system": "http://loinc.org", "code": "8480-6"}]}, "valueQuantity": {"value": 120, "unit": "mmHg"}},
          {"code": {"coding": [{"system": "http://loinc.org", "code": "8462-4"}]}, "valueQuantity": {"value": 80, "unit": "mmHg"}}
        ]
      }
```

## Limitations

- Assumes FHIR R4; older versions not addressed
- Does not resolve individual terminology codes (provides system URIs; you look up specific codes)
- Does not provide clinical validation of terminology — flags where clinical review is needed
- Does not address storage layer details (database choice, indexing)
- Does not implement backend API code — provides the specification
