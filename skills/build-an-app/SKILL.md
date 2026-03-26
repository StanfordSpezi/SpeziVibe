---
name: build-an-app
description: Walk through the full process of building a digital health app — from planning to implementation.
---

<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# Build an App

Walk a user through building a digital health app from start to finish. This skill orchestrates the other skills in this repository — it figures out what the user needs, runs the right planning skills, and hands off to implementation.

## When to Use

Use this skill when a user wants to:

- build a new digital health app from scratch
- figure out where to start on a health app idea
- go from idea to running code with guidance at each step

Do not use this skill if the user wants to run a specific skill directly (e.g., they ask for FHIR data model design). Let them use that skill on its own.

## Working Style

You are a conversational guide. Keep it lightweight — don't front-load questions. Listen to what the user says, infer what you can, and only ask about what you can't figure out. Move at their pace.

---

## Step 1: Listen

Start with one open question:

> "What do you want to build?"

Let the user describe their idea naturally. They might give you one sentence or three paragraphs — either is fine.

From their answer, look for signals about:

| Signal | What it tells you |
|--------|------------------|
| Mentions a specific disease, condition, or clinical workflow | Health data and possibly FHIR are involved |
| Mentions a research study, trial, or enrollment | Study planning is needed |
| Mentions patient data, PHI, HIPAA, or regulatory concerns | Compliance planning is needed |
| Mentions HealthKit, vitals, wearables, or sensor data | Health data modeling is needed |
| Mentions EHR, Epic, SMART on FHIR, or interoperability | FHIR data model design is needed |
| Mentions they already have a repo or project | Skip platform selection |
| Mentions they already have designs or wireframes | UX planning may be lighter or skippable |
| Says "I don't know where to start" or describes a vague idea | Needs-finding would help |

If you can't tell whether the app involves health data, connects to clinical systems, or is part of a study, ask **one** follow-up question that covers the gaps. For example:

> "Will this app collect or store any health data, and is it tied to a research study?"

Do not ask more than one follow-up. If something is still ambiguous, include the relevant skill in your proposed plan — the user can remove it.

---

## Step 2: Propose a Plan

Based on what you heard, assemble a plan from the available skills. Every skill is conditional — include only what the user's situation calls for.

### Skill selection guide

| Skill | Include when |
|-------|-------------|
| `biodesign-needs-finding` | User is unsure about the problem, has a vague idea, or asks for help scoping |
| `spezi-platform-selection` | User does not already have a project repo — helps choose React Native or Apple-native and clones the template |
| `digital-health-ux-planning` | User does not already have designs or wireframes |
| `health-data-model-planning` | App stores or processes health data (vitals, assessments, patient records) |
| `fhir-data-model-design` | App needs FHIR interoperability or connects to EHRs |
| `digital-health-compliance-planning` | App handles PHI or has regulatory concerns |
| `digital-health-study-planning` | App is part of a research study with enrollment and assessments |
| `app-build-planner` | Always — produces the implementation plan that drives the build |

Present the plan as a short numbered list with one line per skill explaining what it does. Then ask:

> "Does this look right, or would you add or remove anything?"

Let the user adjust before proceeding.

### Picking up where they left off

If the user already has a project, check for existing planning documents in `docs/planning/`. Skip any skill whose output already exists. If they already have `docs/implementation-plan.md`, skip straight to building.

---

## Step 3: Run Each Skill

Work through the selected skills in the order below. For each one:

1. Tell the user what the skill does and what it will produce (one sentence)
2. Read the skill's SKILL.md and follow its instructions
3. After completion, verify the output was saved to the correct path
4. Briefly summarize what was produced before moving on

### Execution order and output paths

Run skills in this order (skipping any that were not selected):

| Skill | Output Path | What it Produces |
|-------|-------------|-----------------|
| `biodesign-needs-finding` | `docs/planning/need-statement.md` | Need statement: problem, population, outcome |
| `spezi-platform-selection` | Cloned template repository | Working project directory with template code |
| `digital-health-ux-planning` | `docs/planning/ux-brief.md` | User journeys, onboarding, workflows |
| `digital-health-study-planning` | `docs/planning/study-brief.md` | Study protocol, enrollment, assessments |
| `health-data-model-planning` | `docs/planning/data-model-brief.md` | Entities, relationships, FHIR recommendations |
| `fhir-data-model-design` | `docs/planning/fhir-data-model.md` | FHIR resources, terminology, relationships |
| `digital-health-compliance-planning` | `docs/planning/compliance-brief.md` | Privacy domains, controls, required decisions |
| `app-build-planner` | `docs/implementation-plan.md` | Milestone-based build sequence |

After running `spezi-platform-selection`, all subsequent outputs are saved inside the cloned template repository.

Between each skill, ask: "Ready to move on, or do you want to adjust anything?"

---

## Step 4: Start Building

After `app-build-planner` saves `docs/implementation-plan.md`, summarize everything that was produced — only list documents that were actually created:

```
Here's what we have:

Project: [cloned template path]

Planning documents:
  [list only the docs that were created]

Implementation plan:
  docs/implementation-plan.md
  [N] milestones, starting with [Milestone 1 name]

Ready to start building Milestone 1?
```

If the user says yes, read `docs/implementation-plan.md`, find Milestone 1, and begin implementing it.

---

## Guardrails

- **Every skill is optional except `app-build-planner`.** Include skills based on what the user described, not a fixed checklist.
- **Do not front-load questions.** Start with "What do you want to build?" and ask at most one follow-up.
- **When in doubt, include it in the plan.** If you're not sure whether a skill is needed, propose it and let the user remove it. It's easier to drop a step than to discover you missed one.
- **Respect the user's pace.** Let them review and adjust after each skill completes. Do not auto-advance without checking.
- **Handle the "skip to coding" case.** If planning docs already exist, acknowledge them and pick up where they left off.
- **Each skill is interactive.** When you read a skill's SKILL.md and follow its instructions, the user should participate — answer questions, review outputs, provide input. Do not simulate their answers.
