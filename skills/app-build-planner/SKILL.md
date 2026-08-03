---
name: app-build-planner
description: Turn planning outputs into a milestone-based implementation plan that sequences features, maps them to available packages or modules, and hands off to a coding agent for implementation.
---

<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# App Build Planner

Turn your planning work into a concrete, ordered implementation plan. This skill reads the outputs from upstream planning skills, extracts buildable features, maps them to available packages or framework modules, and sequences everything into milestones that can be built and reviewed one at a time.

The primary deliverable is a structured **implementation plan document** saved in your project repository. You and your coding agent then work through it milestone by milestone.

## When to Use

Use this skill when:

- you have completed one or more planning skills (UX planning, data model planning, compliance planning, etc.)
- you are ready to turn that planning into a milestone-based build sequence

Run this after the other planning skills and **before** `spezi-platform-selection`. The platform choice can be informed by what the plan reveals (HealthKit needs, cross-platform requirements, etc.).

Planning inputs make the plan much better, but they are not a hard requirement — if no planning documents exist, Step 1 falls back to asking the user to describe the app directly. Prefer running the planning skills first when the user has time for them.

## Working Style

You are a directive implementation planner. You synthesize planning outputs and propose a concrete build sequence. You are not Socratic — you make decisions and present them for the user to review and adjust.

**Your approach:**

1. Gather and read all available planning outputs
2. Confirm the platform and backend choices
3. Extract discrete, buildable features from the plans
4. Map each feature to available packages or modules
5. Sequence features into ordered milestones
6. Produce the implementation plan document

**Save the deliverable to disk.** Write the finished plan to `docs/implementation-plan.md` in the project repository, then tell the developer: *"Your implementation plan is saved at `docs/implementation-plan.md`. Your coding agent will use it as the sequenced build plan — milestone by milestone."* If the current environment cannot write files (e.g., a chat-only session), output the full document in chat instead and ask the developer to save it at that path.

---

## Step 1: Gather Planning Inputs

Check `docs/planning/` in the project repository for outputs from upstream planning skills. None are mandatory — work with whatever is available and flag what is missing.

| Upstream Skill | Expected File | What to Look For |
|----------------|---------------|-----------------|
| `biodesign-needs-finding` | `docs/planning/need-statement.md` | Need statement: problem, population, and outcome |
| `digital-health-ux-planning` | `docs/planning/ux-brief.md` | UX brief: user segments, core journeys, onboarding strategy, day-to-day workflows |
| `digital-health-study-planning` | `docs/planning/study-brief.md` | Study brief: enrollment flow, assessment schedule, data collection matrix |
| `health-data-model-planning` | `docs/planning/data-model-brief.md` | Data model brief: core entities, relationships, lifecycle states, FHIR recommendations |
| `fhir-data-model-design` | `docs/planning/fhir-data-model.md` | FHIR spec: concrete resources, terminology bindings, resource relationships |
| `digital-health-compliance-planning` | `docs/planning/compliance-brief.md` | Compliance brief: privacy domains, consent requirements, audit controls |
| `fasten-ehr-integration` | `docs/planning/ehr-connection-brief.md` | EHR connection brief: Fasten Connect integration status, privacy and architecture decisions |

Read each file that exists. For any that are missing, note the gap and move on.

Then ask:

1. "Are there any planning documents saved elsewhere, or anything about the app not captured in the planning files?"

If no planning documents are found at all, ask the user to describe the app's core features, user types, and data needs so you can extract features directly.

---

## Step 2: Confirm Platform and Backend

Identify the choices made during platform selection.

Ask:

1. "Which platform are you on — React Native, Apple-native, or something else (e.g. Flutter, web, an existing repo)?"
2. "Which backend are you using — Firebase, Medplum, or something else?"

Read the appropriate reference file based on the platform:

- React Native → read [react-native-packages.md](references/react-native-packages.md)
- Apple-native → read [apple-native-modules.md](references/apple-native-modules.md)
- Other platforms → skip the Spezi package/module mapping; produce a generic plan the agent can implement using whatever framework conventions apply

---

## Step 3: Extract Features

