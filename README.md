<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

<p align="center">
  <img src="assets/rocket-logo.png" alt="Spezi Vibe Logo" width="200"/>
</p>

<h1 align="center">SpeziVibe</h1>

<p align="center">
  <strong>Installable skills for building digital health software with AI coding tools.</strong>
</p>

<p align="center">
  <a href="https://github.com/StanfordSpezi/SpeziVibe/actions/workflows/build.yml"><img src="https://img.shields.io/github/actions/workflow/status/StanfordSpezi/SpeziVibe/build.yml?style=flat-square&label=build" alt="Build Status"/></a>
  <a href="https://github.com/StanfordSpezi/SpeziVibe/releases"><img src="https://img.shields.io/github/v/release/StanfordSpezi/SpeziVibe?label=latest%20release&style=flat-square" alt="Latest Release"/></a>
  <a href="LICENSE.md"><img src="https://img.shields.io/github/license/StanfordSpezi/SpeziVibe?style=flat-square" alt="MIT License"/></a>
</p>

---

Spezi Vibe packages reusable product, clinical, regulatory, interoperability, and platform guidance into skills that can be installed in minutes and used directly in real projects.

This work supports the broader [Stanford Spezi](https://github.com/StanfordSpezi) mission of lowering the barrier to building thoughtful, high-quality digital health experiences.

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

### Manual Install

If you prefer not to use `npx`, download the latest `spezivibe-skills.zip` from [Releases](https://github.com/StanfordSpezi/SpeziVibe/releases), unzip it, and copy the skill folders into your coding tool's skills directory (e.g., `.claude/skills/` for Claude Code).

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

The fastest way to get started is to run `build-an-app`. Describe what you want to build and it figures out which planning skills you need, runs them in order, and hands the implementation plan off to your AI coding agent for the actual build. You do not need to know the individual skills or their order — the orchestrator handles that for you.

If you prefer to run skills individually, here is the process they follow. Plan first; clone a Spezi template only when the plan is ready and you're set to build. Not every project needs every skill — use what fits.

### 1. Define the Need

Understand the clinical or operational problem before deciding on a product. Investigate the problem space, identify affected stakeholders, and refine a need statement until it is specific, evidence-grounded, and free of embedded solutions.

Use: `biodesign-needs-finding`

### 2. Plan the Product

Design the user experience, data model, and compliance posture. Run whichever skills are relevant — not all are required for every project.

- `digital-health-ux-planning` — user journeys, onboarding, engagement, and day-to-day workflows
- `health-data-model-planning` — core entities, relationships, and FHIR-oriented data structures
- `fhir-data-model-design` — map clinical concepts into interoperable FHIR resources and terminology
- `digital-health-compliance-planning` — privacy, regulatory, and governance expectations
- `digital-health-study-planning` — study protocol, consent, and data collection (only if tied to a research study)

Each skill writes a brief to `docs/planning/` in your working directory.

### 3. Plan the Build

Feed your planning outputs into `app-build-planner` to get a sequenced implementation plan. The output is `docs/implementation-plan.md` — milestones, tasks, dependencies, and verification criteria.

Use: `app-build-planner`

### 4. Choose a Platform and Clone the Template (optional)

Once the plan is in hand, decide whether the project is better suited to React Native or Apple-native, then clone the matching Spezi starter template. This skill uses your planning briefs to inform the recommendation, clones the template, and moves your `docs/planning/` and `docs/implementation-plan.md` into the cloned repo.

Use: `spezi-platform-selection`

> **Skip this if you're not using a Spezi template.** The planning briefs and implementation plan work in any codebase — a blank Expo project, an existing repo, a different framework. Hand them to your coding agent directly and ask it to build Milestone 1.

### 5. Build the App

Ask your AI coding agent to implement Milestone 1 from `docs/implementation-plan.md`. The agent uses your planning briefs as context and the Spezi template's patterns as scaffolding (or your own codebase if you skipped step 4). Build each milestone, verify, then move to the next.

### 6. Keep Learning (Optional)

Set up a project wiki to accumulate knowledge as you build. Every interview, paper, clinical observation, and competitive finding gets ingested into a persistent, AI-maintained knowledge base that compounds over the life of the project. Planning documents from earlier steps seed the wiki automatically.

Use: `project-wiki`

## Skill Catalog

This repository is organized for `npx skills`, with one skill per folder under `skills/`.

Listed in the order they typically run.

| Skill | What it does |
|-------|-------------|
| `build-an-app` | Walk through the full process — from idea to running code |
| `biodesign-needs-finding` | Turn an idea into a real clinical need |
| `digital-health-ux-planning` | Design a patient- and clinician-friendly experience |
| `digital-health-study-planning` | Plan a study around the app |
| `digital-health-compliance-planning` | Think through privacy and regulatory risk early |
| `health-data-model-planning` | Shape the app's health data backbone |
| `fhir-data-model-design` | Map clinical concepts to FHIR |
| `app-build-planner` | Turn planning outputs into a milestone-based build plan |
| `spezi-platform-selection` | Choose React Native or Apple-native and clone the matching Spezi starter template (optional) |
| `project-wiki` | Turn your project into a compounding, AI-maintained knowledge base |
| `keep-a-changelog-generator` | Draft changelogs people can actually read |
| `release-notes-generator` | Summarize a release clearly |

### `build-an-app`

Walk through the full process of building a digital health app — describe what you want to build and it figures out which planning skills you need, runs them in order, and hands off to implementation. Start here if you are unsure where to begin.

<details><summary>Install</summary>

```bash
npx skills add StanfordSpezi/SpeziVibe --skill build-an-app
```

</details>

### `biodesign-needs-finding`

Turn an idea into a real clinical need — guides a team through a Stanford Biodesign-style needs-finding process so they define the problem well before jumping to a solution.

<details><summary>Install</summary>

```bash
npx skills add StanfordSpezi/SpeziVibe --skill biodesign-needs-finding
```

</details>

### `digital-health-ux-planning`

Design a patient- and clinician-friendly experience — helps plan onboarding, core journeys, engagement loops, and day-to-day workflows for digital health products.

<details><summary>Install</summary>

```bash
npx skills add StanfordSpezi/SpeziVibe --skill digital-health-ux-planning
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

<details><summary>Install</summary>

```bash
npx skills add StanfordSpezi/SpeziVibe --skill health-data-model-planning
```

</details>

### `fhir-data-model-design`

Map clinical concepts to FHIR — translates clinical requirements into a FHIR R4-oriented data model with concrete resources, relationships, and implementation guidance.

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

### `spezi-platform-selection`

Choose the right app foundation — helps you decide between **React Native** and **Apple-native** for a new app, clones the matching Spezi starter template, and moves your existing planning briefs into the cloned repo so the coding agent has full context.

<details><summary>Install</summary>

```bash
npx skills add StanfordSpezi/SpeziVibe --skill spezi-platform-selection
```

</details>

### `project-wiki`

Turn your project into a compounding knowledge base — set up a persistent, AI-maintained wiki that grows with every interview, paper, clinical observation, and competitive finding. Inspired by Karpathy's [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) pattern, adapted for the Stanford Biodesign innovation process. Seeds automatically from other SpeziVibe planning documents.

<details><summary>Install</summary>

```bash
npx skills add StanfordSpezi/SpeziVibe --skill project-wiki
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
