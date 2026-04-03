---
sidebar_position: 1
slug: /getting-started
---

# Getting Started

SpeziVibe is a collection of installable skills for AI coding tools. Each skill walks you through a specific digital health planning area — needs analysis, compliance, data modeling, UX, study design — and produces a structured markdown document you can build from.

## Installation

Install all skills with a single command:

```bash
npx skills add StanfordSpezi/SpeziVibe --all
```

Skills are tool-agnostic. They work with **Claude Code**, **Cursor**, **GitHub Copilot**, **OpenAI Codex**, **Gemini CLI**, and any other tool that supports installable skills or custom instructions.

## Quick Start

Once installed, start by describing what you want to build. The **build-an-app** skill figures out which planning steps apply and walks you through each one interactively:

1. **Describe your app** — Tell your AI coding tool what you want to build
2. **Work through each skill** — Each relevant skill asks you questions and produces a planning document (e.g., `need-statement.md`, `compliance-brief.md`, `ux-brief.md`)
3. **Get an implementation plan** — The app-build-planner reads your planning docs and produces a milestone-based build plan

## What's Included

SpeziVibe includes skills organized into planning and release categories:

### Planning Skills
- **build-an-app** — Orchestrates the other skills based on what you describe; walks you through each one in order
- **biodesign-needs-finding** — Guided needs-finding using the Stanford Biodesign process; produces `need-statement.md`
- **spezi-platform-selection** — Helps choose between React Native and Apple-native, sets up your dev environment, and clones the starter repo
- **digital-health-study-planning** — Plans a research protocol including enrollment, consent, assessments, and outcomes; produces `study-brief.md`
- **digital-health-compliance-planning** — Walks through HIPAA, IRB, FDA, GDPR applicability and recommends controls; produces `compliance-brief.md` (not legal advice)
- **health-data-model-planning** — Defines health data entities, relationships, and FHIR fit; produces `data-model-brief.md`
- **digital-health-ux-planning** — Plans user journeys, onboarding, and engagement for patients and clinicians; produces `ux-brief.md`
- **fhir-data-model-design** — Maps clinical data to FHIR R4 resources with terminology bindings and sample JSON; produces `fhir-data-model.md`
- **app-build-planner** — Reads planning docs and produces a milestone-based implementation plan; produces `implementation-plan.md`

### Release Skills
- **keep-a-changelog-generator** — Generates changelog entries from git history in Keep a Changelog format
- **release-notes-generator** — Creates user-facing release notes with features, fixes, and migration guidance

## Next Steps

- Browse the [Skills reference](/docs/skills) for detailed descriptions of each skill
- Visit the [GitHub repository](https://github.com/StanfordSpezi/SpeziVibe) for source code and contributions