Parse the planning outputs into a list of discrete, buildable features. Each feature should be:

- **Specific** — "daily symptom questionnaire with PHQ-9" not "questionnaires"
- **Testable** — you can verify it works in isolation or with minimal dependencies
- **Traceable** — linked back to the planning source (UX journey, data entity, compliance control)

Common feature categories:

| Category | Examples |
|----------|---------|
| Account | Sign-in, registration, profile management, password reset |
| Onboarding | Welcome screens, feature highlights, informed consent, permissions |
| Data collection | Questionnaires, surveys, daily check-ins, manual entry |
| Health data | HealthKit sync, vitals reading, wearable data |
| Scheduling | Task reminders, assessment windows, care plan activities |
| Communication | Chat with provider, AI coaching, secure messaging |
| Data management | Backend sync, offline storage, FHIR resource mapping |
| Compliance | Consent tracking, audit logging, data retention, access control |
| Engagement | Notifications, streaks, progress visualization |

For each feature, note:

- **Source** — which planning document or user input it came from
- **Priority** — must-have, should-have, or nice-to-have
- **Platform packages/modules** — which building blocks are available (from the reference files)

Also extract separately:

- **Data entities** — if a `health-data-model-planning` or `fhir-data-model-design` document is available, list each data entity (e.g., Patient, Observation, QuestionnaireResponse) with its FHIR resource mapping. If both documents exist, treat `fhir-data-model.md` as authoritative for FHIR mappings — the data model brief's FHIR recommendations are preliminary. These feed the Data Model Integration table in the output document.
- **Compliance controls** — if a `digital-health-compliance-planning` document is available, list each required control (e.g., "audit log all PHI access", "collect informed consent before data collection", "enforce data retention policy"). These feed the Compliance Integration table in the output document.

---

## Step 4: Map to Packages and Modules

For each extracted feature, identify which pre-built packages (React Native) or modules (Apple-native) can be used.

Use the reference files:

- [react-native-packages.md](references/react-native-packages.md) — `@spezivibe/account`, `@spezivibe/onboarding`, `@spezivibe/questionnaire`, `@spezivibe/scheduler`, `@spezivibe/chat`, `@spezivibe/firebase`, `@spezivibe/medplum`, and `@spezivibe/healthkit` (not yet built — see its Status note)
- [apple-native-modules.md](references/apple-native-modules.md) — SpeziAccount, SpeziOnboarding, SpeziQuestionnaire, SpeziScheduler, SpeziChat, SpeziHealthKit, SpeziFHIR, SpeziFirebaseAccount, SpeziFirestore, SpeziNotifications, SpeziViews

Read each package's entry in the reference file before recommending it — a **Status** note flags a package that is not ready for use. On React Native, `@spezivibe/healthkit` is not yet built, so features that depend on it must be flagged as requiring custom implementation. The Apple-native modules are all released Spezi packages.

For features that have no matching package or module, note that they require custom implementation and estimate relative effort (small, medium, large).

---

## Step 5: Sequence into Milestones

Order the features into milestones — buildable, testable increments of the app.

Read [milestone-patterns.md](references/milestone-patterns.md) to select a starting pattern based on the app archetype:

- **Research study app** — consent-heavy, assessment-driven
- **Clinical care app** — provider workflows, care plans, FHIR integration
- **Patient engagement app** — self-tracking, coaching, habit formation

Adapt the pattern to the actual features:

1. **Remove** milestones that do not apply
2. **Reorder** based on what is most important to the user
3. **Split** large milestones that cover too many features
4. **Merge** small milestones that are tightly coupled
5. **Add** milestones for features not in any pattern

Each milestone must have:

- **Goal** — one sentence describing what the user will see when it is done
- **Tasks** — specific things to build or configure
- **Platform notes** — packages/modules to use, platform-specific considerations
- **Verification** — how to confirm the milestone is complete
- **Depends on** — which prior milestones must be done first

Milestones should follow this general order:

