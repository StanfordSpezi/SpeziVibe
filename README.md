<div align="center">
  <img src="template/assets/images/rocket-logo.png" alt="SpeziVibe Logo" width="200"/>

  # SpeziVibe

  **Digital health app templates designed for AI coding tools**

  [![Build and Test](https://github.com/StanfordSpezi/SpeziVibe/actions/workflows/ci.yml/badge.svg)](https://github.com/StanfordSpezi/SpeziVibe/actions/workflows/ci.yml)
  [![Built with Expo](https://img.shields.io/badge/Built%20with-Expo-000020.svg?style=flat&logo=expo)](https://expo.dev)
  [![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB.svg?style=flat&logo=react)](https://reactnative.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
</div>

> [!WARNING]
> This toolkit is a work in progress and not yet stable for production use.

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

The CLI will prompt you to choose a backend and features, then generate a complete Expo app. Once running, press `i` for iOS, `a` for Android, or `w` for Web.

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

## Documentation

- [Architecture Guide](./ARCHITECTURE.md) - System design and patterns
- [CLI Guide](./cli/README.md) - CLI options and customization
- [Contributing](./CONTRIBUTING.md) - How to contribute

## License

MIT License. See [Licenses](https://github.com/StanfordSpezi/Spezi/tree/main/LICENSES) for details.

![Spezi Footer](https://raw.githubusercontent.com/StanfordSpezi/.github/main/assets/Footer.png#gh-light-mode-only)
![Spezi Footer](https://raw.githubusercontent.com/StanfordSpezi/.github/main/assets/Footer~dark.png#gh-dark-mode-only)
