---
sidebar_position: 8
---

# app-build-planner

:::tip Install this skill

```bash
npx skills add StanfordSpezi/SpeziVibe --skill app-build-planner
```

Or install all skills: `npx skills add StanfordSpezi/SpeziVibe --all`. See the [Getting Started guide](/docs/getting-started) for tool-specific options.

:::

Reads planning documents from the other skills and produces a milestone-based implementation plan. Does not generate code — your AI coding agent uses the plan to write the code. See [How SpeziVibe Works](/docs/how-it-works).

## Inputs

Reads whichever of these exist (works with whatever's available):

- `docs/planning/need-statement.md`
- `docs/planning/ux-brief.md`
- `docs/planning/study-brief.md`
- `docs/planning/data-model-brief.md`
- `docs/planning/fhir-data-model.md`
- `docs/planning/compliance-brief.md`

Also needs your platform choice (React Native, Apple-native, or another framework you're using) and backend choice (Firebase, Medplum, or other). If you're not using a Spezi template, the plan still works — see [How SpeziVibe Works](/docs/how-it-works#building-without-a-spezi-template).

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
AI:   Which platform are you on — React Native, Apple-native, or
      something else? And which backend — Firebase, Medplum, or
      something else?

You:  Apple-native with Firebase.

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

## Next Step

Open `docs/implementation-plan.md` in your AI coding tool and ask the agent to build Milestone 1. Each milestone has a goal, tasks, and verification criteria — structured so the agent can execute sequentially. Build, verify, commit, repeat.
