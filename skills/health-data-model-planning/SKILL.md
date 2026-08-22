---
name: health-data-model-planning
description: Plan health data concepts, entities, relationships, interoperability needs, and governance choices for digital health products.
---

<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# Health Data Model Planner

Plan a health data model with a strong bias toward FHIR before committing to storage, code structures, or client-specific architecture.

## When to Use

Use this skill when you need to:
- define the core health concepts a product needs to represent
- decide which entities, relationships, and lifecycle states matter
- reason about interoperability requirements with FHIR as the default starting point for clinical data
- prepare for later implementation in a mobile app, backend, analytics pipeline, or research workflow

**Relationship to `fhir-data-model-design`:** this skill plans the concepts — entities, relationships, lifecycle states, and whether FHIR fits. When the app needs a concrete FHIR R4 specification (specific resources, profiles, and terminology bindings), run `fhir-data-model-design` afterwards; its output supersedes this brief's preliminary FHIR recommendations.

## Working Style

Start with the domain, but assume that clinically meaningful data will often benefit from a FHIR-oriented design unless there is a strong reason not to.

Clarify:

1. what the product is trying to track or coordinate
2. who creates, reads, updates, or interprets the data
3. what must be longitudinal, auditable, shareable, or clinically meaningful
4. what needs to be structured versus free-form
5. which standards, institutions, or downstream systems matter

## Default Bias Toward FHIR

In digital health, prefer asking "How would this map to FHIR?" early rather than treating interoperability as a late-stage add-on.

Default questions:

- should this concept become a FHIR resource instead of a custom object
- is there an existing FHIR pattern for this workflow
- should values use established terminologies such as LOINC, SNOMED CT, or RxNorm
- will this data eventually need to move between apps, research systems, backend services, or EHR-adjacent systems

It is fine to decide that some concepts remain app-internal, but make that an explicit choice.

## Reuse Before Building

Do not encourage teams to hand-roll FHIR models, parsers, or mapping infrastructure unless there is a compelling gap.

When implementation starts, generally recommend reusing mature ecosystem libraries, for example:

- Swift: [apple/FHIRModels](https://github.com/apple/FHIRModels) for core FHIR resource models
- Swift in the Spezi ecosystem: [StanfordSpezi/SpeziFHIR](https://github.com/StanfordSpezi/SpeziFHIR) for FHIR-focused Spezi integrations
- TypeScript and Firebase in the Spezi ecosystem: [StanfordSpezi/spezi-firebase](https://github.com/StanfordSpezi/spezi-firebase), including the npm package [`@stanfordspezi/spezi-firebase-fhir`](https://www.npmjs.com/package/@stanfordspezi/spezi-firebase-fhir)
- TypeScript with Medplum: the Medplum SDK's own FHIR types and client, plus `@spezivibe/medplum` in the Spezi React Native ecosystem

If the user is already working in a concrete stack, recommend modeling choices that fit those existing libraries instead of inventing parallel abstractions.

## Planning Framework

### 1. Core Entities

Identify the main concepts, such as:

- person or participant
- observation or measurement
- questionnaire or assessment
- response or result
- task, intervention, or reminder
- condition, medication, consent, or care-plan concept

For each entity, define:

- purpose
- required attributes
- optional attributes
- who creates or updates it
- whether it changes over time

### 2. Relationships

Map how the entities relate, for example:

- a person has many observations
- a questionnaire has many questions
- a response belongs to one questionnaire instance
- a task may trigger a response or observation

Note:

- one-to-one versus one-to-many relationships
- whether history must be preserved
- what should be versioned

### 3. Lifecycle and State

For important entities, define lifecycle states such as:

- draft
- active
- completed
- cancelled
- archived

Also define:

- what events cause state changes
- whether edits overwrite history or create new records
- what should remain immutable

### 4. Interoperability

Use FHIR as the default lens for clinically relevant data, and only move away from it when the extra complexity is not justified.

Assess:

- whether the product needs to exchange data with clinical systems
- whether FHIR is required now, likely soon, or only later
- whether standard terminologies such as LOINC, SNOMED CT, or RxNorm are needed
- which concepts are internal-only versus externally shareable

When possible, push the user toward:

- standard FHIR resources over custom schemas
- standard FHIR fields over custom extensions
- standard terminologies over app-specific code strings
- explicit mapping notes for any intentionally non-FHIR concepts

### 5. Governance and Quality

Review:

- data provenance
- validation rules
- units and value ranges
- duplicate handling
- retention and deletion expectations
- privacy sensitivity of each data category

## Deliverable Format

Produce a concise data model planning brief with:

- core entities
- key attributes
- entity relationships
- lifecycle states
- FHIR and terminology recommendations
- library reuse recommendations for the target stack
- governance and data-quality notes
- unresolved modeling questions

Save the brief as `docs/planning/data-model-brief.md` in the project repository.

## Guardrails

- Do not assume a specific database, TypeScript model, or mobile framework.
- Favor FHIR for clinically meaningful or shareable health data unless the user gives a good reason not to.
- Keep the distinction clear between business concepts and implementation details.
- Flag where clinical input is needed to validate terminology or meaning.
- Recommend existing libraries before suggesting custom FHIR infrastructure.

## Checklist

- [ ] Core entities identified
- [ ] Required and optional attributes outlined
- [ ] Relationships mapped
- [ ] Lifecycle states defined
- [ ] FHIR resource fit assessed
- [ ] Terminology needs assessed
- [ ] Reusable libraries identified for the target stack
- [ ] Governance and validation concerns captured
- [ ] Open questions documented
