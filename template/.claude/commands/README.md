# Claude Code Development Agents

This directory contains Claude Code agents to assist with developing your digital health React Native app.

## Quick Reference

### Development Agents

| Command | Description |
|---------|-------------|
| `/docs` | Generate documentation and READMEs |
| `/changelog` | Generate changelog from git history |
| `/test` | Generate Jest tests |
| `/fhir` | Validate FHIR R4 compliance |
| `/fhir-mapping` | Generate FHIR resource mappings |
| `/feature` | Create new app features and screens |
| `/release` | Create release notes |

### Planning Agents

| Command | Description |
|---------|-------------|
| `/need-statement` | Craft and scope need statements using the Stanford Biodesign methodology |
| `/study-planner` | Plan health studies and research protocols |
| `/compliance` | Plan HIPAA, IRB, and regulatory compliance |
| `/data-model` | Design health data models and FHIR mappings |
| `/ux-planner` | Design user flows and engagement strategies |

## Usage

Invoke an agent by typing its command in Claude Code:

```
/docs
/study-planner
/compliance
```

You can provide context or specific instructions:

```
/study-planner design a 12-week diabetes management study
/compliance review HIPAA requirements for our app
/data-model plan the medication tracking feature
/ux-planner design the onboarding flow
```

## Development Agents

### `/docs` - Documentation Generator

Generates documentation following project patterns.

**Use when:**
- Creating a README for your app
- Documenting components and hooks
- Adding usage examples

---

### `/test` - Test Generator

Generates Jest tests following project testing patterns.

**Use when:**
- Adding tests for new code
- Writing FHIR mapping round-trip tests
- Testing React components

---

### `/fhir` - FHIR Compliance Checker

Validates code for FHIR R4 compliance.

**Use when:**
- Reviewing healthcare data mappings
- Ensuring compliance before release

---

### `/fhir-mapping` - FHIR Mapping Generator

Generates FHIR R4 resource mappings.

**Use when:**
- Adding support for new FHIR resources
- Extending existing mappings

---

### `/feature` - Feature Generator

Creates new features and screens.

**Use when:**
- Adding a new tab or screen
- Creating components and hooks

---

### `/changelog` - Changelog Generator

Generates changelogs using Keep a Changelog format.

**Use when:**
- Preparing a release
- Documenting recent changes

---

### `/release` - Release Notes Generator

Creates release notes with migration guides.

**Use when:**
- Preparing a version release
- Documenting breaking changes

## Planning Agents

### `/need-statement` - Need Statement Coach

Walks you through Stanford Biodesign's needs-based innovation methodology to craft a rigorous need statement. The agent guides you through five sequential steps using Socratic questioning — it asks probing questions rather than handing you answers.

**The five steps:**
1. **Define the Problem** — Identify a health issue current solutions don't adequately address (solution-free)
2. **Define the Population** — Determine who is most negatively affected (stakeholder analysis)
3. **Define the Outcome** — Choose a measurable result decision-makers would value and pay for
4. **Assemble the Need Statement** — Combine into: "A way to [problem] in [population] in order to [outcome]"
5. **Need Scoping** — Challenge all three components by making them broader/narrower to find the optimal combination

**Use when:**
- Starting a health innovation project and defining the unmet need
- Refining or pressure-testing an existing need statement
- Preparing for needs-based innovation workshops
- Learning the Biodesign methodology through guided practice

**Example:**
```text
/need-statement I observed that elderly patients discharged from the hospital often miss follow-up appointments
```

---

### `/study-planner` - Study Planner

Plans digital health studies and research protocols.

**Use when:**
- Designing a health study
- Planning data collection schedules
- Structuring questionnaires and assessments
- Defining enrollment criteria

---

### `/compliance` - Compliance Planner

Plans regulatory and privacy compliance.

**Use when:**
- Reviewing HIPAA requirements
- Preparing IRB submissions
- Assessing FDA classification
- Planning GDPR compliance

---

### `/data-model` - Data Model Planner

Plans health data models and FHIR structures.

**Use when:**
- Designing data structures
- Mapping app concepts to FHIR resources
- Planning HealthKit integration
- Defining data relationships

---

### `/ux-planner` - UX Planner

Plans user experience flows for health apps.

**Use when:**
- Designing patient journeys
- Planning onboarding flows
- Structuring engagement strategies
- Designing notifications

## Tips

- **Be specific**: Provide context for better results
- **Combine agents**: Use `/need-statement` to define your need, then `/study-planner` to design the validation study
- **Start with planning**: Use `/need-statement` first, then implementation agents
- **Iterate**: Run agents multiple times as you refine requirements
