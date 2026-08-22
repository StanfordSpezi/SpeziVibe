---
sidebar_position: 2
slug: /how-it-works
---

# How SpeziVibe Works

SpeziVibe is a set of installable **planning skills** that walk you through the decisions a digital health app needs — clinical need, compliance, data model, UX, study design — and produce a folder of structured markdown briefs.

When the plan is ready, your AI coding agent reads those briefs and writes the code inside a Spezi template repo.

## The Workflow

1. **Plan first.** Open your AI coding tool in any working directory and run the planning skills. They ask you questions and write briefs into `docs/planning/`. Run only the ones that fit your project — `build-an-app` can orchestrate the right ones based on what you describe.
2. **Sequence the build.** `app-build-planner` reads the briefs and produces `docs/implementation-plan.md` — a milestone-by-milestone build plan.
3. **Choose a platform and clone the template.** `spezi-platform-selection` picks **React Native** or **Apple-native** based on what your planning revealed, clones the matching Spezi template, and brings your planning docs along so they're inside the cloned repo.
4. **Build, one milestone at a time.** Inside the template project, tell your coding agent: *"Implement Milestone 1 from `docs/implementation-plan.md`."* It uses your planning briefs as context and the template's existing patterns as scaffolding to write the code.
5. **Ship.** Generate changelogs and release notes. Maintain a `project-wiki` of accumulated knowledge as the project grows.

## Mental Model

> The planning skills produce the **brief**. Your coding agent produces the **code**.

The briefs are the bridge — clear, structured decisions an agent can ground itself in instead of guessing. The Spezi template gives the agent battle-tested architecture, modules, and patterns to build on top of.

You don't clone the template until you're ready to build. Planning is platform-agnostic on purpose — a need statement, compliance brief, or FHIR data model shouldn't change based on whether you eventually pick React Native or Apple-native.

## Where Files Live

Before cloning, briefs live in your working directory:

```
my-planning/
└─ docs/
   ├─ planning/
   │  ├─ need-statement.md
   │  ├─ compliance-brief.md
   │  ├─ ux-brief.md
   │  ├─ data-model-brief.md
   │  ├─ fhir-data-model.md
   │  └─ study-brief.md
   └─ implementation-plan.md
```

After `spezi-platform-selection` sets up the template (generating the app with `create-spezivibe-app` for React Native, cloning for Apple-native) and brings planning along, your project looks like:

```
my-app/                  ← your Spezi template project
├─ docs/
│  ├─ planning/          ← moved in from your planning directory
│  └─ implementation-plan.md
├─ src/                  ← your agent writes code here
└─ ...                   ← template scaffolding
```

Commit `docs/planning/` and `docs/implementation-plan.md` to source control. The agent — and future contributors — will keep coming back to them.

## Building Without a Spezi Template

The Spezi templates are recommended scaffolding, not a requirement. The planning briefs and implementation plan are platform-agnostic markdown — your AI coding agent can build from them in any project:

- A blank Expo / React Native project
- A blank Xcode / SwiftUI project
- An existing repo you already have
- A different framework entirely (Flutter, Kotlin, web, etc.)

To skip the template path:

1. Run the planning skills in any working directory.
2. Skip `spezi-platform-selection`, or run it just for the platform recommendation and set up a project of your choice manually.
3. Open your project in your AI coding tool.
4. Tell the agent: *"Read `docs/planning/` and `docs/implementation-plan.md`. Implement Milestone 1 in this codebase."*

Your agent uses the briefs as context and writes code in whatever stack you're working in. You give up the Spezi-specific scaffolding — pre-wired onboarding/consent flows, HealthKit integration, FHIR mappings, design tokens — and your agent will rebuild those from scratch (or skip them). The trade is more flexibility for more work.

**When this makes sense:**

- You're extending an existing app
- Your stack is outside React Native or Apple-native
- You want full control over architecture decisions
- You're prototyping and don't need production-grade scaffolding yet

When in doubt, use a template. It's the faster path to a working app.

## Why Stop at Markdown?

The planning skills deliberately don't generate code. A milestone in `implementation-plan.md` might say:

> *Build a medication list view that reads from Firestore, follows the design tokens in the Spezi template, and handles offline cache.*

That's specific enough for a modern AI coding agent to execute, and flexible enough that it can adapt to your team's conventions, evolving requirements, and new Spezi modules as they ship.

Code generators get stale. A precise plan + a smart agent + a maintained template stays current.
