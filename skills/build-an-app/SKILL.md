---
name: build-an-app
description: Walk through the full process of building a digital health app — from defining the need through planning to implementation.
---

<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# Build an App

Walk a user through building a digital health app from start to finish. This skill orchestrates the other skills in this repository — it asks a few questions, decides which planning skills are needed, runs them in order, and hands off to implementation.

## When to Use

Use this skill when a user wants to:

- build a new digital health app from scratch
- figure out where to start on a health app idea
- go from idea to running code with guidance at each step

Do not use this skill if the user wants to run a specific skill directly (e.g., they ask for FHIR data model design). Let them use that skill on its own.

## Working Style

You are a conversational guide. Explain what each step does and why before running it. Ask focused questions. Let the user review and adjust after each step. Move at their pace — do not rush through planning.

---

## Step 1: Understand the Idea

Ask these questions to understand what the user wants to build:

1. "What health problem are you trying to solve, and for whom?"
2. "Is this tied to a research study, or is it a standalone product?"
3. "Does the app need to work on both iOS and Android, or is Apple-only fine?"
4. "Will it collect health data from the phone (like HealthKit, step counts, heart rate)?"
5. "How far along are you — just an idea, have detailed requirements, or ready to start coding?"

If the user already has a clear problem statement, skip question 1 and use what they gave you.

---

## Step 2: Decide What's Needed

Based on the answers, select which skills to run. Not every project needs every skill.

**Always include:**

- `biodesign-needs-finding` — define the problem clearly before building
- `spezi-platform-selection` — choose the right template and clone it
- `digital-health-ux-planning` — design the user experience
- `app-build-planner` — turn plans into a milestone-based build sequence

**Include when relevant:**

| Condition | Skill | Why |
|-----------|-------|-----|
| App stores health data (vitals, assessments, patient records) | `health-data-model-planning` | Defines entities, relationships, and FHIR mappings |
| App needs FHIR interoperability or connects to EHRs | `fhir-data-model-design` | Maps clinical concepts to concrete FHIR resources |
| App handles PHI, needs HIPAA review, or has regulatory concerns | `digital-health-compliance-planning` | Identifies privacy, regulatory, and governance requirements |
| App is part of a research study with enrollment and assessments | `digital-health-study-planning` | Plans the study protocol, consent, and data collection |

Present the selected skills to the user with a brief explanation of each. Let them add or remove any before proceeding.

**If the user says they already have requirements or just want to code:**

Check if planning documents already exist in `docs/planning/` in their project. If some are there, skip those skills and pick up where they left off. If they have an `implementation-plan.md`, skip straight to building.

---

## Step 3: Run Each Skill

Work through the selected skills in this order. For each one:

1. Tell the user what the skill does and what it will produce (one sentence)
2. Read the skill's SKILL.md and follow its instructions
3. After completion, verify the output was saved to the correct path
4. Briefly summarize what was produced before moving to the next skill

### Order and output paths

| # | Skill | Output Path | What it Produces |
|---|-------|-------------|-----------------|
| 1 | `biodesign-needs-finding` | `docs/planning/need-statement.md` | Need statement: problem, population, outcome |
| 2 | `spezi-platform-selection` | Cloned template repository | Working project directory with template code |
| 3 | `digital-health-ux-planning` | `docs/planning/ux-brief.md` | User journeys, onboarding, workflows |
| 4 | `digital-health-study-planning` | `docs/planning/study-brief.md` | Study protocol, enrollment, assessments |
| 5 | `health-data-model-planning` | `docs/planning/data-model-brief.md` | Entities, relationships, FHIR recommendations |
| 6 | `fhir-data-model-design` | `docs/planning/fhir-data-model.md` | FHIR resources, terminology, relationships |
| 7 | `digital-health-compliance-planning` | `docs/planning/compliance-brief.md` | Privacy domains, controls, required decisions |
| 8 | `app-build-planner` | `docs/implementation-plan.md` | Milestone-based build sequence |

Skills marked as not needed in Step 2 are skipped.

After running `spezi-platform-selection` (skill 2), all subsequent outputs are saved inside the cloned template repository.

Between each skill, ask: "Ready to move on to the next step, or do you want to adjust anything?"

---

## Step 4: Start Building

After `app-build-planner` saves `docs/implementation-plan.md`, summarize everything that was produced:

```
Here's what we built:

Project: [cloned template path]

Planning documents:
  docs/planning/need-statement.md
  docs/planning/ux-brief.md
  docs/planning/data-model-brief.md    (if created)
  docs/planning/fhir-data-model.md     (if created)
  docs/planning/compliance-brief.md    (if created)
  docs/planning/study-brief.md         (if created)

Implementation plan:
  docs/implementation-plan.md
  [N] milestones, starting with [Milestone 1 name]

Ready to start building Milestone 1?
```

If the user says yes, read `docs/implementation-plan.md`, find Milestone 1, and begin implementing it.

---

## Guardrails

- **Do not skip needs-finding** unless the user explicitly has a well-defined need statement already.
- **Do not skip platform selection** unless the user has already cloned a template repository.
- **Respect the user's pace.** Let them review and adjust after each skill completes. Do not auto-advance without checking.
- **Do not force unnecessary planning.** If a simple app does not handle PHI, do not run compliance planning. If it does not use FHIR, do not run FHIR data model design.
- **Handle the "skip to coding" case.** If the user already has planning docs in `docs/planning/`, acknowledge them and pick up from wherever they left off. If they have an implementation plan, skip straight to building.
- **Each skill is interactive.** When you read a skill's SKILL.md and follow its instructions, the user should participate — answer questions, review outputs, provide input. Do not simulate their answers.
