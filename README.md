<div align="center">
  <img src="assets/images/rocket-logo.png" alt="SpeziVibe Logo" width="200"/>

  # SpeziVibe

  **Vibe code friendly cross-platform digital health app template**

  [![Build and Test](https://github.com/StanfordSpezi/SpeziVibe/actions/workflows/ci.yml/badge.svg)](https://github.com/StanfordSpezi/SpeziVibe/actions/workflows/ci.yml)
  [![Built with Expo](https://img.shields.io/badge/Built%20with-Expo-000020.svg?style=flat&logo=expo)](https://expo.dev)
  [![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB.svg?style=flat&logo=react)](https://reactnative.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
</div>

> [!WARNING]
> This template is a work in progress, and not yet stable for production use. Please use [SpeziTemplateApplication](https://github.com/StanfordSpezi/SpeziTemplateApplication) instead.

---

## 📱 About

SpeziVibe is a [React Native](https://reactnative.dev/) and [Expo](https://expo.dev/) template for rapidly prototyping digital health applications on iOS, Android, and Web, inspired by our native [Stanford Spezi](https://github.com/StanfordSpezi) framework and optimized for AI-assisted development.

## 📦 Feature Modules

- **[@spezivibe/account](./packages/account/README.md)** - Backend-agnostic authentication and account management.
- **[@spezivibe/chat](./packages/chat/README.md)** - User interface for chatting with LLMs via [AI SDK](https://ai-sdk.dev/).
- **[@spezivibe/firebase](./packages/firebase/README.md)** - Firebase integration for authentication and data storage.
- **[@spezivibe/onboarding](./packages/onboarding/README.md)** - Reusable onboarding components including consent.
- **[@spezivibe/questionnaire](./packages/questionnaire/README.md)** - HL7 FHIR questionnaires with dynamic forms.
- **[@spezivibe/scheduler](./packages/scheduler/README.md)** - Advanced task scheduling features.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo Go app (for mobile testing) or iOS Simulator/Android Emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/StanfordSpezi/SpeziVibe.git
cd SpeziVibe

# Install dependencies
npm install

# Start development server
npx expo start
```

### Run the app
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Press `w` for Web
- Scan QR code with Expo Go on your device

## Contributing

Contributions to this project are welcome. Please make sure to read the [contribution guidelines](https://github.com/StanfordSpezi/.github/blob/main/CONTRIBUTING.md) and the [contributor covenant code of conduct](https://github.com/StanfordSpezi/.github/blob/main/CODE_OF_CONDUCT.md) first.

## License

This project is licensed under the MIT License. See [Licenses](https://github.com/StanfordSpezi/Spezi/tree/main/LICENSES) for more information.

![Spezi Footer](https://raw.githubusercontent.com/StanfordSpezi/.github/main/assets/Footer.png#gh-light-mode-only)
![Spezi Footer](https://raw.githubusercontent.com/StanfordSpezi/.github/main/assets/Footer~dark.png#gh-dark-mode-only)
