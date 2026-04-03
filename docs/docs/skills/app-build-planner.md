---
sidebar_position: 9
---

# app-build-planner

Reads planning documents from the other skills and produces a milestone-based implementation plan. Does not generate code.

## Inputs

Reads whichever of these exist (works with whatever's available):

- `docs/planning/need-statement.md`
- `docs/planning/ux-brief.md`
- `docs/planning/study-brief.md`
- `docs/planning/data-model-brief.md`
- `docs/planning/fhir-data-model.md`
- `docs/planning/compliance-brief.md`

Also needs your platform choice (React Native or Apple-native) and backend choice (Firebase, Medplum, or other).

## Output

Produces `docs/implementation-plan.md` containing:

- Context table (app name, need statement, platform, backend)
- Planning inputs summary with gaps noted
- Feature list with priorities and package mappings
- Milestone sequence (typically 8-12 milestones) each with:
  - Goal, dependencies, tasks, platform notes, verification criteria
- Data model and compliance integration tables
- Open questions

## Limitations

- Does not generate application code — only a plan document
- Features without matching packages are flagged as "custom implementation" with effort estimates
- Milestones are capped at 5-7 tasks; larger ones are split
- Flags all gaps from missing planning inputs
