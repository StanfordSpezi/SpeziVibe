---
description: Write FHIR Questionnaires the app renders as intended, check them, and review them in Phoenix.
---

# Write FHIR questionnaires

:::tip Install this skill

```bash
npx skills add StanfordSpezi/SpeziVibe --skill fhir-questionnaire-authoring
```

Or install all skills: `npx skills add StanfordSpezi/SpeziVibe --skill '*'`. See the [Getting Started guide](/docs/getting-started) for tool-specific options.

:::

<TryThisSkill skill="fhir-questionnaire-authoring" />

Turns the surveys your app needs into FHIR R4 Questionnaire files that the app shows exactly as intended, checks them against the app's questionnaire renderer, and hands them to a person to review in the [Phoenix](https://stanfordbdhg.github.io/phoenix) survey builder.

## Why It Matters

FHIR allows far more than any app renderer implements, and most gaps are silent. On iOS, a condition on a question inside a group is ignored, and a slider with more than 13 steps is rejected. In the React Native template, limits on optional questions aren't enforced, and a required question hidden by a condition blocks Submit. This skill writes within what the app supports, and checks the result with a tool instead of from memory.

## What It Does

1. Reads the study brief, data model and implementation plan, and works out the app's platform and renderer version.
2. Writes one Questionnaire JSON file per survey, keeping validated instruments' wording exactly as published.
3. Runs `questionnaire-check` against the app's renderer and fixes every error.
4. Wires the survey into the Spezi template, if the app exists.
5. Gives the reviewer a Phoenix link to read and edit the survey, and explains in plain words anything the app will ignore.

## Output

One checked Questionnaire JSON file per survey (for example `questionnaires/phq-9.json`), the app wiring, and Phoenix review links.

## Example

```
AI:   Your study brief lists a weekly PHQ-9 and a daily sleep check-in,
      and the app is the Spezi Template Application with
      ResearchKitOnFHIR 2.0.7. Do you have the official PHQ-9 wording?

You:  Yes, here it is. The sleep check-in is ours.

AI:   Written and checked against ios@2.0.7:

      questionnaires/phq-9.json         no issues
      questionnaires/sleep-check-in.json
        fixed: the "Hours of sleep" slider was 0–24 in steps of 1
        (24 steps; iOS allows at most 13). It's now a number field
        with a 0–24 limit.

      Review links for your coordinator:
      https://stanfordbdhg.github.io/phoenix/#questionnaire-deflate=…
```
