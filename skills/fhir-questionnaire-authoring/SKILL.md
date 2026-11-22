---
name: fhir-questionnaire-authoring
description: Write FHIR R4 Questionnaires that a Spezi app renders exactly as intended, check them against the app's renderer, and hand them to a person for review in the Phoenix survey builder.
---

<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# FHIR Questionnaire Authoring

Turn the surveys a project needs into FHIR R4 Questionnaire JSON files that the app shows exactly as intended. Check each file against the app's questionnaire renderer, then hand it to a person to review and edit in [Phoenix](https://stanfordbdhg.github.io/phoenix), a visual survey builder.

## Background

FHIR allows far more in a Questionnaire than any app renderer implements, and most gaps are **silent**: the app shows the survey but ignores a rule. Nobody notices until a study has collected the wrong data. For example:

- On iOS (ResearchKitOnFHIR), a condition on a question **inside a group** is ignored, so the question is always shown.
- On iOS, a slider with more than 13 steps (e.g. 0–100 in steps of 1) is rejected by ResearchKit.
- In React Native apps created before questionnaire package 1.1.0, the minimum and maximum of an **optional** question aren't enforced, and a **required** question hidden by a condition blocks Submit with no message.

So the job is not just "write valid FHIR". It is "write FHIR this app supports", then check it with a tool instead of from memory, and get a person to confirm the survey says what the study needs.

**Relationship to other skills:** `digital-health-study-planning` decides *which* assessments the study collects and when (`docs/planning/study-brief.md`). `fhir-data-model-design` decides how answers and scores are stored (`docs/planning/fhir-data-model.md`). This skill writes the Questionnaire files themselves. `app-build-planner` usually schedules it in a "Questionnaires and assessments" milestone.

## Your Role

You are a careful survey implementer. You write Questionnaire JSON, check it, fix what the checker reports, and explain any remaining trade-offs in plain language. You never change the wording, order or response options of a **validated instrument** (PHQ-9, GAD-7, PROMIS, …) to make it fit the app. If the app can't render something as published, say so and let the team decide.

---

## Step 1: Gather Context

Read whatever exists. Don't ask for what you can find:

- `docs/planning/study-brief.md`: the assessment schedule (which instruments, how often).
- `docs/planning/fhir-data-model.md`: how responses and scores are stored.
- `docs/implementation-plan.md`: the questionnaire milestone, if any.
- **The app's platform and renderer version** (see the table below).

| Platform | How to tell | Checker target |
|---|---|---|
| Apple-native (Spezi Template Application, SpeziQuestionnaire 1.x) | An Xcode project. Find `researchkitonfhir` in `*.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved` and note its version (the template pins 2.0.7). | `ios@<that version>`, e.g. `ios@2.0.7`. If the exact version isn't listed by `--list-targets`, use the closest lower one. |
| React Native (`create-spezivibe-app`) | `package.json` depends on `@spezivibe/questionnaire`, and the app has `lib/questionnaires/`. Note the `version` in `packages/questionnaire/package.json`: each app keeps the copy it was created with. | `react-native@<that version>`, e.g. `react-native@1.0.0` |
| Not decided yet | No app code yet. | Check against **both** `ios` and `react-native`, and keep to what both support. |

If the checker prints a **note** that it used an earlier version's rules (the app's renderer is newer than the checker knows), mention it to the user: a warning may be about something the newer version supports.

SpeziQuestionnaire **2.x** uses a new converter that the checker doesn't cover yet. If the project uses it, say so and check by reading its documentation instead.

Then ask only what is missing:

1. "Which surveys does the app need? For each: is it a validated instrument (name and version), or a custom survey?"
2. For each validated instrument: "Do you have the official wording and the license terms?" Many instruments are copyrighted; some, like the PHQ-9, are free to use. Don't reproduce an instrument from memory. Use the official source, or ask the user to provide it.
3. For each custom survey: "Who will review the wording before it ships?" That person is who gets the Phoenix link in Step 5.

**Confirm before proceeding:** "I'll write: [list of questionnaires with platform target]. Each will be checked against [target] and sent to [reviewer] for review."

---

## Step 2: Write the Questionnaire Files

Write one JSON file per survey, for example `questionnaires/phq-9.json`, unless the project already has a place for them. Follow [references/questionnaire-patterns.md](references/questionnaire-patterns.md) for copy-ready item patterns, and these rules (they keep you inside what both renderers support):

**Structure**
- `resourceType: "Questionnaire"`, `status: "draft"` until reviewed, a stable `url` and `version`, a `title`, and `language`.
- Give every item a unique, meaningful `linkId` (`phq9-1`, not `q1`) and `text`.
- **At most one level of groups.** A group's items must be questions or display items, never another group. On iOS a top-level group becomes one screen.
- Set `required` explicitly on every question.

**Choices**
- Use `answerOption` with `valueCoding` that has `system`, `code` **and** `display`. Don't use `valueString`, `valueInteger` or an external `answerValueSet`: one or both renderers drop them.
- For validated instruments, use the official codes (e.g. LOINC answer codes) **only if you have them from the official source**. Don't make up codes. Otherwise use a project code system such as `http://[your-app].com/fhir/CodeSystem/[survey]` and note it for the reviewer.
- Multi-select: `repeats: true` **and** itemControl `check-box`. iOS needs check-box, and React Native supports neither, so check against the target.

