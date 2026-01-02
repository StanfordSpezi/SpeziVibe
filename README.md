<div align="center">
  <img src="template/assets/images/rocket-logo.png" alt="SpeziVibe Logo" width="200"/>

  # SpeziVibe

  **Digital health app template for iOS, Android, and Web**

  [![Build and Test](https://github.com/StanfordSpezi/SpeziVibe/actions/workflows/ci.yml/badge.svg)](https://github.com/StanfordSpezi/SpeziVibe/actions/workflows/ci.yml)
  [![Built with Expo](https://img.shields.io/badge/Built%20with-Expo-000020.svg?style=flat&logo=expo)](https://expo.dev)
  [![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB.svg?style=flat&logo=react)](https://reactnative.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
</div>

> [!WARNING]
> This template is a work in progress and not yet stable for production use. Please use [SpeziTemplateApplication](https://github.com/StanfordSpezi/SpeziTemplateApplication) instead.

---

## About

SpeziVibe is a digital health app template built with [React Native](https://reactnative.dev/) and [Expo](https://expo.dev/). Use the CLI to generate a customized app with features like AI chat, task scheduling, and health questionnaires.

## Quick Start

### Prerequisites

- Node.js 20+ and npm
- Expo Go app (for mobile testing) or iOS Simulator/Android Emulator

### Create Your App

> **Note:** The CLI will be available via `npx create-spezivibe-app` soon. For now, run it from the repo:

```bash
git clone https://github.com/StanfordSpezi/SpeziVibe.git
cd SpeziVibe
npm install
npm run build
node cli/dist/index.js my-app
```

The CLI will prompt you to:
1. Choose a **project name** and **display name**
2. Select a **backend** - Firebase (cloud) or Local (on-device)
3. Pick **features** - Chat, Scheduler, Questionnaires
4. Choose **LLM providers** (if Chat selected) - OpenAI, Anthropic, Google

### Run Your App

```bash
cd my-app
npm start
```

Then press:
- `i` for iOS Simulator
- `a` for Android Emulator
- `w` for Web
- Scan QR code with Expo Go on your device

## Available Features

Add these features using the CLI:

| Feature | Description |
|---------|-------------|
| **Firebase** | Cloud backend with authentication and Firestore |
| **Chat** | AI chat interface with OpenAI, Anthropic, or Google |
| **Scheduler** | Task scheduling and recurring reminders |
| **Questionnaire** | FHIR-compliant health questionnaires |
| **Onboarding** | Welcome flow with consent (included with Firebase) |

## Repository Structure

```
spezivibe/
├── template/        # Base app template (use directly or via CLI)
├── packages/        # @spezivibe/* npm packages
├── features/        # Feature manifests and variant files
└── cli/             # create-spezivibe-app CLI tool
```

## Documentation

- [**Architecture Guide**](./ARCHITECTURE.md) - System design and patterns
- [**CLI Guide**](./cli/README.md) - CLI tool details and plugin system
- [**Contributing**](./CONTRIBUTING.md) - How to contribute

## Contributing

Contributions are welcome! Please read the [contribution guidelines](./CONTRIBUTING.md) first.

```bash
git clone https://github.com/StanfordSpezi/SpeziVibe.git
cd SpeziVibe
npm install
npm test
```

## License

MIT License. See [Licenses](https://github.com/StanfordSpezi/Spezi/tree/main/LICENSES) for details.

![Spezi Footer](https://raw.githubusercontent.com/StanfordSpezi/.github/main/assets/Footer.png#gh-light-mode-only)
![Spezi Footer](https://raw.githubusercontent.com/StanfordSpezi/.github/main/assets/Footer~dark.png#gh-dark-mode-only)
