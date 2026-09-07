---
sidebar_position: 2
slug: /how-it-works
---

# How SpeziVibe Works

SpeziVibe gives your AI coding tool reusable **skills** for digital health development. Start with `build-an-app`: describe your idea, agree on the planning steps that fit, and review the results as you go.

When the plan is ready, your AI coding agent reads those briefs and writes the code in your existing project, a Spezi starter template, or a new project in your chosen framework.

## The Workflow

1. **Plan first.** Open your AI coding tool in any working directory and run the planning skills. They ask you questions and write briefs into `docs/planning/`. Run only the ones that fit your project — `build-an-app` can orchestrate the right ones based on what you describe.
2. **Sequence the build.** `app-build-planner` reads the briefs and produces `docs/implementation-plan.md` — a milestone-by-milestone build plan.
3. **Choose your project foundation.** Use an existing codebase, set up a project in your chosen framework, or run the optional `spezi-platform-selection` skill to choose a **React Native** or **Apple-native** Spezi starter. Make sure the planning documents are inside the project before building.
4. **Build, one milestone at a time.** Inside your project, tell your coding agent: *"Implement Milestone 1 from `docs/implementation-plan.md`."* It uses your planning briefs and the project's existing patterns to write the code.
5. **Ship.** Generate changelogs and release notes. Maintain a `project-wiki` of accumulated knowledge as the project grows.

## Mental Model

> The planning skills produce the **brief**. Your coding agent produces the **code**.

The briefs record decisions your agent can refer to while building. A Spezi starter can also provide modules and project patterns for your chosen platform.

You can plan before choosing a framework. Once you choose, review the implementation plan with your agent and resolve any platform-specific tasks or open questions.

## How Spezi Fits

SpeziVibe is part of the Stanford Spezi ecosystem and is the starting point for planning and building with AI. When you’re ready to implement, the ecosystem offers two starter paths:

- **React Native and Expo:** use the [SpeziVibe React Native template](https://github.com/StanfordSpezi/SpeziVibeReactNativeTemplate) for iOS and Android, with a generator and app-specific implementation skills.
- **Swift and SwiftUI:** use the [Apple-native template](https://github.com/StanfordSpezi/SpeziTemplateApplication) and [Spezi’s Swift modules](/framework#modules) for Apple-native apps.

The templates have different capabilities; the Swift modules are specific to Apple-native development. You can also use SpeziVibe with another framework or an existing project, as described below.

## Where Files Live

Briefs live in the folder where you run the skills. This is an illustrative set; your project only needs the documents from the skills you use:

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

When the app project is ready, keep those documents alongside its code. The source folders vary by framework:

```
my-app/                  ← your app project
├─ docs/
│  ├─ planning/          ← your reviewed briefs
│  └─ implementation-plan.md
└─ ...                   ← application source and configuration
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
2. Ask your agent to use your existing project or scaffold one in your chosen framework. Skip `spezi-platform-selection`.
3. If you planned in another folder, bring `docs/planning/` and `docs/implementation-plan.md` into the app project. Review any existing files before merging them.
4. Open that project in your AI coding tool. Resolve the plan’s platform choice and any tasks that still assume a Spezi template.
5. Tell the agent: *"Read `docs/planning/` and `docs/implementation-plan.md`. Review the open questions with me, then implement the first agreed milestone in this codebase."*

Your agent uses the briefs as context and works within your chosen stack. Features that a Spezi module would provide may need another library or custom implementation; account for that in the plan.

**When this makes sense:**

- You're extending an existing app
- Your stack is outside React Native or Apple-native
- You want full control over architecture decisions
- You're prototyping and don't need production-grade scaffolding yet

If you want a Spezi starter, compare React Native and Apple-native with [spezi-platform-selection](skills/spezi-platform-selection). For other frameworks, ask `build-an-app` to help choose and set up a project based on your plan.

## Why Stop at Markdown?

The planning skills focus on decisions and documents. Other skills, such as `fasten-ehr-integration`, also work on implementation. A milestone in `implementation-plan.md` might say:

> *Build a medication list view that reads from Firestore, follows the design tokens in the Spezi template, and handles offline cache.*

That's specific enough for a modern AI coding agent to execute, and flexible enough that it can adapt to your team's conventions, evolving requirements, and new Spezi modules as they ship.

Keep the plan current as you learn. After each milestone, verify the result and update decisions that changed.

## Working in Browser Chat

The [workshop](/workshop) also supports planning in browser chat without installing skills. The chat needs the skill instructions and any earlier briefs. Review the result, then save each Markdown document at the path shown in the workshop.

When you’re ready to build, [prepare a coding tool](/docs/getting-started), put the saved documents in your app project, and use the workshop’s build handoff prompt. Browser chat does not create a working project on your machine.
