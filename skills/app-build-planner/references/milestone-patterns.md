<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# Milestone Patterns

Common milestone sequences for digital health app archetypes. Use these as starting templates and adapt based on the actual planning inputs.

> **Package availability:** in the tables below, the React Native `healthkit` package (`@spezivibe/healthkit`) is **not yet built** — see [react-native-packages.md](react-native-packages.md). On React Native, plan health-data milestones as custom HealthKit integration work. The Apple-native `SpeziHealthKit` module is available.

## Research Study App

Apps tied to a clinical or research study with defined enrollment, consent, assessments, and data collection.

| Order | Milestone | Typical Packages/Modules |
|-------|-----------|------------------------|
| 1 | Project foundation — navigation shell, theming, base configuration | — |
| 2 | Account and authentication | account, firebase or medplum / SpeziAccount, SpeziFirebaseAccount |
| 3 | Onboarding and informed consent | onboarding / SpeziOnboarding |
| 4 | Questionnaires and assessments | questionnaire / SpeziQuestionnaire |
| 5 | Task scheduling and adherence | scheduler / SpeziScheduler |
| 6 | Health data collection | healthkit / SpeziHealthKit |
| 7 | Data sync and backend wiring | firebase or medplum / SpeziFHIR, SpeziFirestore |
| 8 | Compliance controls — audit logging, data retention, consent tracking | medplum / SpeziFHIR |
| 9 | Notifications and engagement | — / SpeziNotifications |
| 10 | Polish — error handling, accessibility, offline support | — |

**Key characteristics:**
- Consent is a hard gate — nothing meaningful happens before it
- Assessment schedule drives the daily experience
- Data integrity and audit trail are critical
- Backend sync must handle offline scenarios

---

## Clinical Care App

Apps supporting clinical workflows — care plans, provider dashboards, patient communication, and care coordination.

| Order | Milestone | Typical Packages/Modules |
|-------|-----------|------------------------|
| 1 | Project foundation — navigation shell, theming, base configuration | — |
| 2 | Account and authentication with role support | account, firebase or medplum / SpeziAccount |
| 3 | Onboarding — role-appropriate setup | onboarding / SpeziOnboarding |
| 4 | Care plan tasks and scheduling | scheduler / SpeziScheduler |
| 5 | Clinical data entry and forms | questionnaire / SpeziQuestionnaire |
| 6 | Health data collection and vitals | healthkit / SpeziHealthKit |
| 7 | Secure messaging or chat | chat / SpeziChat |
| 8 | Data sync and FHIR integration | medplum / SpeziFHIR, SpeziFirestore |
| 9 | Compliance controls — HIPAA, access logging, data segmentation | medplum / SpeziFHIR |
| 10 | Notifications and alerts | — / SpeziNotifications |
| 11 | Polish — error handling, accessibility, offline support | — |

**Key characteristics:**
- Multiple user roles (patient, clinician, coordinator) with different views
- Care plan structure drives feature organization
- FHIR interoperability is often required for EHR integration
- HIPAA compliance is typically mandatory

---

## Patient Engagement App

Apps focused on self-tracking, coaching, habit formation, and health behavior change.

| Order | Milestone | Typical Packages/Modules |
|-------|-----------|------------------------|
| 1 | Project foundation — navigation shell, theming, base configuration | — |
| 2 | Account and authentication | account, firebase or medplum / SpeziAccount, SpeziFirebaseAccount |
| 3 | Onboarding — value proposition, permissions, baseline setup | onboarding / SpeziOnboarding |
| 4 | Core self-tracking and daily check-in | questionnaire / SpeziQuestionnaire |
| 5 | Health data integration | healthkit / SpeziHealthKit |
| 6 | Reminders and scheduling | scheduler / SpeziScheduler |
| 7 | AI coaching or chat | chat / SpeziChat |
| 8 | Progress visualization and history | — |
| 9 | Backend sync and data persistence | firebase or medplum / SpeziFHIR, SpeziFirestore |
| 10 | Engagement loops — streaks, nudges, notifications | — / SpeziNotifications |
| 11 | Polish — error handling, accessibility, offline support | — |

**Key characteristics:**
- Onboarding must demonstrate value quickly to retain users
- Daily check-in or tracking is the core loop
- Engagement mechanics (streaks, progress, coaching) drive retention
- Health data is often supplementary rather than primary

---

## Adapting a Pattern

If the app combines archetypes (e.g., a patient engagement app with a research consent flow), start with the pattern that best matches the primary user loop and integrate elements from the secondary pattern as additional milestones.

When adapting a pattern to the actual planning inputs:

1. **Remove milestones** that do not apply. If the app has no chat feature, drop the messaging milestone.
2. **Reorder milestones** based on priority. If health data collection is the core product value, move it earlier.
3. **Split large milestones** when a single milestone covers too many features. A milestone should be completable and testable in a focused work session.
4. **Merge small milestones** when two adjacent milestones are tightly coupled and small enough to do together.
5. **Add milestones** for features not covered by any pattern — custom visualizations, third-party integrations, or domain-specific workflows.

The goal is milestones that are small enough to build and review incrementally but large enough to produce a visible, testable change in the app.