1. Foundation — navigation, theming, project configuration
2. Account — authentication, profile setup
3. Onboarding — welcome flow, consent, permissions
4. Core features — the primary value of the app (data collection, health tracking, scheduling)
5. Communication — chat, messaging (if applicable)
6. Backend integration — data sync, FHIR mapping, server communication
7. Compliance — audit logging, consent tracking, data retention
8. Engagement — notifications, progress visualization, streaks
9. Polish — error handling, accessibility, offline support

---

## Step 6: Produce the Implementation Plan

Generate the full implementation plan document using this format:

```markdown
# Implementation Plan: [App Name]

> Generated by `app-build-planner`. Saved as `docs/implementation-plan.md` in your project.

## Context

| Field | Value |
|-------|-------|
| App | [Name and one-line description] |
| Need statement | [From biodesign-needs-finding, or "Not available"] |
| Platform | [React Native / Apple-native / Other — specify] |
| Backend | [Firebase / Medplum / Other] |
| Study context | [Yes — brief description / No] |

## Planning Inputs

[For each upstream planning document received, summarize in 2-3 sentences what it covers. Note any planning areas that were not completed.]

## Feature List

| # | Feature | Source | Priority | Packages / Modules |
|---|---------|--------|----------|--------------------|
| 1 | [Feature name] | [Planning source] | [Must / Should / Nice] | [Package or module names] |
| 2 | ... | ... | ... | ... |

## Milestones

### Milestone 1: [Name]

**Goal:** [One sentence — what the user sees when this is done]

**Depends on:** [Nothing / Milestone N]

**Tasks:**
1. [Specific task]
2. [Specific task]
3. ...

**Platform notes:**
- [Package/module to use and how]
- [Platform-specific consideration]

**Verify:**
- [How to confirm this milestone works]

---

### Milestone 2: [Name]
...

### Milestone N: [Name]
...

## Data Model Integration

[Map each data entity from the planning phase to the milestone where it gets implemented.]

| Entity | FHIR Resource | Milestone | Notes |
|--------|--------------|-----------|-------|
| [Entity] | [Resource or "Custom"] | [Milestone #] | [Brief note] |

## Compliance Integration

[Map each compliance control to the milestone where it gets addressed.]

| Control | Milestone | How |
|---------|-----------|-----|
| [Control] | [Milestone #] | [Brief approach] |

## Open Questions

[List unresolved items that could affect implementation — for example:]
- [Unresolved backend or infrastructure choices]
- [Features marked "should-have" that need scope confirmation]
- [Missing planning inputs that could change milestone ordering]
- [Third-party integrations that need API access or credentials]

## Next Steps

This plan is saved as `docs/implementation-plan.md` in your project repository.

To start building, work through the milestones one at a time with your coding
agent. Each milestone is designed to be built and reviewed as a single focused
session. Share this document with your agent as context and ask it to implement
Milestone 1 — verify, commit, then move to the next.
```

---

## Guardrails

- **Do not generate application code.** This skill produces a plan, not source code.
- **Do not assume a backend** unless the user has confirmed their choice. Ask.
- **Do not skip missing inputs.** If a planning area was not completed, note it as a gap and flag what the user might want to revisit.
- **Keep milestones small and testable.** Each milestone should produce a visible, verifiable change. If a milestone has more than 5-7 tasks, consider splitting it.
- **Stay platform-aware but not platform-expert.** Reference the correct packages and modules from the reference files; leave detailed code-level implementation to the coding agent that will build from this plan.
- **Respect priority.** Must-have features go into early milestones. Nice-to-have features go at the end and can be dropped without breaking the plan.

---

## Checklist

Before delivering the implementation plan, verify:

- [ ] Every feature from the UX brief is represented in the feature list
- [ ] Every data entity from the data model is mapped to a milestone
- [ ] Every compliance control is assigned to a milestone
- [ ] Milestones are in dependency order — no milestone depends on a later one
- [ ] Each milestone has a clear goal, tasks, and verification criteria
- [ ] Platform packages or modules are identified for each feature that has one
- [ ] Custom implementation effort is noted for features without a matching package
- [ ] Missing planning inputs are flagged
- [ ] Open questions are listed
- [ ] The plan is saved to `docs/implementation-plan.md` (or, in a chat-only session, the user has been told to save it there)
