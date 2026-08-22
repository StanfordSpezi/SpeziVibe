---
sidebar_position: 1
---

# build-an-app

:::tip Install this skill

```bash
npx skills add StanfordSpezi/SpeziVibe --skill build-an-app
```

Or install all skills: `npx skills add StanfordSpezi/SpeziVibe --all`. See the [Getting Started guide](/docs/getting-started) for tool-specific options.

:::

<TryThisSkill skill="build-an-app" />

The main entry point for SpeziVibe. Describe what you want to build and this skill determines which planning skills apply, walks you through each one in sequence, and produces an implementation plan your AI coding agent can build from. See [How SpeziVibe Works](/docs/how-it-works).

## How It Works

1. Asks what you want to build (one open question, at most one follow-up)
2. Identifies which planning skills are relevant based on your description
3. Proposes the order and checks with you before proceeding
4. Runs each skill interactively — you participate in each one
5. Hands off to `app-build-planner` to produce an implementation plan

## Skill Selection

The orchestrator picks skills based on signals in your description:

- Mentions a clinical problem or "I don't know where to start" → **biodesign-needs-finding**
- No existing repo, starting from a Spezi template → **spezi-platform-selection** (optional — you can [build with any framework](/docs/how-it-works#building-without-a-spezi-template) instead)
- No existing designs → **digital-health-ux-planning**
- Mentions research, study, or trial → **digital-health-study-planning**
- Involves health data → **health-data-model-planning**
- Needs interoperability or EHR integration → **fhir-data-model-design**
- Mentions HIPAA, patient data, or regulated data → **digital-health-compliance-planning**
- Always runs → **app-build-planner**

Skills are skipped if you already have the corresponding planning document.

## Example

```
You:  I want to build a medication tracking app for post-transplant patients

AI:   Based on your description, here's the sequence I'd recommend:
      1. biodesign-needs-finding — define the core problem
      2. digital-health-compliance-planning — HIPAA and medication data
      3. health-data-model-planning — medication schedules, adherence
      4. digital-health-ux-planning — patient and caregiver workflows
      5. app-build-planner — implementation plan with milestones
      6. spezi-platform-selection — pick React Native or Apple-native,
         clone the matching template (when you're ready to build)

      All planning briefs land in docs/planning/. spezi-platform-selection
      runs last and brings them into the cloned template, where your
      coding agent will start building.

      Want to proceed with this order?

You:  Yes, let's go

AI:   Starting with needs-finding. What specific problem are
      post-transplant patients facing with medication adherence?
```

## Output

Each skill produces its own document in `docs/planning/`. The final output is an `implementation-plan.md` with milestones, tasks, and dependencies.

## What Happens Next

After `build-an-app` finishes, you have a folder of planning briefs and `docs/implementation-plan.md`. Inside your project — the cloned Spezi template, or your own repo or scaffold if you chose a [different framework](/docs/how-it-works#building-without-a-spezi-template) — tell your AI coding agent:

> *Implement Milestone 1 from `docs/implementation-plan.md`.*

The agent uses your planning briefs as context — plus the Spezi template's patterns as scaffolding, if you're using one — to write the code. See [How SpeziVibe Works](/docs/how-it-works) for the full flow.
