---
name: spezi-platform-selection
description: Ask about an app's requirements, explain the tradeoff between the React Native Template App and the Spezi Template Application for Apple Platforms, clone the right repository, and hand off to the cloned project's local skills and instructions.
---

<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# Spezi Platform Selection

Use this skill when a user needs help choosing the right starter application and bootstrapping a new project.

## Candidate Templates

Read [setup-guide.md](references/setup-guide.md) before making the recommendation.

- **React Native Template App**
- **Spezi Template Application for Apple Platforms**

The Apple Platforms template supports iPhone, iPad, and Vision Pro.

## Ask First

Ask concise questions that reveal whether the app is primarily:

- content, forms, scheduling, chat, or cross-platform workflow support
- deeply integrated with HealthKit, SensorKit, Bluetooth peripherals, background collection, or another Apple-native SDK

Confirm:

1. who the users are
2. whether cross-platform support matters at launch
3. whether the app is iPhone-only or Apple-platform focused
4. whether native Apple capabilities are core to product value

## Decide The Platform

Read [platform-decision.md](references/platform-decision.md) before deciding.

Choose the **React Native Template App** when:

- cross-platform delivery matters
- the product is primarily content, questionnaires, scheduling, chat, or lightweight integrations

Choose the **Spezi Template Application for Apple Platforms** when:

- HealthKit, SensorKit, Bluetooth, or another Apple-native SDK is product-critical
- the app is explicitly for iPhone, iPad, or Vision Pro
- deep platform integration matters more than cross-platform reach

## Prepare The Machine

After deciding on a platform, guide the user through the matching setup steps in [setup-guide.md](references/setup-guide.md) before cloning and implementation.

- For the **Spezi Template Application for Apple Platforms**, prefer helping the user install and validate Xcode first.
- For the **React Native Template App**, help the user set up a proper Expo and React Native development environment for the targets they care about.

Make sure the user is clear whether they want:

- quick experimentation on a physical device
- simulator or emulator-based development
- development builds with native capabilities

## Clone The Selected Template

Use the bundled clone helper instead of writing ad hoc clone commands:

- `scripts/clone-template.sh rn-cs342-template <destination>`
- `scripts/clone-template.sh spezi-template <destination>`

After cloning:

1. inspect the cloned repository's local instructions
2. inspect the cloned repository's `skills/` directory if present
3. continue implementation inside the cloned repository rather than in this root repo

## Output

End with a short summary containing:

- chosen template
- why it was selected
- machine setup steps completed or still required
- clone destination
- the next local skills or instructions to inspect in the cloned repository
