---
name: digital-health-study-planning
description: Plan a digital health study or research protocol, including enrollment, consent, data collection, assessment schedules, study operations, and outcome measures.
---

<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# Study Planner

Plan digital health studies and research protocols without assuming a particular app stack.

## When to Use

Use this skill when you need to:
- shape a research question into a study plan
- define enrollment, consent, and participation requirements
- design data collection and assessment schedules
- align outcomes, operations, and participant burden

## Working Style

Start by understanding the study, not the interface. Ask questions before proposing structure.

Clarify:

1. objective or hypothesis
2. participant population
3. study type and duration
4. primary and secondary outcomes
5. expected study procedures and burden
6. operational constraints such as staffing, review, and follow-up

## Planning Framework

### 1. Study Overview

Define:

- study name
- objective or hypothesis
- population
- study type such as observational, interventional, feasibility, or survey-based
- duration and major milestones

### 2. Enrollment and Consent

Work through:

- inclusion criteria
- exclusion criteria
- recruitment channels
- screening steps
- consent requirements
- participant withdrawal process

Do not assume device ownership, app literacy, or language access without checking.

### 3. Data Collection Plan

Create a table like this:

| Data Type | Source | Frequency | Purpose | Notes |
|-----------|--------|-----------|---------|-------|
| Baseline demographics | Intake questionnaire | Once | Eligibility and cohort description | Keep minimal |
| Symptoms | Participant self-report | Daily or weekly | Outcome tracking | Define burden clearly |
| Clinical measurements | Device, sensor, chart, or manual entry | As needed | Primary or secondary outcomes | Clarify validation path |
| Engagement data | Product telemetry | Ongoing | Feasibility and adherence | Avoid collecting unnecessary detail |

### 4. Assessment Schedule

Map the study rhythm:

- baseline
- recurring assessments
- triggered events
- follow-up visits
- closeout or exit steps

For each step, note:

- what happens
- expected completion time
- whether it is required or optional
- what constitutes missingness or protocol deviation

### 5. Outcome Measures

Define:

- primary outcomes
- secondary outcomes
- feasibility or engagement measures
- timing of analysis
- what success or signal detection means

Push for measurable outcomes, not vague aspirations.

## Operational Questions

Ask about:

- who monitors study progress
- who responds to missed assessments
- what happens if participants stop engaging
- whether reminders, escalations, or coordinator outreach are planned
- what data quality review is needed during the study

## Deliverable Format

Produce a concise study planning brief with:

- study summary
- enrollment and consent plan
- data collection matrix
- assessment schedule
- outcome measures
- operational risks and open questions

Save the brief as `docs/planning/study-brief.md` in the project repository.

## Guardrails

- Keep the plan platform-agnostic unless the user explicitly wants implementation advice.
- Do not assume a particular interoperability standard, sensor integration, or client architecture by default.
- Flag where clinical, statistical, or IRB review is still needed.
- Highlight participant burden whenever the plan becomes too heavy.

## Checklist

- [ ] Objective and population clearly defined
- [ ] Study type and duration captured
- [ ] Enrollment and consent plan outlined
- [ ] Data collection matrix created
- [ ] Assessment schedule defined
- [ ] Primary and secondary outcomes specified
- [ ] Operational responsibilities identified
- [ ] Key risks and open questions documented
