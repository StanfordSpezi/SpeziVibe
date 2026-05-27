---
sidebar_position: 3
---

# digital-health-ux-planning

:::tip Install this skill

```bash
npx skills add StanfordSpezi/SpeziVibe --skill digital-health-ux-planning
```

Or install all skills: `npx skills add StanfordSpezi/SpeziVibe --all`. See the [Getting Started guide](/docs/getting-started) for tool-specific options.

:::

<TryThisSkill skill="digital-health-ux-planning" />

Plans user experience journeys for digital health products. Platform-agnostic — focuses on user goals and decision points, not specific screens.

## What It Covers

- User segments with constraints (literacy, fatigue, accessibility)
- Core journeys (discover, enroll, learn, consent, first task, ongoing use, review progress)
- Onboarding strategy (what's necessary vs. what can wait)
- Day-to-day workflow design
- Engagement principles (notifications, streaks, feedback — balanced against burden)
- Accessibility and inclusion notes
- Unresolved UX risks

## Output

Produces `docs/planning/ux-brief.md`.

## Example

```
AI:   Who are the primary users, and what are their core jobs
      when using this app?

You:  Post-transplant patients tracking their meds, and
      transplant coordinators reviewing adherence.

AI:   What constraints should we design around? For example —
      health literacy, fatigue, accessibility needs?

You:  Many patients are older, some have low health literacy,
      and they're often fatigued post-surgery.

AI:   Here's an onboarding approach for the patient journey:

      1. Welcome — one sentence on what the app does
      2. Account setup — email/password only, no unnecessary fields
      3. Medication list — import from care plan or enter manually
      4. First check-in — mark today's meds as taken (immediate value)
      5. Permissions — notifications only, deferred to after first use

      I'd defer any health data permissions or detailed profile
      setup until the patient has used the app for a day or two.
      Thoughts?
```

## Limitations

- Does not produce wireframes or UI mockups
- Does not assume mobile tabs, specific screens, or frameworks
- Raises clinical safety and compliance questions but defers to other skills