**Conditions (`enableWhen`)**
- Put conditions on top-level questions or on a whole group, **never on a question inside a group** (ignored on iOS).
- Compare choices with `answerCoding` (with `system` and `code`, exactly as in the option) using `=` or `!=`. Compare numbers with `answerInteger`/`answerDecimal`, and yes/no with `answerBoolean`. Don't compare dates with `=`/`!=`, and don't use `answerString`, `answerTime` or `answerDateTime`: iOS can't load such a survey.
- Don't make a conditional question `required` if the app may be React Native before 1.1.0.

**Numbers and sliders**
- Use `minValue`/`maxValue` with `valueInteger` for integer questions. Use `valueDecimal` only for fractional limits on decimal questions, which needs ResearchKitOnFHIR 2.0.7 or later.
- iOS sliders: integer questions only, with both limits, a step that divides the range evenly, and **at most 13 steps**. A 0–10 pain scale is fine; 0–100 needs a step of 10 or more.

**Scoring** isn't part of the Questionnaire. If the study needs a total score (e.g. PHQ-9 total), note it for `fhir-data-model-design` or the implementation: compute it in the app and store it as a derived `Observation`.

---

## Step 3: Check Each File

The checker, `questionnaire-check`, is a single file with no dependencies, published with [Phoenix](https://github.com/StanfordBDHG/phoenix/releases/tag/questionnaire-check) and updated whenever its rules change. Download it once per session (outside the project, so it isn't committed), then run it on every file with the target from Step 1. It needs Node.js 18 or later.

```bash
QC="${TMPDIR:-/tmp}/questionnaire-check.mjs"
curl -fsSL -o "$QC" https://github.com/StanfordBDHG/phoenix/releases/download/questionnaire-check/questionnaire-check.mjs
node "$QC" questionnaires/phq-9.json --target ios@2.0.7 --link
```

Use `--target ios,react-native` if the platform isn't decided, and `--json` if you want to parse the result. The checker reports:

- **error**: the app can't load the survey, may crash, or participants can't finish it. **Fix every error.**
- **warning**: the app ignores or changes part of the survey. Fix it where you can. If you can't without changing a validated instrument, keep it and explain it in Step 5.

Re-run until there are no errors.

Exit status 0 means no errors, 1 means errors (fix them), and 2 means the file or options are wrong. If the download fails or Node.js isn't available, check by hand against [references/renderer-support.md](references/renderer-support.md), and tell the user the automatic check didn't run.

---

## Step 4: Wire the Survey into the App

Only if the app exists. Follow the project's existing pattern:

- **Apple-native (Spezi Template Application):** add the JSON file to the app target's `Resources`, then load it with `Bundle.main.questionnaire(withName: "<file name without .json>")`. The template does this in `TemplateApplication/Schedule/TemplateApplicationScheduler.swift`, where a scheduled task gets `context.questionnaire`, and `EventView` shows it with `QuestionnaireView(questionnaire:)`.
- **React Native (`create-spezivibe-app`):** surveys are registered by `id` in `lib/questionnaires/sample-questionnaires.ts`, and `app/questionnaire/[id].tsx` renders them with `QuestionnaireForm`. Import the JSON file, type it as `Questionnaire` from `@spezivibe/questionnaire`, give it a unique `id`, and add it to the exported list. Schedule it the way the existing samples are scheduled.

Don't rewrite a JSON survey into `QuestionnaireBuilder` calls. Keep the JSON file as the single source, so it can be reviewed in Phoenix and checked again.

---

## Step 5: Hand Off for Review

Give the reviewer, for each survey:

1. **The Phoenix link** printed by `--link`. It opens the survey in Phoenix, where they can read and edit it visually. The survey is in the part of the link after `#`, which isn't sent to any server. If the link doesn't open the survey, they can use **Upload Existing Survey** in Phoenix with the file instead. If the link is very long and gets cut off in chat, send the file.
2. **What to check:** wording and order, especially of validated instruments against the official source; response options; which questions are required; and that each condition shows the right follow-up.
3. **What the app won't do**, in plain words: every remaining warning, e.g. "The app ignores the maximum of 'Hours of sleep' because the question is optional."

Tell them to use **Download** in Phoenix when they're done, and send the file back. Phoenix also has **⋯ → Check app compatibility**, which runs the same checks.

When the reviewed file comes back, replace the project's copy with it, re-run Step 3, and summarize what the reviewer changed (`git diff`). Then set `status` to `active` once the team approves it.

---

## Output

- One Questionnaire JSON file per survey, checked with no errors against the app's renderer.
- The app wiring (Step 4), if the app exists.
- A short summary for the user: the files, the checker results, the remaining warnings and why they're acceptable, and the Phoenix review link(s).

## References

- [references/questionnaire-patterns.md](references/questionnaire-patterns.md): copy-ready JSON for each item type, choices, conditions, groups and sliders.
- [references/renderer-support.md](references/renderer-support.md): what ResearchKitOnFHIR and the React Native template support, for checking by hand.
- [Phoenix](https://stanfordbdhg.github.io/phoenix) and its [source](https://github.com/StanfordBDHG/phoenix), including the checker's rules in `src/compatibility`.
