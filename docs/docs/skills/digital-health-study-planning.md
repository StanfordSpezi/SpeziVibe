---
sidebar_position: 4
---

# digital-health-study-planning

Helps plan a digital health research protocol. Platform-agnostic — focuses on the study design, not the app stack.

## What It Covers

- Enrollment and recruitment strategies
- Consent workflows
- Data collection matrix (what, source, frequency, validation)
- Assessment schedules (baseline, recurring, triggered, closeout)
- Outcome measures (primary, secondary, feasibility)
- Operational risks and participant burden

## Output

Produces `docs/planning/study-brief.md`.

## Example

```
AI:   What's the study objective? And what kind of study are you
      planning — randomized trial, single-arm, observational?

You:  We want to test whether our app improves exercise adherence
      in cardiac rehab patients vs. standard of care. Randomized.

AI:   Got it. Who are the participants, and how long do you plan
      to follow them?

You:  Adults 40-75 who completed phase II cardiac rehab.
      12 weeks with a 4-week follow-up.

AI:   Here's a draft data collection matrix:

      | Data Type       | Source    | Frequency  | Purpose           |
      |-----------------|-----------|------------|-------------------|
      | Step count      | HealthKit | Daily      | Primary outcome   |
      | Exercise mins   | Self-report | Weekly   | Primary outcome   |
      | PHQ-9           | In-app    | Biweekly   | Secondary outcome |
      | App usage       | Analytics | Continuous | Engagement        |
      | Adverse events  | Clinician | As needed  | Safety            |

      Does this capture what you need? Any missing data types?
```

## Limitations

- Does not produce a detailed statistical analysis plan or IRB protocol document
- Flags where clinical, statistical, or IRB review is still needed
- Does not recommend specific sensors, EHR integrations, or app architecture
