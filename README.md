<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

<p align="center">
  <img src="assets/rocket-logo.png" alt="Spezi Vibe Logo" width="200"/>
</p>

# Spezi Vibe

Spezi Vibe is a collection of installable skills for people building digital health software with modern AI coding tools.

The goal is simple: make digital health development more accessible by packaging reusable product, clinical, regulatory, interoperability, and platform guidance into skills that can be installed in minutes and used directly in real projects.

This work supports the broader [Spezi](https://github.com/StanfordSpezi) mission of lowering the barrier to building thoughtful, high-quality digital health experiences.

## Quick Start

Install all skills into your coding agent with a single command:

```bash
npx skills add StanfordSpezi/SpeziVibe --all
```

Or list them first to see what is available:

```bash
npx skills add StanfordSpezi/SpeziVibe --list
```

> **Need `npx`?** Install [Node.js](https://nodejs.org/) — `npm` and `npx` are included. Then confirm with `node -v && npx -v`.

## New To Vibe Coding?

Vibe coding is a practical way of building software with an AI coding partner. Instead of starting from a blank page, you work in natural language: you describe the app, workflow, research plan, or technical constraint, and the agent helps you explore the codebase, make changes, draft plans, and explain tradeoffs.

If you are just getting started, these tools are a good place to begin:

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code/getting-started) for terminal-based AI coding workflows
- [OpenAI Codex](https://openai.com/codex/) for agentic software engineering with skills support
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) for an open-source terminal coding agent

If you prefer a more guided starting point, Claude and Codex also have desktop app experiences in addition to CLI workflows. A practical way to begin is:

1. choose a coding tool such as Claude, Codex, or another supported agent
2. choose whether you want to work in a desktop app or in the CLI
3. create or sign in to your account and then follow the instructions below to install `npx` and the Spezi Vibe skills

### Install `npx`

The easiest way to get `npx` is to install [Node.js](https://nodejs.org/). `npm` and `npx` are included with standard Node.js installations.

1. Install a current Node.js release from [nodejs.org](https://nodejs.org/).
2. Confirm the tools are available:

```bash
node -v
npm -v
npx -v
```

3. Use `npx skills` to install Spezi Vibe into your coding agent.

### Install Skills

We use the [skills](https://github.com/vercel-labs/skills) tool for installing and sharing reusable skills across supported agents.

Install every skill from this repository:

```bash
npx skills add StanfordSpezi/SpeziVibe --all
```

If you want to target a specific agent, add `-a claude-code`, `-a codex`, or another supported agent:

```bash
npx skills add StanfordSpezi/SpeziVibe --skill '*' -a claude-code
```

## Where To Start

The fastest way to get started is to run `build-an-app` — it asks a few questions about your idea, decides which planning skills you need, walks you through each one, and hands off to implementation. You can also run any skill individually if you know what you need.

These skills fit best when used as part of a Biodesign-style process rather than as isolated prompts.

### 1. Explore the Problem Space

Start by understanding the clinical or operational problem before deciding on a product.

Use:

- `biodesign-needs-finding` to investigate the problem, affected stakeholders, and desired outcomes

### 2. Define and Filter the Need

Refine the need statement until it is specific, evidence-grounded, and free of embedded solutions. From there, compare possible need directions and decide which are compelling enough to pursue.

Use:

- `biodesign-needs-finding` to define the problem, population, and outcome clearly

### 3. Explore Solutions

Once the need is well defined, begin exploring solution directions and delivery models.

Use:

- `spezi-platform-selection` to decide whether the project is better suited to the React Native Template App or the Spezi Template Application for Apple Platforms
- `digital-health-ux-planning` to reason about user journeys, onboarding, engagement, and workflow design
- `digital-health-study-planning` when the product is tied to a research or study workflow

### 4. Structure the Prototype Well

Before implementing deeply, make sure the prototype is grounded in durable structures for health data, interoperability, privacy, and governance.

Use:

- `health-data-model-planning` to define the core entities, relationships, and FHIR-oriented data structures
- `fhir-data-model-design` to map clinical concepts into interoperable FHIR resources and terminology
- `digital-health-compliance-planning` to think through privacy, research, and regulatory expectations early

### 5. Plan the Build

Before jumping into code, feed your planning outputs into `app-build-planner` to get a sequenced implementation plan. The output is a structured document (`docs/implementation-plan.md`) that you save in your cloned template repository.

Use:

- `app-build-planner` to extract features from your planning work, map them to available packages or modules, and sequence everything into milestones you can build one at a time

### 6. Move Into Implementation

After the need, solution direction, and core structures are clear, move into the template repository you selected and use `docs/implementation-plan.md` as your guide. Work through the milestones with your coding agent and use the template's repo-local skills for implementation-specific guidance.

## Skill Catalog

This repository is organized for `npx skills`, with one skill per folder under `skills/`.

| Skill | What it does |
|-------|-------------|
| `build-an-app` | Walk through the full process — from idea to running code |
| `spezi-platform-selection` | Choose the right app foundation — React Native or Apple-native |
| `biodesign-needs-finding` | Turn an idea into a real clinical need |
| `digital-health-study-planning` | Plan a study around the app |
| `digital-health-compliance-planning` | Think through privacy and regulatory risk early |
| `health-data-model-planning` | Shape the app's health data backbone |
| `digital-health-ux-planning` | Design a patient- and clinician-friendly experience |
| `fhir-data-model-design` | Map clinical concepts to FHIR |
| `app-build-planner` | Turn planning outputs into a milestone-based build plan |
| `keep-a-changelog-generator` | Draft changelogs people can actually read |
| `release-notes-generator` | Summarize a release clearly |

### `build-an-app`

Walk through the full process of building a digital health app — asks about your idea, decides which planning skills you need, runs them in order, and hands off to implementation. Start here if you are unsure where to begin.

<details><summary>Install</summary>

```bash
npx skills add StanfordSpezi/SpeziVibe --skill build-an-app
```

</details>

### `spezi-platform-selection`

Choose the right app foundation — helps you decide whether a project is better served by the React Native Template App or the Spezi Template Application for Apple Platforms, then points the coding agent at the right next steps.

<details><summary>Install</summary>

```bash
npx skills add StanfordSpezi/SpeziVibe --skill spezi-platform-selection
```

</details>

### `biodesign-needs-finding`

Turn an idea into a real clinical need — guides a team through a Stanford Biodesign-style needs-finding process so they define the problem well before jumping to a solution.

<details><summary>Install</summary>

```bash
npx skills add StanfordSpezi/SpeziVibe --skill biodesign-needs-finding
```

</details>

### `digital-health-study-planning`

Plan a study around the app — helps shape a digital health study or research workflow, including recruitment, consent, assessments, schedules, and outcome measures.

<details><summary>Install</summary>

```bash
npx skills add StanfordSpezi/SpeziVibe --skill digital-health-study-planning
```

</details>

### `digital-health-compliance-planning`

Think through privacy and regulatory risk early — helps teams reason about HIPAA, IRB, FDA, GDPR, and adjacent compliance questions before implementation gets too far ahead.

<details><summary>Install</summary>

```bash
npx skills add StanfordSpezi/SpeziVibe --skill digital-health-compliance-planning
```

</details>

### `health-data-model-planning`

Shape the app's health data backbone — helps define core health concepts, entities, relationships, lifecycle states, and interoperability needs before implementation begins.

If you are working inside the React Native Template App, the repo-local `data-model` skill carries the implementation-focused guidance for app entities, FHIR mappings, storage, and sync behavior.

<details><summary>Install</summary>

```bash
npx skills add StanfordSpezi/SpeziVibe --skill health-data-model-planning
```

</details>

### `digital-health-ux-planning`

Design a patient- and clinician-friendly experience — helps plan onboarding, core journeys, engagement loops, and day-to-day workflows for digital health products.

<details><summary>Install</summary>

```bash
npx skills add StanfordSpezi/SpeziVibe --skill digital-health-ux-planning
```

</details>

### `fhir-data-model-design`

Map clinical concepts to FHIR — translates clinical requirements into a FHIR R4-oriented data model with concrete resources, relationships, and implementation guidance.

FHIR implementation review is now part of the React Native Template App's repo-local `fhir` skill, where it can stay aligned with the actual app mappings and services.

<details><summary>Install</summary>

```bash
npx skills add StanfordSpezi/SpeziVibe --skill fhir-data-model-design
```

</details>

### `app-build-planner`

Turn planning outputs into a milestone-based build plan — extracts features from your UX, data model, compliance, and study planning work, maps them to available packages or framework modules, and sequences everything into milestones you can build and review one at a time.

<details><summary>Install</summary>

```bash
npx skills add StanfordSpezi/SpeziVibe --skill app-build-planner
```

</details>

### `keep-a-changelog-generator`

Draft changelogs people can actually read — turns git history into structured changelog entries using the Keep a Changelog format and clearer user-facing language.

<details><summary>Install</summary>

```bash
npx skills add StanfordSpezi/SpeziVibe --skill keep-a-changelog-generator
```

</details>

### `release-notes-generator`

Summarize a release clearly — helps generate release notes that explain features, fixes, and migration concerns in a concise way for real users and collaborators.

<details><summary>Install</summary>

```bash
npx skills add StanfordSpezi/SpeziVibe --skill release-notes-generator
```

</details>

## Philosophy

These skills are meant to be:

- practical enough to support real implementation decisions
- reusable across multiple digital health projects
- approachable for teams that are new to AI coding workflows
- structured cleanly enough to install and share with standard skills tooling

## License

This project is licensed under the MIT License. See [LICENSE.md](LICENSE.md) and [LICENSES/](LICENSES/) for details.

## Contributors

This project is developed as part of the Stanford Mussallem Center for Biodesign at Stanford University.
See [CONTRIBUTORS.md](CONTRIBUTORS.md) for the current contributor list.

![Stanford Biodesign Footer](https://raw.githubusercontent.com/StanfordBDHG/.github/main/assets/biodesign-footer-light.png#gh-light-mode-only)
![Stanford Biodesign Footer](https://raw.githubusercontent.com/StanfordBDHG/.github/main/assets/biodesign-footer-dark.png#gh-dark-mode-only)
