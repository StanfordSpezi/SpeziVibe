---
name: spezi-platform-selection
description: Choose between React Native and Apple-native for a digital health app, clone the matching Spezi starter template, and move existing planning briefs into the cloned repo so the coding agent has full context for implementation.
---

<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# Spezi Platform Selection

Use this skill when a user has finished planning, wants to start from a Spezi template, and is ready to build. It chooses between **React Native** and **Apple-native** based on the planning briefs, clones the matching Spezi starter template, and moves the existing `docs/planning/` and `docs/implementation-plan.md` into the cloned repo so the coding agent has full context.

This skill should run **after** the other planning skills, not before — the platform choice is informed by what the planning revealed (HealthKit needs, cross-platform requirements, etc.).

## When Not To Use

Skip this skill if the user is not adopting a Spezi template — for example, they're extending an existing app, using a different framework (Flutter, web, etc.), or want full control over scaffolding. The planning briefs and implementation plan work just as well in any codebase; the user can hand them to their coding agent directly.

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

- HealthKit, SensorKit, Bluetooth, or another Apple-native SDK is product-critical
- the app is explicitly for iPhone, iPad, or Vision Pro
- deep platform integration matters more than cross-platform reach

## Prepare The Machine

After deciding on a platform, guide the user through the matching setup steps in [setup-guide.md](references/setup-guide.md) before cloning and implementation.

- For **Apple-native**, prefer helping the user install and validate Xcode first.
- For **React Native**, help the user set up a proper Expo and React Native development environment for the targets they care about.

Make sure the user is clear whether they want:

- quick experimentation on a physical device
- simulator or emulator-based development
- development builds with native capabilities

## Clone The Selected Template

Use the bundled clone helper instead of writing ad hoc clone commands:

- React Native: `scripts/clone-template.sh react-native <destination>`
- Apple-native: `scripts/clone-template.sh apple-native <destination>`

The helper renames the clone's `origin` remote to `template`, so the user cannot accidentally push their project (and planning briefs) to the Stanford template repository. Before the user pushes, help them create their own repository and add it as `origin`.

## Carry Planning Forward

If the current working directory contains a `docs/planning/` directory or a `docs/implementation-plan.md` produced by the other planning skills, **move them into the cloned repository** so the coding agent picks up the full plan from the right place:

```bash
mv docs/planning <destination>/docs/planning
mv docs/implementation-plan.md <destination>/docs/implementation-plan.md
```

Confirm with the user before moving. If the cloned repo already contains a `docs/planning/` directory, merge rather than overwrite.

After the move:

1. read the cloned repository's `README.md` and any agent instruction files (`AGENTS.md`, `CLAUDE.md`) so implementation follows the template's conventions
2. continue implementation inside the cloned repository rather than in the original planning directory

## Output

End with a short summary containing:

- chosen platform (React Native or Apple-native)
- why it was selected (cite the planning briefs that drove the decision)
- machine setup steps completed or still required
- clone destination
- whether planning briefs were moved into the cloned repo
- next step: ask the coding agent to implement Milestone 1 from `docs/implementation-plan.md`
