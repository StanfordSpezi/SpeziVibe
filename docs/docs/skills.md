---
sidebar_position: 2
slug: /skills
---

# Skills Overview

SpeziVibe's skills produce platform-agnostic markdown briefs that your AI coding agent uses to write the code. See [How SpeziVibe Works](/docs/how-it-works) for the full flow.

Use these individually, or let **build-an-app** orchestrate them based on what you describe.

## Planning Skills

Listed in the order they typically run. `build-an-app` orchestrates them; `spezi-platform-selection` is optional and runs last (only if you want a Spezi template).

| Skill | What it does | Output |
|-------|-------------|--------|
| [build-an-app](skills/build-an-app) | Orchestrates the other skills based on your description | Runs relevant skills in sequence |
| [biodesign-needs-finding](skills/biodesign-needs-finding) | Guided needs-finding using the Stanford Biodesign process | `docs/planning/need-statement.md` |
| [digital-health-ux-planning](skills/digital-health-ux-planning) | Plan user journeys and workflows (no wireframes) | `docs/planning/ux-brief.md` |
| [digital-health-study-planning](skills/digital-health-study-planning) | Plan a research protocol (enrollment, consent, assessments) | `docs/planning/study-brief.md` |
| [digital-health-compliance-planning](skills/digital-health-compliance-planning) | Identify applicable compliance domains and controls (not legal advice) | `docs/planning/compliance-brief.md` |
| [health-data-model-planning](skills/health-data-model-planning) | Define health data entities, relationships, and FHIR fit | `docs/planning/data-model-brief.md` |
| [fhir-data-model-design](skills/fhir-data-model-design) | Map clinical data to FHIR R4 resources and terminology | `docs/planning/fhir-data-model.md` |
| [app-build-planner](skills/app-build-planner) | Produce a milestone-based implementation plan from the planning briefs | `docs/implementation-plan.md` |
| [spezi-platform-selection](skills/spezi-platform-selection) | Choose React Native or Apple-native, clone the matching Spezi template, move planning briefs into it | Cloned template repo with planning briefs inside |

## Integration Skills

| Skill | What it does | Output |
|-------|-------------|--------|
| [fasten-ehr-integration](skills/fasten-ehr-integration) | Connect patient-authorized EHR records via Fasten Connect — provider-linking widget, webhook ingestion, FHIR record handling, privacy walkthrough | Working integration + `docs/planning/ehr-connection-brief.md` |

## Knowledge Management Skills

| Skill | What it does | Output |
|-------|-------------|--------|
| [project-wiki](skills/project-wiki) | Set up and maintain an AI-managed knowledge base that compounds over time | `wiki/` directory + schema |

## Release Skills

| Skill | What it does | Output |
|-------|-------------|--------|
| [keep-a-changelog-generator](skills/keep-a-changelog-generator) | Generate changelog entries from git history | Changelog markdown |
| [release-notes-generator](skills/release-notes-generator) | Create user-facing release notes with migration guidance | Release notes markdown |
