// This source file is part of the Stanford Spezi open-source project.
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import React from 'react';
import Link from '@docusaurus/Link';
import {REACT_NATIVE_TEMPLATE_REPO, TEMPLATE_REPO} from '../data/speziFramework';

export default function PlatformOptions() {
  return (
    <div className="platform-options">
      <article className="platform-option">
        <p className="eyebrow">iOS & Android</p>
        <h3>React Native</h3>
        <p>Build for both platforms with React Native and Expo. The SpeziVibe template generates an app with your choice of backend and optional features.</p>
        <a href={REACT_NATIVE_TEMPLATE_REPO} className="text-link">React Native template <span aria-hidden="true">↗</span></a>
      </article>
      <article className="platform-option">
        <p className="eyebrow">Apple platforms</p>
        <h3>Apple-native</h3>
        <p>Build with Swift and SwiftUI. Start with the Spezi template and combine reusable modules for health data, consent, connected devices, and more.</p>
        <a href={TEMPLATE_REPO} className="text-link">Apple-native template <span aria-hidden="true">↗</span></a>
      </article>
      <article className="platform-option">
        <p className="eyebrow">Web, mobile & existing apps</p>
        <h3>Your framework</h3>
        <p>Use Flutter, Kotlin, a web framework, or a project you already have. SpeziVibe’s skills help you plan and guide your coding agent in your chosen stack.</p>
        <Link to="/docs/how-it-works#building-without-a-spezi-template" className="text-link">Build with your own stack <span aria-hidden="true">→</span></Link>
      </article>
    </div>
  );
}
