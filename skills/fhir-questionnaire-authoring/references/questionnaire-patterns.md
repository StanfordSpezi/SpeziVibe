<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# Questionnaire Patterns

Copy-ready FHIR R4 JSON. Every pattern here passes `questionnaire-check` against ResearchKitOnFHIR 2.0.7 with no issues. Patterns marked **iOS only** are ignored by the SpeziVibe React Native template (the checker warns about them). Replace `example-app.com` with the project's domain.

## Skeleton

```json
{
  "resourceType": "Questionnaire",
  "url": "http://example-app.com/fhir/Questionnaire/daily-check-in",
  "version": "1.0.0",
  "name": "DailyCheckIn",
  "title": "Daily Check-In",
  "status": "draft",
  "language": "en-US",
  "item": []
}
```

On iOS, `title` is shown on every screen. Use `status: "active"` only after the team has reviewed the survey.

## Text shown to the participant

```json
{ "linkId": "intro", "type": "display", "text": "This takes about two minutes." }
```

## Yes / no

```json
{ "linkId": "slept-well", "type": "boolean", "text": "Did you sleep well last night?", "required": true }
```

## Free text

```json
{ "linkId": "notes", "type": "text", "text": "Anything else you want to tell us?", "required": false }
```

Use `"type": "string"` for a single line, and `"maxLength": 200` to limit the length.

## Numbers with limits

```json
{
  "linkId": "sleep-hours", "type": "decimal", "text": "How many hours did you sleep?", "required": true,
  "extension": [
    { "url": "http://hl7.org/fhir/StructureDefinition/minValue", "valueInteger": 0 },
    { "url": "http://hl7.org/fhir/StructureDefinition/maxValue", "valueInteger": 24 },
    { "url": "http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces", "valueInteger": 1 }
  ]
}
```

- Whole-number limits use `valueInteger`, even on decimal questions: ResearchKitOnFHIR before 2.0.7 ignores `valueDecimal` limits. Use `valueDecimal` only for fractional limits (e.g. `2.5`).
- React Native only enforces limits on **required** questions, and ignores `maxDecimalPlaces`.
- For whole numbers, use `"type": "integer"`.

## Single choice

```json
{
  "linkId": "mood", "type": "choice", "text": "How is your mood today?", "required": true,
  "answerOption": [
    { "valueCoding": { "system": "http://example-app.com/fhir/CodeSystem/mood", "code": "good", "display": "Good" } },
    { "valueCoding": { "system": "http://example-app.com/fhir/CodeSystem/mood", "code": "okay", "display": "Okay" } },
    { "valueCoding": { "system": "http://example-app.com/fhir/CodeSystem/mood", "code": "bad", "display": "Bad" } }
  ]
}
```

Every option needs `system`, `code` and `display`. For a validated instrument, use the official codes (e.g. LOINC answer codes) only if you have them from the official source.

## Multiple choice (iOS only)

```json
{
  "linkId": "activities", "type": "choice", "text": "Which activities did you do?", "required": false, "repeats": true,
  "extension": [
    { "url": "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl",
      "valueCodeableConcept": { "coding": [ { "system": "http://hl7.org/fhir/questionnaire-item-control", "code": "check-box" } ] } }
  ],
  "answerOption": [
    { "valueCoding": { "system": "http://example-app.com/fhir/CodeSystem/activity", "code": "walk", "display": "Walking" } },
    { "valueCoding": { "system": "http://example-app.com/fhir/CodeSystem/activity", "code": "swim", "display": "Swimming" } }
  ]
}
```

iOS needs the `check-box` control; `repeats` alone stays single-select. React Native has no multiple choice: it ignores both.

## Slider (iOS only)

```json
{
  "linkId": "pain", "type": "integer", "text": "How much pain do you have right now?", "required": true,
  "extension": [
    { "url": "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl",
      "valueCodeableConcept": { "coding": [ { "system": "http://hl7.org/fhir/questionnaire-item-control", "code": "slider" } ] } },
    { "url": "http://hl7.org/fhir/StructureDefinition/minValue", "valueInteger": 0 },
    { "url": "http://hl7.org/fhir/StructureDefinition/maxValue", "valueInteger": 10 },
    { "url": "http://hl7.org/fhir/StructureDefinition/questionnaire-sliderStepValue", "valueInteger": 1 }
  ]
}
```

Integer questions only, with both limits, a step that divides the range evenly, and **at most 13 steps**. Otherwise ResearchKit rejects the slider. React Native shows a number field instead.

## Date

```json
{
  "linkId": "start-date", "type": "date", "text": "When did you start the study medication?", "required": true,
  "extension": [ { "url": "http://hl7.org/fhir/StructureDefinition/maxValue", "valueDate": "2030-12-31" } ]
}
```

Date limits use `valueDate`. React Native ignores date limits.

## Follow-up question (condition on a choice)

```json
{
  "linkId": "mood-details", "type": "text", "text": "What made today hard?", "required": false,
  "enableWhen": [
    { "question": "mood", "operator": "=",
      "answerCoding": { "system": "http://example-app.com/fhir/CodeSystem/mood", "code": "bad" } }
  ]
}
```

- Copy `system` and `code` exactly from the option. Without `system`, iOS ignores the condition.
- Keep follow-ups **optional** if the app may be React Native: a required question that is hidden blocks Submit there.
- Choices: `=` and `!=`. Numbers (`answerInteger`/`answerDecimal`): `=`, `!=`, `>`, `<`, `>=`, `<=`. Yes/no (`answerBoolean`): `=`, `!=`, `exists`. Dates (`answerDate`): `>`, `<`, `>=`, `<=` only.

## Group (one screen on iOS)

```json
{
  "linkId": "symptoms", "type": "group", "text": "Symptoms",
  "enableWhen": [ { "question": "slept-well", "operator": "=", "answerBoolean": false } ],
  "item": [
    { "linkId": "symptoms-headache", "type": "boolean", "text": "Do you have a headache?", "required": false },
    { "linkId": "symptoms-note", "type": "display", "text": "Answer for the last 24 hours." },
    { "linkId": "symptoms-other", "type": "string", "text": "Anything else?", "required": false, "maxLength": 200 }
  ]
}
```

- Put conditions on the **group**, not on questions inside it (iOS ignores those).
- No groups inside groups. Every item in a group needs `text`.
- Don't put an attachment (photo) question in a group: on iOS it becomes a text field.
