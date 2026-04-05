---
sidebar_position: 3
---

# spezi-platform-selection

Helps you choose between two template applications, sets up your development machine, and clones the appropriate starter repo.

## Platform Options

- **React Native Template App** — Cross-platform (iOS, Android). Good for forms, questionnaires, chat, and lightweight integrations.
- **Spezi Template Application for Apple Platforms** — iPhone, iPad, Vision Pro. For apps requiring HealthKit, SensorKit, Bluetooth, or deep Apple integration.

## How It Works

1. Evaluates your requirements and constraints
2. Recommends a template with reasoning
3. Checks your development machine setup (Xcode, Node.js, etc.)
4. Clones the chosen template to a location you specify

## Output

A cloned template repository with working navigation, theming, and project structure. All subsequent work happens inside the cloned repo.

## Example

```
AI:   What kind of app are you building? Does it primarily involve
      forms, questionnaires, and chat — or does it need HealthKit,
      SensorKit, Bluetooth, or deep Apple integration?

You:  It needs to read heart rate and step data from Apple Watch
      and connect to a Bluetooth blood pressure cuff

AI:   Those require HealthKit and CoreBluetooth, which are only
      available natively on Apple platforms. I'd recommend the
      Spezi Template Application.

      Let me check your setup — do you have Xcode installed?

You:  Yes, Xcode 16

AI:   Great. I'll clone the Spezi Template Application to your
      project directory and walk you through the structure.
```

## Limitations

- Machine setup must complete before cloning
- Switching platforms after cloning requires starting over
