---
sidebar_position: 1
---

# build-an-app

The main entry point for SpeziVibe. Describe what you want to build and this skill determines which planning skills apply, then walks you through each one in sequence.

## How It Works

1. Asks what you want to build (one open question, at most one follow-up)
2. Identifies which planning skills are relevant based on your description
3. Proposes the order and checks with you before proceeding
4. Runs each skill interactively — you participate in each one
5. Hands off to `app-build-planner` to produce an implementation plan

## Skill Selection

The orchestrator picks skills based on signals in your description:

- Mentions a clinical problem or "I don't know where to start" → **biodesign-needs-finding**
- No existing repo → **spezi-platform-selection**
- No existing designs → **digital-health-ux-planning**
- Mentions research, study, or trial → **digital-health-study-planning**
- Involves health data → **health-data-model-planning**
- Needs interoperability or EHR integration → **fhir-data-model-design**
- Mentions HIPAA, patient data, or regulated data → **digital-health-compliance-planning**
- Always runs → **app-build-planner**

Skills are skipped if you already have the corresponding planning document.

## Output

Each skill produces its own document in `docs/planning/`. The final output is an `implementation-plan.md` with milestones, tasks, and dependencies.
