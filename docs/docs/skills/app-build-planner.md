---
sidebar_position: 9
---

# app-build-planner

Reads planning documents from the other skills and produces a milestone-based implementation plan. Does not generate code.

## Inputs

Reads whichever of these exist (works with whatever's available):

- `docs/planning/need-statement.md`
- `docs/planning/ux-brief.md`
- `docs/planning/study-brief.md`
- `docs/planning/data-model-brief.md`
- `docs/planning/fhir-data-model.md`
- `docs/planning/compliance-brief.md`

Also needs your platform choice (React Native or Apple-native) and backend choice (Firebase, Medplum, or other).

## Output

Produces `docs/implementation-plan.md` containing:

- Context table (app name, need statement, platform, backend)
- Planning inputs summary with gaps noted
- Feature list with priorities and package mappings
- Milestone sequence (typically 8-12 milestones) each with:
  - Goal, dependencies, tasks, platform notes, verification criteria
- Data model and compliance integration tables
- Open questions

## Example

```
AI:   Which template did you clone — React Native or Spezi
      Template Application? And which backend — Firebase,
      Medplum, or something else?

You:  Spezi Template Application with Firebase.

AI:   I've read your planning docs. Here's a proposed milestone
      sequence:

      Milestone 1: Foundation
        — Configure Firebase project and authentication
        — Set up Firestore security rules
        — Verify build and test pipeline
        Verification: User can sign in and see empty home screen

      Milestone 2: Onboarding
        — Implement consent flow using SpeziOnboarding
        — Add profile setup (name, date of birth)
        — Request HealthKit permissions
        Verification: New user completes onboarding and lands on home

      Milestone 3: Medication Tracking
        — Build medication list view
        — Implement daily check-in flow
        — Store adherence data in Firestore
        Verification: Patient can log medications and see history

      ...8 more milestones...

      Ready to start building Milestone 1?
```

## Limitations

- Does not generate application code — only a plan document
- Features without matching packages are flagged as "custom implementation" with effort estimates
- Milestones are capped at 5-7 tasks; larger ones are split
- Flags all gaps from missing planning inputs
