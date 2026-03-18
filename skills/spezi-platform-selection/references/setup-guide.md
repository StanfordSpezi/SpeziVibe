<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# Setup Guide

The setup workflow routes developers to one of two template applications.

Before cloning a template, help the user get their machine into a usable development state for the platform they chose.

## Choose A Coding Environment First

Before starting the template setup, ask the user to choose:

- a coding agent such as Claude, Codex, or another supported tool
- whether they want to work in a desktop app or in a CLI workflow

Then have them:

1. create or sign in to their account
2. install Node.js so `npm` and `npx` are available
3. confirm `node -v`, `npm -v`, and `npx -v` work

## Apple Platform Setup

Use this setup when the user chooses the **Spezi Template Application for Apple Platforms**.

### Install Xcode

On macOS:

1. install the latest stable [Xcode](https://developer.apple.com/xcode/) from the Mac App Store
2. open Xcode once so it can finish installation tasks
3. accept any license prompts and install additional components if requested
4. confirm Xcode is available from the terminal:

```bash
xcodebuild -version
```

If the user wants to run apps on a physical Apple device, remind them they may also need:

- an Apple Developer account
- code signing configured in Xcode

Only after Xcode is installed and working should the workflow proceed to cloning the Apple template.

## React Native Template App

- Clone key: `rn-cs342-template`
- Repository: [CS342/ReactNativeTemplateApplication](https://github.com/CS342/ReactNativeTemplateApplication)

Use this template when cross-platform delivery matters and the product is not defined by deep Apple-native integration.

### Set Up A React Native Development Environment

For the React Native Template App, guide the user toward a proper [Expo environment setup](https://docs.expo.dev/get-started/set-up-your-environment/) rather than a one-off quickstart.

Make sure the user has:

- Node.js installed
- `npm` and `npx` working
- a development target in mind such as iOS simulator, Android emulator, or physical device

On macOS, recommend:

1. install Xcode if the user wants to run iOS simulators or build iOS development builds
2. install the Xcode command line tools if they are not already present
3. install and configure Android Studio if Android testing matters
4. follow the Expo environment setup flow for the chosen targets

Explain the tradeoff clearly:

- Expo Go is useful for quick experiments
- development builds are the better default for serious app work, especially when native modules or custom native behavior are involved

Before cloning the React Native template, confirm the user can support the targets they care about on their machine.

## Spezi Template Application for Apple Platforms

- Clone key: `spezi-template`
- Repository: [StanfordSpezi/SpeziTemplateApplication](https://github.com/StanfordSpezi/SpeziTemplateApplication)

This template targets:

- iPhone
- iPad
- Vision Pro

Use it when Apple-native capabilities such as HealthKit, SensorKit, Bluetooth, or deep platform behavior are central to the app.

After the user has a working Xcode installation, proceed with the Apple template clone and handoff.
