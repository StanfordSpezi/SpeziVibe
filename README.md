<div align="center">
  <img src="assets/images/rocket-logo.png" alt="SpeziVibe Logo" width="200"/>

  # SpeziVibe

  **Vibe code friendly cross-platform digital health app template**

  [![Built with Expo](https://img.shields.io/badge/Built%20with-Expo-000020.svg?style=flat&logo=expo)](https://expo.dev)
  [![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB.svg?style=flat&logo=react)](https://reactnative.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
</div>

> [!WARNING]
> This template is a work in progress, and not yet stable for production use. Please use [SpeziTemplateApplication](https://github.com/StanfordSpezi/SpeziTemplateApplication) instead.

---

## 📱 About

SpeziVibe is a [React Native](https://reactnative.dev/) and [Expo](https://expo.dev/) based template for building digital health applications on iOS, Android, and Web. Inspired by the native [Stanford Spezi](https://github.com/StanfordSpezi) framework on iOS, it provides essential patterns for rapid prototyping in digital health, optimized for AI-assisted development.

## ✨ Features

- **🏗️ Standard Architecture** - Inspired by Stanford Spezi's Standard pattern for centralized data orchestration
- **🔌 Pluggable Backends** - Switch between local storage and Firebase without changing app code
- **👤 Account Module** - Reusable authentication package with Firebase and local implementations
- **📋 Onboarding Flow** - Multi-step onboarding with feature highlights and informed consent
- **📅 Task Scheduler** - Flexible scheduling with daily, weekly, monthly recurrence patterns and completion policies
- **📝 Questionnaires** - Dynamic forms with validation (FHIR-compatible)
- **👥 Contact Management** - Built-in support team and emergency contact templates
- **🎨 Theme Support** - Full light and dark theme support
- **🤖 AI-Friendly** - Clean, well-structured codebase designed for AI-assisted development

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
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

## 📦 Modules

- **[@spezivibe/account](./packages/account/README.md)** - Authentication and account management with Firebase and local implementations
- **[@spezivibe/questionnaire](./packages/questionnaire/README.md)** - FHIR-compatible questionnaire system with dynamic forms
- **[@spezivibe/scheduler](./packages/scheduler/README.md)** - Task scheduling with daily, weekly, monthly recurrence patterns and completion policies

## Contributing

Contributions to this project are welcome. Please make sure to read the [contribution guidelines](https://github.com/StanfordSpezi/.github/blob/main/CONTRIBUTING.md) and the [contributor covenant code of conduct](https://github.com/StanfordSpezi/.github/blob/main/CODE_OF_CONDUCT.md) first.

## License

This project is licensed under the MIT License. See [Licenses](https://github.com/StanfordSpezi/Spezi/tree/main/LICENSES) for more information.

![Spezi Footer](https://raw.githubusercontent.com/StanfordSpezi/.github/main/assets/Footer.png#gh-light-mode-only)
![Spezi Footer](https://raw.githubusercontent.com/StanfordSpezi/.github/main/assets/Footer~dark.png#gh-dark-mode-only)
