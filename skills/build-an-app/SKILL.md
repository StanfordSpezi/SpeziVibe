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

Walk a user through building a digital health app from start to finish. This skill orchestrates the planning and build skills in this repository — it figures out what the user needs, runs the right planning skills, and hands off to implementation. (The release utilities `keep-a-changelog-generator` and `release-notes-generator` are used later in a project's life and are not part of this flow.)

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

First, glance at the working directory. If `docs/planning/` or `docs/implementation-plan.md` already exists, this is a resume — skip the open question, acknowledge what exists, and go straight to "Picking up where they left off" in Step 2.

Otherwise, start with one open question:

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
| Mentions patients pulling in their own medical records, patient portals, MyChart, or Fasten | EHR record integration (`fasten-ehr-integration`) is needed |
| Mentions they already have a repo or project | Skip platform selection |
| Mentions a framework outside the Spezi templates (Flutter, Kotlin, web, etc.) or says they don't want a starter template | Skip platform selection — they'll build with their own framework (see Step 4) |
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
| `spezi-platform-selection` | User does not already have a project repo **and** wants to start from a Spezi template — runs last to choose React Native or Apple-native, set up the matching template project, and move the planning briefs into it. Users who prefer another framework skip it; Step 4 sets up their project instead |
| `digital-health-ux-planning` | User does not already have designs or wireframes |
| `health-data-model-planning` | App stores or processes health data (vitals, assessments, patient records) |
| `fhir-data-model-design` | App needs FHIR interoperability or connects to EHRs |
| `digital-health-compliance-planning` | App handles PHI or has regulatory concerns |
| `fasten-ehr-integration` | App needs patients to pull their own EHR records in via Fasten Connect |
| `digital-health-study-planning` | App is part of a research study with enrollment and assessments |
| `app-build-planner` | Always — produces the implementation plan that drives the build |
| `project-wiki` | User wants a persistent knowledge base that grows with the project — also offered at the end of planning (Step 4) even if not selected here |

Present the plan as a short numbered list with one line per skill explaining what it does. If the plan includes `spezi-platform-selection`, note that the templates are optional — the user can build with whatever framework they want, and if they'd rather not use a Spezi template, drop that step (Step 4 will set up their project instead). Then ask:

> "Does this look right, or would you add or remove anything?"

Let the user adjust before proceeding.

### Picking up where they left off

If the user already has a project, check for existing planning documents in `docs/planning/`. Skip any skill whose output already exists. If they already have `docs/implementation-plan.md`, skip straight to Step 4 (Start Building).

---

## Step 3: Run Each Skill

Work through the selected skills in the order below. For each one:

1. Tell the user what the skill does and what it will produce (one sentence)
2. Read the skill's SKILL.md and follow its instructions
3. After completion, verify the output was saved to the correct path
4. Briefly summarize what was produced before moving on

Two conventions apply throughout. Output paths are relative to the current working directory — until Step 4 (or `spezi-platform-selection`) establishes the project, the working directory stands in for the "project repository" the skills mention. And when a skill asks questions the user already answered earlier in the flow, carry those answers forward instead of re-asking.

### Execution order and output paths

All planning skills run **before** `spezi-platform-selection`, so the user is not committed to a platform until the plan is in hand.

Run skills in this order (skipping any that were not selected):

| Skill | Output Path | What it Produces |
|-------|-------------|-----------------|
| `biodesign-needs-finding` | `docs/planning/need-statement.md` | Need statement: problem, population, outcome |
| `digital-health-ux-planning` | `docs/planning/ux-brief.md` | User journeys, onboarding, workflows |
| `digital-health-study-planning` | `docs/planning/study-brief.md` | Study protocol, enrollment, assessments |
| `health-data-model-planning` | `docs/planning/data-model-brief.md` | Entities, relationships, FHIR recommendations |
| `fhir-data-model-design` | `docs/planning/fhir-data-model.md` | FHIR resources, terminology, relationships |
| `digital-health-compliance-planning` | `docs/planning/compliance-brief.md` | Privacy domains, controls, required decisions |
| `fasten-ehr-integration` | `docs/planning/ehr-connection-brief.md` | Working Fasten Connect integration + privacy/architecture decisions |
| `app-build-planner` | `docs/implementation-plan.md` | Milestone-based build sequence |
| `spezi-platform-selection` | Template project | Working project directory from the chosen template; planning briefs moved into it |

`spezi-platform-selection` runs last (when the user is ready to build). It uses the planning briefs to recommend a platform, sets up the matching Spezi template project (generating the app with the official CLI for React Native, cloning for Apple-native), and moves the existing `docs/planning/` and `docs/implementation-plan.md` into it so the coding agent has full context.

If the user is **not** using a Spezi template, there is no clone step — the planning briefs and implementation plan are framework-agnostic, and Step 4 sets up the project with the user's chosen framework instead.

`fasten-ehr-integration` is part planning, part implementation — its full deliverable is a working, tested integration. When the app does not exist yet, run it at this point for the developer-account setup and the privacy/architecture decisions that produce `docs/planning/ehr-connection-brief.md`, and let `app-build-planner` schedule the working integration as a milestone; return to the skill during that milestone to build and verify the integration inside the actual project.

Between each skill, ask: "Ready to move on, or do you want to adjust anything?"

---

## Step 4: Start Building

Run this step only after **all** selected skills have completed. In particular, if `spezi-platform-selection` was selected, it must run before building starts — implementation happens inside the template project, not in the planning directory.

### Set up the project (no-template path)

If the user is **not** using a Spezi template, establish where the code will live before building starts:

- **Existing repo** — build there. If the planning documents were produced in a different directory, move `docs/planning/` and `docs/implementation-plan.md` into the repo (confirm before moving; merge if `docs/planning/` already exists).
- **No repo yet** — ask where the project should live (a sibling directory of the planning directory, named after the app, is a good default), scaffold it with the standard tooling for the user's chosen framework (e.g., `npx create-expo-app`, `flutter create`, `npm create vite@latest`, a blank Xcode project), then move `docs/planning/` and `docs/implementation-plan.md` into it. If the tooling is not installed, help the user install it first, or fall back to a minimal manual scaffold and say so. Normalize the app name to the framework's package-naming rules where required (a display name with spaces can keep its directory name while the package uses `snake_case`). Read the scaffold's README and any agent instruction files so implementation follows its conventions, initialize a git repository if the tooling didn't, and install dependencies before the build starts.

If a move happened, clear out the emptied `docs/` directory left behind in the planning directory. If the plan's Platform field still says "To be decided" — the user opted out of the template after planning — narrow the plan now: set Platform to the chosen framework, replace dual Spezi package notes with custom-implementation effort flags, and resolve the platform entry in Open Questions. Either way, implementation happens inside that project directory, not the bare planning directory. Without a template the user gives up the pre-wired Spezi scaffolding (onboarding/consent flows, HealthKit integration, FHIR mappings), so expect the plan's milestones to involve more custom implementation — the plan flags this itself when the platform was known at planning time, or via the narrowing step above when it wasn't. In every path, encourage the user to commit `docs/planning/` and `docs/implementation-plan.md` in the project before the build starts — the coding agent and future contributors will keep coming back to them.

### Summarize and hand off

If `project-wiki` was not already set up (no `wiki/` directory) and the user has not previously declined it, offer it once before summarizing:

> "Would you like to set up a project wiki to keep accumulating knowledge as you build? It seeds from your planning documents and grows as you add interviews, papers, and clinical observations."

If the user accepts, run the `project-wiki` skill (read its SKILL.md and follow its instructions), then return here.

Then summarize the project state — list only documents that actually exist on disk, whether created this session or found from an earlier one:

```
Here's what we have:

Project: [the template project path, the user's existing repo, or the newly scaffolded project]

Planning documents:
  [list only the docs that were created]

Implementation plan:
  docs/implementation-plan.md
  [N] milestones, next up: [first milestone not yet built]

Ready to start building?
```

When the user is ready to build, read `docs/implementation-plan.md`, find the first milestone not yet built (when resuming, confirm with the user which milestones are already done), and begin implementing it.

---

## Guardrails

- **Every skill is optional except `app-build-planner`.** Include skills based on what the user described, not a fixed checklist.
- **Templates are optional.** The Spezi templates are the fast path, not a requirement. If the user wants a different framework (Flutter, Kotlin, web, anything else), skip `spezi-platform-selection` and set up their project in Step 4 — the planning briefs and implementation plan work in any codebase.
- **Do not front-load questions.** Start with "What do you want to build?" and ask at most one follow-up.
- **When in doubt, include it in the plan.** If you're not sure whether a skill is needed, propose it and let the user remove it. It's easier to drop a step than to discover you missed one.
- **Respect the user's pace.** Let them review and adjust after each skill completes. Do not auto-advance without checking.
- **Handle the "skip to coding" case.** If planning docs already exist, acknowledge them and pick up where they left off.
- **Each skill is interactive.** When you read a skill's SKILL.md and follow its instructions, the user should participate — answer questions, review outputs, provide input. Do not simulate their answers.
