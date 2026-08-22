---
name: spezi-platform-selection
description: Choose between React Native and Apple-native for a digital health app, set up the matching Spezi starter template, and move existing planning briefs into the new project so the coding agent has full context for implementation.
---

<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# Spezi Platform Selection

Use this skill when a user has finished planning, wants to start from a Spezi template, and is ready to build. It chooses between **React Native** and **Apple-native** based on the planning briefs, sets up the matching Spezi starter template (generating the app with the official CLI for React Native, cloning for Apple-native), and moves the existing `docs/planning/` and `docs/implementation-plan.md` into the new project so the coding agent has full context.

This skill should run **after** the other planning skills, not before — the platform choice is informed by what the planning revealed (HealthKit needs, cross-platform requirements, etc.).

## When Not To Use

Skip this skill if the user is not adopting a Spezi template — for example, they're extending an existing app, using a different framework (Flutter, web, etc.), or want full control over scaffolding. The planning briefs and implementation plan work just as well in any codebase; the user can hand them to their coding agent directly. In the `build-an-app` flow, an opt-out here hands back to the orchestrator's Step 4, which sets up the project with the chosen framework and narrows a still-undecided implementation plan.

## Platform Options

Read [setup-guide.md](references/setup-guide.md) before making the recommendation.

- **React Native** — cross-platform (iOS + Android) from one codebase. Backed by the [SpeziVibe React Native Template](https://github.com/StanfordSpezi/SpeziVibeReactNativeTemplate).
- **Apple-native** — Swift / SwiftUI for iPhone, iPad, and Vision Pro. Backed by the [Spezi Template Application](https://github.com/StanfordSpezi/SpeziTemplateApplication) for Apple platforms.

## Ask First

Ask concise questions that reveal whether the app is primarily:

- content, forms, scheduling, chat, or cross-platform workflow support
- deeply integrated with HealthKit, SensorKit, Bluetooth peripherals, background collection, or another Apple-native SDK

Confirm:

1. who the users are
2. whether Android support matters at launch
3. whether the app is iPhone-only or Apple-platform focused
4. whether native Apple capabilities are core to product value

## Decide The Platform

Read [platform-decision.md](references/platform-decision.md) before deciding.

Choose **React Native** when:

- cross-platform delivery (iOS + Android) matters
- the product is primarily content, questionnaires, scheduling, chat, or lightweight integrations

Choose **Apple-native** when:

- HealthKit, SensorKit, or another Apple-native SDK is product-critical (Bluetooth peripherals alone don't force the choice — cross-platform BLE libraries exist; when requirements pull both ways, follow platform-decision.md's "When Both Matter" guidance)
- the app is explicitly for iPhone, iPad, or Vision Pro
- deep platform integration matters more than cross-platform reach

## Prepare The Machine

After deciding on a platform, guide the user through the matching setup steps in [setup-guide.md](references/setup-guide.md) before template setup and implementation.

- For **Apple-native**, prefer helping the user install and validate Xcode first.
- For **React Native**, help the user set up a proper Expo and React Native development environment for the targets they care about.

Make sure the user is clear whether they want:

- quick experimentation on a physical device
- simulator or emulator-based development
- development builds with native capabilities

## Set Up The Selected Template

Ask the user where the project should live — a sibling directory of the planning directory, named after the app, is a good default. Then use the bundled helper instead of ad hoc commands:

- React Native: `scripts/clone-template.sh react-native <destination>` — runs the template's official generator (`npx create-spezivibe-app`), which prompts for a backend and optional features and produces a standalone app. Do **not** clone the SpeziVibeReactNativeTemplate repository directly: it is a monorepo of CLI, packages, and template infrastructure, not an app.
- Apple-native: `scripts/clone-template.sh apple-native <destination>` — clones the Spezi Template Application.

If the React Native generator fails (the script reports the app was not created), don't improvise a clone of the template monorepo — check the [template repository's README](https://github.com/StanfordSpezi/SpeziVibeReactNativeTemplate) for the current generation instructions and surface the failure to the user.

For the Apple-native clone, the helper renames the `origin` remote to `template`, so the user cannot accidentally push their project (and planning briefs) to the Stanford template repository. The React Native generator produces a fresh project with no remote. Either way, before the user pushes, help them create their own repository and add it as `origin`.

## Carry Planning Forward

If the current working directory contains a `docs/planning/` directory or a `docs/implementation-plan.md` produced by the other planning skills, **move them into the template project** so the coding agent picks up the full plan from the right place.

First check whether the project already contains `docs/planning/` or `docs/implementation-plan.md` (from a template update or a previous run). If it does, **merge file by file rather than running the block below** — `mv` against an existing directory does not merge, it silently nests the new briefs inside it (`docs/planning/planning/`). Otherwise:

```bash
mkdir -p <destination>/docs
mv docs/planning <destination>/docs/planning
mv docs/implementation-plan.md <destination>/docs/implementation-plan.md
rmdir docs 2>/dev/null || true
```

The `mkdir -p` matters — the templates do not necessarily ship a `docs/` directory, and `mv` fails without the parent. The trailing `rmdir` clears the emptied `docs/` left behind in the planning directory.

Confirm with the user before moving.

After the move:

1. read the project's `README.md` and any agent instruction files (`AGENTS.md`, `CLAUDE.md`) so implementation follows the template's conventions
2. if `docs/implementation-plan.md` lists its platform as "To be decided", update the Platform field to the chosen platform, trim any dual platform notes (e.g., "questionnaire / SpeziQuestionnaire") down to the chosen side — including in the Feature List's Packages/Modules column — and remove the now-resolved platform question from Open Questions
3. continue implementation inside the template project rather than in the original planning directory

## Output

End with a short summary containing:

- chosen platform (React Native or Apple-native)
- why it was selected (cite the planning briefs that drove the decision)
- machine setup steps completed or still required
- project destination
- whether planning briefs were moved into the project
- next step: ask the coding agent to implement Milestone 1 from `docs/implementation-plan.md`
