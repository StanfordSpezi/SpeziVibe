<div align="center">
  <img src="template/assets/images/rocket-logo.png" alt="SpeziVibe Logo" width="200"/>

  # SpeziVibe

  **Digital health app templates designed for AI coding tools**

  [![Build and Test](https://github.com/StanfordSpezi/SpeziVibe/actions/workflows/ci.yml/badge.svg)](https://github.com/StanfordSpezi/SpeziVibe/actions/workflows/ci.yml)
  [![Built with Expo](https://img.shields.io/badge/Built%20with-Expo-000020.svg?style=flat&logo=expo)](https://expo.dev)
  [![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB.svg?style=flat&logo=react)](https://reactnative.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
</div>

---

## About

SpeziVibe is a toolkit for rapidly building digital health apps using [React Native](https://reactnative.dev/), [Expo](https://expo.dev/) and AI coding tools.

## Quick Start

The SpeziVibe command line interface (CLI) allows you to quickly scaffold an app with pre-built features that can then be customized using AI coding tools.

**Prerequisites:** 
[Node.js 20+](https://nodejs.org/en)

```bash
npx create-spezivibe-app my-app
```

The CLI will prompt you to choose a backend and features, then generate a complete Expo app in a directory of your choosing. You can then run the app using the following command in the newly created app directory:

```bash
npx expo start
```

Once running, press `i` for iOS, `a` for Android, or `w` for Web.

### HIPAA Mode

For apps handling Protected Health Information (PHI), use the `--hipaa` flag:

```bash
npx create-spezivibe-app my-health-app --hipaa
```

HIPAA mode adds:
- **Audit logging** via `@spezivibe/audit` (tracks all PHI access)
- **Session timeout** (auto-logout after 15 min inactivity)
- **PHI sanitization** (strips sensitive data from logs)
- **Enhanced security rules** (role-based access for Firebase)
- **HIPAA_CHECKLIST.md** (backend-specific compliance checklist)
- **BAA reminder** (Business Associate Agreement guidance)

The CLI also prompts interactively: "Will this app handle Protected Health Information (PHI)?"

### HealthKit: Custom Dev Client Required

If you selected the **HealthKit** feature, you cannot use Expo Go because HealthKit requires native iOS code. You'll need to create a custom development client:

```bash
npx expo run:ios
```

This command will:
1. Generate the native iOS project (if not already present)
2. Build the app with HealthKit capabilities
3. Install it on your iOS Simulator or connected device

> **Note:** HealthKit only works on iOS. For physical devices, you'll need an Apple Developer account and proper provisioning profiles.

After the initial build, you can use `npx expo start` for faster development iterations - it will automatically connect to your custom dev client instead of Expo Go.

## Backends

SpeziVibe comes with the following pre-built backend integrations you can add into your template:

| Backend | Description |
|---------|-------------|
| **Medplum** | FHIR R4 healthcare backend with [Medplum](https://medplum.com), cloud-based or self-hosted |
| **Firebase** | Google Cloud-based backend with authentication and data store |
| **Local** | On-device data storage, no server required |

## Features

SpeziVibe comes with pre-built features you can add into your template to help you get started faster:

| Feature | Description |
|---------|-------------|
| **Chat** | AI chat interface with OpenAI, Anthropic, or Google integration |
| **Scheduler** | Task scheduling and recurring reminders |
| **Questionnaire** | FHIR-compliant questionnaires |
| **Onboarding** | Welcome flow with informed consent and account creation |
| **HealthKit** | Apple Health integration for health data access (iOS only) |

## Claude Code Commands

Every generated app includes Claude Code slash commands for AI-assisted development. These are available in the `.claude/commands/` directory of your generated project.

### Development Commands

| Command | Description |
|---------|-------------|
| `/feature` | Create new app features, screens, tabs, hooks, and components |
| `/test` | Generate Jest tests following project patterns (unit, component, FHIR round-trip) |
| `/docs` | Generate documentation and READMEs for your app |
| `/fhir` | Validate code for FHIR R4 compliance |
| `/fhir-mapping` | Generate bidirectional FHIR resource mappings with round-trip tests |
| `/fhir-designer` | Design FHIR data models from clinical concepts, generate sample JSON, recommend profiles |
| `/changelog` | Generate changelogs from git history using Keep a Changelog format |
| `/release` | Create release notes with migration guides for new versions |

### Planning Commands

| Command | Description |
|---------|-------------|
| `/study-planner` | Plan health studies, research protocols, data collection, and assessment schedules |
| `/compliance` | Plan HIPAA, IRB, FDA, and GDPR regulatory compliance |
| `/data-model` | Design health data models, FHIR resource structures, and HealthKit mappings |
| `/ux-planner` | Design user flows, onboarding, engagement strategies, and accessibility |

### Usage

Invoke a command in Claude Code with optional context:

```
/feature add a medication tracking tab
/study-planner design a 12-week diabetes management study
/compliance review HIPAA requirements for our app
/test write tests for the auth service
```

## Documentation

- [Architecture Guide](./ARCHITECTURE.md) - System design and patterns
- [CLI Guide](./cli/README.md) - CLI options and customization
- [Contributing](./CONTRIBUTING.md) - How to contribute

## License

MIT License. See [Licenses](https://github.com/StanfordSpezi/Spezi/tree/main/LICENSES) for details.

![Spezi Footer](https://raw.githubusercontent.com/StanfordSpezi/.github/main/assets/Footer.png#gh-light-mode-only)
![Spezi Footer](https://raw.githubusercontent.com/StanfordSpezi/.github/main/assets/Footer~dark.png#gh-dark-mode-only)
