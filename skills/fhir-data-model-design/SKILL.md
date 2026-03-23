---
name: fhir-data-model-design
description: Design a FHIR R4 data model for a healthcare application by mapping clinical concepts to resources, terminology, and implementation-ready relationships.
---

<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# FHIR Data Model Designer

Design a FHIR R4 data model for your digital health app. Ask questions, map clinical concepts to FHIR resources, then produce a **structured data model specification document** that you and other agents can use to implement data storage, API calls, and TypeScript types — regardless of backend.

## Background

FHIR (Fast Healthcare Interoperability Resources) R4 is the standard for healthcare data exchange. It defines a common vocabulary of resource types, terminologies, and API patterns. Getting the data model right from the start avoids painful migrations later.

The key challenge: FHIR has 140+ resource types, dozens of profiles, and many ways to model the same concept. The right choice depends on your clinical use case, interoperability goals, and terminology requirements.

**FHIR conventions used throughout:**
- App-level IDs stored in `identifier` (not `id`) — the FHIR server assigns `id`
- Custom code systems: `http://[your-app].com/fhir/CodeSystem/[name]`
- Custom identifiers: `http://[your-app].com/fhir/identifier/[name]`
- Standard FHIR fields preferred over extensions; extensions only when no standard field fits
- All API calls use standard FHIR REST: `GET /fhir/[ResourceType]?[params]`, `POST /fhir/[ResourceType]`

## Your Role

You are an expert FHIR architect. You give concrete recommendations — specific resources, terminology codes, profiles, and sample JSON — based on clinical requirements. You are not Socratic; you provide expert answers.

**Your approach:**
1. Ask focused questions to understand the clinical domain and interoperability goals
2. Recommend specific FHIR resources with clear rationale
3. Identify the correct terminology codes (LOINC, SNOMED CT, RxNorm, ICD-10, CPT)
4. Select appropriate implementation guide profiles
5. Design resource relationships and data flows
6. **Produce a structured data model specification document** — the primary deliverable

**All output is in chat.** At the end, tell the developer: *"Save this document as `docs/fhir-data-model.md` in your project. Use it as context for whatever implementation skill or code workflow you use next."*

---

## Step 1: Understand Clinical Requirements

Before making any recommendations, ask:

**Required:**
1. "What clinical data does your app track? List every type — measurements, assessments, medications, conditions, activities, symptoms, etc."
2. "What is the use case: research study, clinical decision support, consumer wellness, or care coordination?"
3. "Does this data need to interoperate with external systems (EHRs, payers, registries), or is it self-contained?"

**Conditional (ask if relevant):**
- "Are you targeting a specific condition or specialty (oncology, cardiology, mental health, etc.)?"
- "Who enters data: patients themselves, clinicians, or both?"
- "What is your regulatory context: HIPAA covered entity, IRB-regulated study, FDA-regulated SaMD?"
- "Which FHIR server are you using, or is it undecided?" (Medplum, HAPI, Azure Health Data Services, Google Cloud Healthcare, etc.)

**Confirm before proceeding:** "Based on what you've described, your app tracks: [restate list]. Let me now design the FHIR data model."

---

## Step 2: Map Clinical Concepts to FHIR Resources

For each clinical concept the app tracks, recommend the primary resource with rationale.

### Resource Decision Table

| Clinical Concept | Primary Resource | Use When |
|------------------|-----------------|----------|
| Vital signs (HR, BP, weight, O2 sat, temp) | `Observation` | Always — use LOINC codes |
| Lab results | `Observation` | Always — use LOINC codes |
| Patient-reported outcomes (PROs) | `Observation` | Simple scores or derived values |
| Survey / questionnaire responses | `QuestionnaireResponse` | Multi-item instruments (PHQ-9, GAD-7, custom) |
| Scored assessments (e.g., total PHQ-9) | `Observation` (derived) | Computed from a `QuestionnaireResponse` |
| Wearable / HealthKit data | `Observation` | Use LOINC for standard metrics |
| Medications prescribed | `MedicationRequest` | Clinician-prescribed |
| Medications self-reported | `MedicationStatement` | Patient self-report |
| Medication adherence | `MedicationStatement` + `Observation` | Statement for doses; Observation for rate |
| Conditions / diagnoses | `Condition` | Active problems — use SNOMED CT or ICD-10 |
| Symptoms | `Condition` (persistent) or `Observation` (episodic) | Persistent problems vs. measured episodes |
| Scheduled patient tasks | `Task` | Actionable to-dos assigned to the patient |
| Multi-activity longitudinal plans | `CarePlan` | With `Goal` resources for targets |
| Goals | `Goal` | Referenced from `CarePlan` |
| Study consent | `Consent` + `ResearchSubject` | IRB consent, study participation |
| Clinical encounters | `Encounter` | Visit-based events |
| Documents / PDFs / attachments | `DocumentReference` | Binary content only |
| Summary grouping Observations | `DiagnosticReport` | Clinical report |
| Multi-resource atomic write | `Bundle` (type: transaction) | Ensure consistency across resources |

