<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# Platform Decision Guide

Choose between **React Native** and **Apple-native** based on the product's defining requirements.

## React Native

Use the Spezi React Native Template App when:

- cross-platform support (iOS + Android) matters from the beginning
- the app is mostly content, education, forms, questionnaires, scheduling, or chat
- native integrations are shallow or optional

## Apple-native

Use the Spezi Template Application for Apple Platforms when:

- HealthKit is a core system of record
- SensorKit is required
- Bluetooth peripherals are first-class product features
- background collection or deep Apple-native behavior is required
- the target experience is explicitly for iPhone, iPad, or Vision Pro

## When Both Matter

If the request wants both strong cross-platform support and strong Apple-native capabilities, explain the tradeoff clearly and bias toward the platform that best serves the product-defining requirement. Cross-platform reach and deep native integration are real tradeoffs — pick the one the product cannot do without.
