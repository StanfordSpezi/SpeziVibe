---
sidebar_position: 9
description: Compare React Native and Apple-native, then set up an optional Spezi starter project.
---

# Choose a platform and starter

:::tip Install this skill

```bash
npx skills add StanfordSpezi/SpeziVibe --skill spezi-platform-selection
```

Or install all skills: `npx skills add StanfordSpezi/SpeziVibe --skill '*'`. See the [Getting Started guide](/docs/getting-started) for tool-specific options.

:::

Runs **after** the other planning skills finish, when the user is ready to build with a Spezi template. Uses the planning briefs to recommend a platform, sets up the matching Spezi starter template — React Native apps are generated with the official `create-spezivibe-app` CLI, Apple-native clones the Spezi Template Application — and moves the existing `docs/planning/` and `docs/implementation-plan.md` into the new project so the coding agent has full context.

Skip this skill if you're not using a Spezi template — your planning briefs and implementation plan work just as well in any codebase. See [Building Without a Spezi Template](/docs/how-it-works#building-without-a-spezi-template).

## Platform Options

- **React Native** — React Native and Expo for iOS and Android from one codebase. A good fit when cross-platform delivery matters. Backed by the [SpeziVibe React Native Template](https://github.com/StanfordSpezi/SpeziVibeReactNativeTemplate), whose generator offers backend and optional feature choices.
- **Apple-native** — Swift / SwiftUI for iPhone, iPad, and Vision Pro. A good fit when HealthKit, SensorKit, or deep Apple integration is central to the app. Backed by the [Spezi Template Application](https://github.com/StanfordSpezi/SpeziTemplateApplication) and [Spezi’s Swift modules](/framework#modules).

Bluetooth alone does not require Apple-native development; cross-platform libraries are available. If you need both Android support and deep Apple integrations, the skill helps weigh those requirements and identify any native integration work.

The templates have different capabilities. The React Native template has its own implementation skills; bridges to native Spezi modules are on its [roadmap](https://github.com/StanfordSpezi/SpeziVibeReactNativeTemplate#contributing).

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
AI:   Who will use the app? Does it need to support Android,
      and which health data or device integrations matter most?

You:  It's for iPhone users. It needs heart rate and step data
      from Apple Health and a Bluetooth blood pressure cuff.

AI:   I'd recommend Apple-native for your iPhone-focused app
      and HealthKit needs. We'll also check whether Spezi supports
      your cuff's model and Bluetooth services.

      Let me check your setup — do you have Xcode installed?

You:  Yes.

AI:   Let's verify the Xcode version meets the template's requirements,
      then choose a folder for the app. I'll set up the Apple-native
      template there and bring your planning documents with it.
```

## Limitations

- Machine setup must complete before template setup
- Changing platforms later requires revisiting the app foundation and platform-specific code; your planning briefs can still be reused