**Anti-patterns to flag:**

❌ `DocumentReference` for structured data → use the appropriate typed resource
❌ `Observation.valueString` storing arbitrary JSON → model fields properly
❌ `Task` used as a care plan → use `CarePlan` with `Task` for steps
❌ Custom extensions for data that fits standard fields → check all fields first

---

## Step 3: Select Terminologies

For every coded field in the model, identify the correct terminology system. Never invent codes — always use a standard system or define a custom one explicitly.

### Terminology Systems

| System | FHIR System URI | Lookup URL |
|--------|----------------|------------|
| LOINC | `http://loinc.org` | https://loinc.org/search/ |
| SNOMED CT | `http://snomed.info/sct` | https://browser.ihtsdotools.org/ |
| RxNorm | `http://www.nlm.nih.gov/research/umls/rxnorm` | https://mor.nlm.nih.gov/RxNav/ |
| ICD-10-CM | `http://hl7.org/fhir/sid/icd-10-cm` | https://clinicaltables.nlm.nih.gov/apidoc/icd10cm/v3/doc.html |
| CPT | `http://www.ama-assn.org/go/cpt` | https://www.cms.gov/medicare/regulations-guidance/physician-self-referral/list-cpt-hcpcs-codes |
| NCI Thesaurus | `http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl` | https://ncit.nci.nih.gov/ncitbrowser/ |
| UCUM | `http://unitsofmeasure.org` | https://ucum.org/ucum |
| HL7 Observation Category | `http://terminology.hl7.org/CodeSystem/observation-category` | https://terminology.hl7.org/CodeSystem-observation-category.html |

**For each resource in the model**, identify:
- Which fields require a code (`code`, `category`, `type`, etc.)
- Which terminology system to use, and record its FHIR System URI in the data model

Do not resolve individual codes here. The data model records the terminology system binding; specific codes are looked up at implementation time using the Lookup URLs above.

---

## Step 4: Recommend Profiles and Implementation Guides

Select which Implementation Guide (IG) profiles to conform to. Conforming means following the IG's constraints and value sets, enabling interoperability with EHRs, payers, and registries.

### Implementation Guide Reference

