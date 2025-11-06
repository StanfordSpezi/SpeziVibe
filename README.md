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

SpeziVibe is a React Native + Expo template for building cross-platform digital health applications. Inspired by the [Stanford Spezi](https://github.com/StanfordSpezi) framework, it provides essential patterns for onboarding, task scheduling, questionnaires, and user engagement—optimized for rapid prototyping and AI-assisted development.

## ✨ Features

- **🏗️ Standard Architecture** - Inspired by Stanford Spezi's Standard pattern for centralized data orchestration
- **🔌 Pluggable Backends** - Switch between local storage and Firebase without changing app code
- **📋 Onboarding Flow** - Multi-step onboarding with feature highlights and informed consent
- **📅 Task Scheduler** - Flexible scheduling with daily, weekly, monthly recurrence patterns and completion policies
- **📝 Questionnaires** - Dynamic forms with validation
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

## 🎯 Key Modules

### Standard Module

The **Standard** is the central orchestrator of the application. 
It:
- Initializes and provides the backend service to all modules
- Manages data flow throughout the application
- Ensures proper initialization order and error handling
- Accessible via `useStandard()` hook from any component

```typescript
const { backend, backendType, isLoading, error, retry } = useStandard();
```

### Backend Module

Pluggable backend architecture supporting multiple storage solutions:

**Local Storage (Default)**
- Uses React Native AsyncStorage
- No authentication required
- Perfect for offline-first apps and development
- Zero configuration needed

**Firebase Backend**
- Real-time cloud sync via Firestore
- Email/password authentication
- Multi-device support
- Easy to set up with environment variables

To configure Firebase, create a `.env` file:
```bash
EXPO_PUBLIC_BACKEND_TYPE=firebase
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
# ... other Firebase config
```

See `lib/services/README.md` for detailed backend documentation.

### Scheduler Module

- Task categories: questionnaires, measurements, reminders, custom tasks
- Recurrence patterns with time windows
- Completion tracking with outcomes and timestamps
- Date-based event querying
- Uses Standard for data persistence

### Questionnaire Module

- Multiple question types: text, scale (1-10), multiple choice, boolean
- Real-time validation with Yup schemas
- Integration with task scheduler
- Response storage via backend system

### Authentication Module

- Email/password authentication
- Smart loading states during initialization
- Persistent session management

### Onboarding Module

- Welcome screen with app features
- Interactive feature showcase with pagination
- Informed consent with digital signature
- Completion confirmation

## 🛠️ Built With

- **[Expo](https://expo.dev)** - React Native development platform
- **[React Native](https://reactnative.dev)** - Cross-platform mobile framework
- **[TypeScript](https://www.typescriptlang.org)** - Type-safe JavaScript
- **[Expo Router](https://docs.expo.dev/router/introduction/)** - File-based navigation
- **[Formik](https://formik.org/)** - Form state management
- **[Yup](https://github.com/jquense/yup)** - Schema validation
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** - Local data persistence
- **[Firebase](https://firebase.google.com/)** (Optional) - Cloud backend and authentication

## Contributing

Contributions to this project are welcome. Please make sure to read the [contribution guidelines](https://github.com/StanfordSpezi/.github/blob/main/CONTRIBUTING.md) and the [contributor covenant code of conduct](https://github.com/StanfordSpezi/.github/blob/main/CODE_OF_CONDUCT.md) first.

## License

This project is licensed under the MIT License. See [Licenses](https://github.com/StanfordSpezi/Spezi/tree/main/LICENSES) for more information.

![Spezi Footer](https://raw.githubusercontent.com/StanfordSpezi/.github/main/assets/Footer.png#gh-light-mode-only)
![Spezi Footer](https://raw.githubusercontent.com/StanfordSpezi/.github/main/assets/Footer~dark.png#gh-dark-mode-only)
