---
sidebar_position: 2
---

# biodesign-needs-finding

:::tip Install this skill

```bash
npx skills add StanfordSpezi/SpeziVibe --skill biodesign-needs-finding
```

Or install all skills: `npx skills add StanfordSpezi/SpeziVibe --all`. See the [Getting Started guide](/docs/getting-started) for tool-specific options.

:::

<TryThisSkill skill="biodesign-needs-finding" />

Walks you through a Stanford Biodesign-style needs-finding process to define a clear, solution-free problem statement.

## How It Works

This is a Socratic coaching process — it asks questions and challenges your thinking rather than writing the statement for you. It validates each component: the health problem, the affected population, and the desired outcome.

If you start with a technology-first statement like "We need an app for...", it redirects you to the underlying problem.

## Output

Produces `docs/planning/need-statement.md` containing:

- A structured need statement: "A way to [PROBLEM] in [POPULATION] in order to [OUTCOME]"
- Supporting evidence and validation notes
- Key stakeholders to validate with
- Identified insights about why the need is unmet

## Example

```
AI:   Do you already have a need statement or draft, or are you
      starting fresh?

You:  We need an app for cardiac rehab patients

AI:   That sounds like a solution — let's work backward to the
      underlying problem. What's happening with cardiac rehab
      patients that isn't working today?

You:  They don't stick with their exercise programs after discharge

AI:   Good — that's the problem space. Which patients specifically?
      Post-MI? Post-CABG? Heart failure? And at what point after
      discharge does adherence drop off?

      ...

AI:   Here's your refined need statement:
      "A way to sustain exercise adherence in post-discharge
      cardiac rehabilitation patients in order to reduce
      30-day readmission rates and improve functional recovery."
```

## Limitations

- Does not write the statement for you — requires your active participation
- If you skip quality checks, tracks them as "skipped-step risks" in the output