| IG | Use Case | When to Use |
|----|----------|-------------|
| **US Core** | General EHR interoperability (US) | Default for any app integrating with US EHRs |
| **mCODE** | Oncology | Cancer-focused apps |
| **SDOH Clinical Care** | Social determinants of health | Housing, food, transportation |
| **Gravity Project** | SDOH coding | Paired with SDOH Clinical Care IG |
| **Da Vinci** | Payer/provider exchange | Insurance, prior auth |
| **SMART App Launch** | OAuth2 / EHR app launch | Launching from within an EHR |
| **IPA** (Int'l Patient Access) | International EHR access | Non-US deployments |
| **PACIO** | Post-acute care | Rehab, home health, long-term care |
| **mPOWEr** | Mental health PROs | Patient-reported mental health outcomes |

**Default recommendation:** Conform to **US Core** for Patient, Observation, Condition, and MedicationRequest unless a specialty IG is more appropriate.

**Custom profiles:** When no IG profile fits, define one at:
```
http://[your-app].com/fhir/StructureDefinition/[ResourceType]-[use-case]
```

---

## Step 5: Design Data Flow and Resource Relationships

Show how resources connect using text diagrams. Explain each reference.

### Common Patterns

**Survey → Score pipeline:**
```
Questionnaire (canonical definition, stored once)
    └─ referenced by Task.focus
Task (assigned to Patient, intent: order)
    └─ patient completes → produces
QuestionnaireResponse (answers, subject: Patient, questionnaire: Questionnaire.url)
    └─ app scores → produces
Observation (derived score, derivedFrom: QuestionnaireResponse)
```

**Care plan with scheduled tasks:**
```
CarePlan (status: active, intent: plan, subject: Patient)
    └─ activity[].reference →
Task[] (one per activity, for: Patient)
    └─ Task.focus → Questionnaire | MedicationRequest | ServiceRequest
    └─ completion → QuestionnaireResponse | Observation
```

**Device / wearable data:**
```
Device (wearable or app)
    └─ Observation.device → Device
Observation[] (LOINC coded, effectiveDateTime, subject: Patient)
    └─ optionally grouped into DiagnosticReport
```

### Reference Format (always use)

```
ResourceType/id          e.g. Patient/abc123
```

For canonical URLs (Questionnaire, StructureDefinition):
```
http://[your-app].com/fhir/Questionnaire/[name]
```

---

## Step 6: Produce the Data Model Specification Document

After completing steps 1–5, output the following document in its entirety. This is the **primary deliverable**. Populate every section with the specifics of this app — do not leave placeholder text.

---

```markdown
# FHIR Data Model: [App Name]

> Generated by `fhir-data-model-design`. Save as `docs/planning/fhir-data-model.md`.
> Use this document as context for any follow-up implementation skill, mapping workflow, or backend integration work.

## Overview

| Field | Value |
|-------|-------|
| App | [App name and brief description] |
| Use case | [research / clinical / wellness / care coordination] |
| FHIR version | R4 (4.0.1) |
| Base IG | [e.g., US Core 6.1.0] |
| Additional IGs | [e.g., mCODE 3.0, SDOH Clinical Care 2.1] |
| Interoperability | [e.g., self-contained / EHR integration via SMART App Launch] |

---

## Resources

<!-- One section per resource type used in the app -->

### [ResourceType]: [Clinical Concept]

| Field | Value |
|-------|-------|
| Resource | `[ResourceType]` |
| Profile | `[Profile URL or "Base FHIR R4"]` |
| Clinical use | [What this resource represents in the app] |

**Key fields:**

| Field | Type | Notes |
|-------|------|-------|
| `status` | code | [value set name, e.g., ObservationStatus] |
| `code` | CodeableConcept | Terminology binding (see below) |
| `subject` | Reference | `Patient/{id}` |
| [other fields] | | |

**Terminology bindings:**

| Field | Terminology System | Binding Strength |
|-------|-------------------|-----------------|
| `code` | LOINC (`http://loinc.org`) | required |
| `category` | HL7 Observation Category (`http://terminology.hl7.org/CodeSystem/observation-category`) | preferred |

**Sample FHIR JSON:**

```json
{
  "resourceType": "[ResourceType]",
  ...
}
```

**FHIR R4 spec:** Start from https://hl7.org/fhir/R4/resourcelist.html and open the relevant resource page for the chosen resource type.

---

<!-- Repeat for each resource -->

## Terminology Bindings

Declares which terminology system governs each coded field. Specific codes are resolved at implementation time.

| Resource | Field | Terminology System | Binding Strength | Notes |
|----------|-------|-------------------|-----------------|-------|
| `Observation` | `code` | LOINC (`http://loinc.org`) | required | Use for all measurements and findings |
| `Observation` | `category` | HL7 Observation Category | preferred | `vital-signs`, `survey`, `laboratory`, `activity` |
| `Condition` | `code` | SNOMED CT (`http://snomed.info/sct`) | preferred | ICD-10-CM acceptable for billing contexts |
| `MedicationRequest` | `medicationCodeableConcept` | RxNorm (`http://www.nlm.nih.gov/research/umls/rxnorm`) | required | Clinical drugs |
| `Procedure` | `code` | SNOMED CT or CPT | preferred | |
| [Resource] | [field] | [System URI] | required / preferred / example | [any notes] |

## Custom Code Systems

App-defined code systems for concepts with no standard terminology.

| Name | URI | Purpose |
|------|-----|---------|
| [Name] | `http://[app].com/fhir/CodeSystem/[name]` | [What this code system classifies] |

## Resource Relationships

```
[Text diagram showing resource graph]
```

| Reference | From | To | Cardinality |
|-----------|------|-----|-------------|
| `subject` | `Observation` | `Patient` | 1..1 |
| `derivedFrom` | `Observation` | `QuestionnaireResponse` | 0..* |
| `focus` | `Task` | `Questionnaire` | 0..1 |

## FHIR REST API Patterns

Standard FHIR REST API — works with any FHIR R4 server (Medplum, HAPI, Azure Health Data Services, Google Cloud Healthcare, etc.).

### Read

```
GET /fhir/Patient/{id}
GET /fhir/Questionnaire?url=[canonical-url]
```

### Search

```
# Patient's observations by code
GET /fhir/Observation?subject=Patient/{id}&code=[loinc-code]&_sort=-date

# Patient's tasks
GET /fhir/Task?patient=Patient/{id}&status=requested

# Questionnaire responses for a specific questionnaire
GET /fhir/QuestionnaireResponse?subject=Patient/{id}&questionnaire=[canonical-url]

# Conditions with clinical status
GET /fhir/Condition?patient=Patient/{id}&clinical-status=active
```

### Write

```
POST /fhir/QuestionnaireResponse          # Submit survey response
POST /fhir/Observation                    # Record a measurement
PUT  /fhir/Task/{id}                      # Update task status

# Atomic multi-resource write
POST /fhir/                               # Bundle (type: transaction)
```

## Data Flows

[Prose description of the main data flows, referencing the resource sections above]

1. **[Flow name]**: [Description of how data moves between resources]
2. **[Flow name]**: [Description]

## Implementation Notes

- [Any app-specific constraints or decisions]
- [Known gaps where custom profiles or extensions are needed]
- [Terminology licenses required, e.g., SNOMED CT requires a license]
```

---

## Reference: FHIR Resources Quick Reference

| Resource | Clinical Use | Required Fields | Key Search Params |
|----------|-------------|-----------------|-------------------|
| `Patient` | Person in the app | — | `identifier`, `name`, `birthdate` |
| `Observation` | Measurement or finding | `status`, `code` | `subject`, `code`, `date`, `category` |
| `Questionnaire` | Survey definition | `status` | `url`, `name` |
| `QuestionnaireResponse` | Completed survey | `status` | `subject`, `questionnaire`, `authored` |
| `Task` | Patient to-do | `status`, `intent` | `patient`, `status`, `code` |
| `CarePlan` | Longitudinal plan | `status`, `intent`, `subject` | `patient`, `status` |
| `Goal` | Target outcome | `lifecycleStatus`, `description`, `subject` | `patient`, `lifecycle-status` |
| `MedicationRequest` | Prescribed medication | `status`, `intent`, `medication[x]`, `subject` | `patient`, `status` |
| `MedicationStatement` | Self-reported medication | `status`, `medication[x]`, `subject` | `patient`, `status` |
| `Condition` | Diagnosis / problem | `code`, `subject` | `patient`, `code`, `clinical-status` |
| `Consent` | Consent agreement | `status`, `scope`, `category`, `policyRule` | `patient`, `status` |
| `DiagnosticReport` | Report grouping Observations | `status`, `code` | `patient`, `code`, `date` |
| `Device` | Wearable / sensor | `status` | `patient`, `type` |

---

## FHIR R4 Spec Links

- [Observation](https://hl7.org/fhir/R4/observation.html)
- [Questionnaire](https://hl7.org/fhir/R4/questionnaire.html)
- [QuestionnaireResponse](https://hl7.org/fhir/R4/questionnaireresponse.html)
- [Task](https://hl7.org/fhir/R4/task.html)
- [CarePlan](https://hl7.org/fhir/R4/careplan.html)
- [Patient](https://hl7.org/fhir/R4/patient.html)
- [Condition](https://hl7.org/fhir/R4/condition.html)
- [MedicationRequest](https://hl7.org/fhir/R4/medicationrequest.html)
- [Consent](https://hl7.org/fhir/R4/consent.html)
- [DiagnosticReport](https://hl7.org/fhir/R4/diagnosticreport.html)
- [US Core IG](https://www.hl7.org/fhir/us/core/)

### Terminology Lookup (use these to find codes — do not rely on memorised values)
- [LOINC Search](https://loinc.org/search/)
- [SNOMED CT Browser](https://browser.ihtsdotools.org/)
- [RxNorm Browser (RxNav)](https://mor.nlm.nih.gov/RxNav/)
- [ICD-10-CM API](https://clinicaltables.nlm.nih.gov/apidoc/icd10cm/v3/doc.html)
- [NCI Thesaurus Browser](https://ncit.nci.nih.gov/ncitbrowser/)
- [UCUM](https://ucum.org/ucum)
- [HL7 Observation Category CodeSystem](https://terminology.hl7.org/CodeSystem-observation-category.html)
