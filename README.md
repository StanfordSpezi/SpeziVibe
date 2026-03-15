<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# Spezi Vibe

Spezi Vibe is a collection of installable skills for people building digital health software with modern AI coding tools.

The goal is simple: make digital health development more accessible by packaging reusable product, clinical, regulatory, interoperability, and platform guidance into skills that can be installed in minutes and used directly in real projects.

This work supports the broader [Spezi](https://github.com/StanfordSpezi) mission of lowering the barrier to building thoughtful, high-quality digital health experiences.

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

## Install `npx`

The easiest way to get `npx` is to install [Node.js](https://nodejs.org/). `npm` and `npx` are included with standard Node.js installations.

1. Install a current Node.js release from [nodejs.org](https://nodejs.org/).
2. Confirm the tools are available:

```bash
node -v
npm -v
npx -v
```

3. Use `npx skills` to install Spezi Vibe into your coding agent.

## Install All Skills

We use the [skills](https://github.com/vercel-labs/skills) tool for installing and sharing reusable skills across supported agents.

List the available skills first:

```bash
npx skills add StanfordSpezi/SpeziVibe --list
```

Install every skill from this repository:

```bash
npx skills add StanfordSpezi/SpeziVibe --all
```

If you want to target a specific agent, add `-a claude-code`, `-a codex`, or another supported agent:

```bash
npx skills add StanfordSpezi/SpeziVibe --skill '*' -a claude-code
```

## Skill Catalog

This repository is organized for `npx skills`, with one skill per folder under `skills/`.

### `spezi-platform-selection`

**Headline:** Choose the right app foundation

**What it does:** Helps you decide whether a project is better served by the React Native Template App or the Spezi Template Application for Apple Platforms, then points the coding agent at the right next steps.

**Install with `npx`:**

```bash
npx skills add StanfordSpezi/SpeziVibe --skill spezi-platform-selection
```

### `biodesign-needs-finding`

**Headline:** Turn an idea into a real clinical need

**What it does:** Guides a team through a Stanford Biodesign-style needs-finding process so they define the problem well before jumping to a solution.

**Install with `npx`:**

```bash
npx skills add StanfordSpezi/SpeziVibe --skill biodesign-needs-finding
```

### `digital-health-study-planning`

**Headline:** Plan a study around the app

**What it does:** Helps shape a digital health study or research workflow, including recruitment, consent, assessments, schedules, and outcome measures.

**Install with `npx`:**

```bash
npx skills add StanfordSpezi/SpeziVibe --skill digital-health-study-planning
```

### `digital-health-compliance-planning`

**Headline:** Think through privacy and regulatory risk early

**What it does:** Helps teams reason about HIPAA, IRB, FDA, GDPR, and adjacent compliance questions before implementation gets too far ahead.

**Install with `npx`:**

```bash
npx skills add StanfordSpezi/SpeziVibe --skill digital-health-compliance-planning
```

### `health-data-model-planning`

**Headline:** Shape the app's health data backbone

**What it does:** Helps define core health concepts, entities, relationships, lifecycle states, and interoperability needs before implementation begins.

**Install with `npx`:**

```bash
npx skills add StanfordSpezi/SpeziVibe --skill health-data-model-planning
```

If you are working inside the React Native Template App, the repo-local `data-model` skill carries the implementation-focused guidance for app entities, FHIR mappings, storage, and sync behavior.

### `digital-health-ux-planning`

**Headline:** Design a patient- and clinician-friendly experience

**What it does:** Helps plan onboarding, core journeys, engagement loops, and day-to-day workflows for digital health products.

**Install with `npx`:**

```bash
npx skills add StanfordSpezi/SpeziVibe --skill digital-health-ux-planning
```

### `fhir-data-model-design`

**Headline:** Map clinical concepts to FHIR

**What it does:** Translates clinical requirements into a FHIR R4-oriented data model with concrete resources, relationships, and implementation guidance.

**Install with `npx`:**

```bash
npx skills add StanfordSpezi/SpeziVibe --skill fhir-data-model-design
```

FHIR implementation review is now part of the React Native Template App's repo-local `fhir` skill, where it can stay aligned with the actual app mappings and services.

### `keep-a-changelog-generator`

**Headline:** Draft changelogs people can actually read

**What it does:** Turns git history into structured changelog entries using the Keep a Changelog format and clearer user-facing language.

**Install with `npx`:**

```bash
npx skills add StanfordSpezi/SpeziVibe --skill keep-a-changelog-generator
```

### `release-notes-generator`

**Headline:** Summarize a release clearly

**What it does:** Helps generate release notes that explain features, fixes, and migration concerns in a concise way for real users and collaborators.

**Install with `npx`:**

```bash
npx skills add StanfordSpezi/SpeziVibe --skill release-notes-generator
```

## Where To Start

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

### 5. Move Into Implementation

After the need, solution direction, and core structures are clear, move into the template repository you selected and use its repo-local skills for implementation, testing, and release work.

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
