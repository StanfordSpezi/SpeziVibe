---
sidebar_position: 9
---

# spezi-platform-selection

:::tip Install this skill

```bash
npx skills add StanfordSpezi/SpeziVibe --skill spezi-platform-selection
```

Or install all skills: `npx skills add StanfordSpezi/SpeziVibe --all`. See the [Getting Started guide](/docs/getting-started) for tool-specific options.

:::

Runs **after** the other planning skills finish, when the user is ready to build with a Spezi template. Uses the planning briefs to recommend a platform, sets up the matching Spezi starter template — React Native apps are generated with the official `create-spezivibe-app` CLI, Apple-native clones the Spezi Template Application — and moves the existing `docs/planning/` and `docs/implementation-plan.md` into the new project so the coding agent has full context.

Skip this skill if you're not using a Spezi template — your planning briefs and implementation plan work just as well in any codebase. See [Building Without a Spezi Template](/docs/how-it-works#building-without-a-spezi-template).

## Platform Options

- **React Native** — cross-platform (iOS + Android) from one codebase. Good for forms, questionnaires, chat, and lightweight integrations. Backed by the Spezi React Native Template App.
- **Apple-native** — Swift / SwiftUI for iPhone, iPad, and Vision Pro. Use when HealthKit, SensorKit, Bluetooth, or deep Apple integration is core to the product. Backed by the Spezi Template Application for Apple Platforms.

## How It Works

1. Reads the planning briefs to understand requirements
2. Recommends React Native or Apple-native with reasoning grounded in the briefs
3. Checks your development machine setup (Xcode, Node.js, etc.)
4. Sets up the matching starter template at a location you specify (CLI-generated for React Native, cloned for Apple-native)
5. Moves your planning briefs and implementation plan into the new project

## Output

A template project with working navigation, theming, and project structure, plus your `docs/planning/` and `docs/implementation-plan.md` already inside it. From here, your AI coding agent reads the plan and starts building.

## Example

```
AI:   What kind of app are you building? Does it primarily involve
      forms, questionnaires, and chat — or does it need HealthKit,
      SensorKit, Bluetooth, or deep Apple integration?

You:  It needs to read heart rate and step data from Apple Watch
      and connect to a Bluetooth blood pressure cuff

AI:   Those require HealthKit and CoreBluetooth, which work best
      natively on Apple platforms. I'd recommend going Apple-native.

      Let me check your setup — do you have Xcode installed?

You:  Yes, Xcode 16

AI:   Great. I'll clone the Spezi iOS template into your project
      directory and walk you through the structure.
```

## Limitations

- Machine setup must complete before template setup
- Switching platforms after cloning requires starting over
