<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# Renderer Support

What each Spezi questionnaire renderer does with a FHIR R4 Questionnaire. Use this to check by hand when `questionnaire-check` isn't available. The checker (Phoenix `src/compatibility`) encodes the same rules and cites the source for each.

- **iOS:** [ResearchKitOnFHIR](https://github.com/StanfordBDHG/ResearchKitOnFHIR), used by SpeziQuestionnaire 1.x. Covers 2.0.0 to 3.0.0-beta.2. The Spezi Template Application pins 2.0.7; SpeziQuestionnaire 1.3 allows 2.0.4 and later, up to 3.0.
- **React Native:** the questionnaire package of the [SpeziVibe React Native template](https://github.com/StanfordSpezi/SpeziVibeReactNativeTemplate) (`packages/questionnaire`). Each app keeps the copy it was created with; its version is in the app's `packages/questionnaire/package.json`. The tables describe **1.0.0**. **1.1.0** fixed several of the problems they list:
  - required questions that are hidden or can't be shown no longer block Submit (they're just not shown), and answers to hidden questions are left out of the response;
  - limits, whole numbers and maxLength are enforced on optional questions too;
  - `valueString` and `valueInteger` choice answers are saved;
  - time answers are saved as `hh:mm:ss`, and dates in local time.

**Error** means the app can't load the survey, may crash, or participants can't finish it. **Ignored** means the app silently leaves it out.

## Item types

| Type | iOS | React Native |
|---|---|---|
| display | Supported | Supported |
| boolean, string, text, integer, decimal, date, dateTime, time | Supported | Supported. `time` answers are saved as `HH:MM`, which isn't valid FHIR. |
| choice | Supported (see options) | Supported (see options) |
| open-choice | Supported, with an "other" entry | Works like choice: no free-text entry |
| group | Top level: one screen. Inside another group: **becomes a free-text field, and its questions are lost**. | Supported, including nesting |
| attachment | Camera photo. Inside a group: becomes a text field. | Ignored (a required one blocks Submit) |
| quantity | Number with unit | Ignored (a required one blocks Submit) |
| url, reference | Plain text field | Ignored (a required one blocks Submit) |
| Items nested under a question (not a group) | Shown as separate steps from 2.0.3 | Ignored (a required one blocks Submit) |

## Choice options

| | iOS | React Native |
|---|---|---|
| `answerOption.valueCoding` | Needs `system`, `code` and `display`, or the option is dropped | Supported |
| `answerOption.valueString` / `valueInteger` / others | Dropped | Shown, but the answer is left out of the response |
| `answerValueSet` | Only a ValueSet contained in the Questionnaire (`"#id"`), using the first include's concepts | Ignored: no choices shown |
| Multiple selection | `repeats` **and** itemControl `check-box` | Not supported |
| `initialSelected` | Ignored | Ignored |

A choice question with no usable options is an **error** on iOS.

## Limits and validation

| | iOS | React Native |
|---|---|---|
| `minValue`/`maxValue` `valueInteger` | Supported | Enforced only on **required** questions |
| `minValue`/`maxValue` `valueDecimal` | From 2.0.7 | Enforced only on required questions |
| Date limits `valueDate` | Supported | Ignored |
| Date limits `valueDateTime`, or FHIRPath strings | From 3.0.0-beta.1 | Ignored |
| Limits on `time` | Ignored | Ignored |
| `maxDecimalPlaces`, `questionnaire-unit` | Supported (decimal and quantity) | Ignored |
| `maxLength` | Supported | Caps typing |
| `regex`, validation text (`http://bdh.stanford.edu/fhir/StructureDefinition/validationtext`), `entryFormat` | Supported on text | Ignored |
| `required` | Supported | Supported, but a required question that is hidden or not shown blocks Submit with no message |

## Sliders

| | iOS | React Native |
|---|---|---|
| itemControl `slider` | Integer questions only. Needs both limits as `valueInteger`, a step (`questionnaire-sliderStepValue`, default 1) that divides the range evenly, and **1–13 steps**; otherwise **error**. On decimal questions it's ignored. | Ignored: shows a number field |

## Conditions (`enableWhen`)

| | iOS | React Native |
|---|---|---|
| On a top-level question or a group | Supported | Supported |
| On a question **inside a group** | **Ignored**: always shown | Supported |
| `answerCoding` | `=`, `!=` (others: **error**). Needs `system`, or the condition is ignored. Before 2.0.3 it also needs `display`. | Matches only if `system` and `code` both equal the option's |
| `answerBoolean` | `=`, `!=`, `exists` (others: **error**) | Supported |
| `answerInteger`, `answerDecimal` | All six operators from 2.0.3 (before: `>` and `<` are **errors**) | Supported |
| `answerDate` | `>`, `<`, and from 2.0.3 `>=`, `<=`. `=` and `!=` are **errors**. | Supported |
| `answerDateTime`, `answerTime`, `answerString` | **Error** | Supported |
| `answerQuantity`, `answerReference` | **Error** | Never true: the item is never shown |
| `exists` with anything but `answerBoolean` | **Error** | Supported |
| `enableBehavior` `all`/`any` | Supported, but **swapped in 2.0.3** | Supported |
| Known bug | 2.0.4–2.0.5: conditions in a survey that contains a group may look up the wrong screen | A required question hidden by a condition blocks Submit |

## Ignored everywhere

`initial`, `readOnly`, `rendering-xhtml`/`rendering-markdown` text (iOS shows the plain text; React Native prints the raw extension value), other itemControl codes (drop-down, radio-button, autocomplete, …), `questionnaire-hidden` inside a group on iOS (and everywhere on React Native).

iOS shows `prefix` as the question and moves `text` below it.
