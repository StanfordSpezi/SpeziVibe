<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# Platform Decision Guide

Use the **React Native Template App** when:

- cross-platform support matters from the beginning
- the app is mostly content, education, forms, questionnaires, scheduling, or chat
- native integrations are shallow or optional

Use the **Spezi Template Application for Apple Platforms** when:

- HealthKit is a core system of record
- SensorKit is required
- Bluetooth peripherals are first-class product features
- background collection or deep Apple-native behavior is required
- the target experience is explicitly for iPhone, iPad, or Vision Pro

If the request wants both strong cross-platform support and strong Apple-native capabilities, explain the tradeoff clearly and bias toward the platform that best serves the product-defining requirement.
