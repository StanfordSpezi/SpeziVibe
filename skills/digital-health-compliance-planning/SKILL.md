---
name: digital-health-compliance-planning
description: Plan healthcare privacy, research, and regulatory compliance for a digital health product, including HIPAA, IRB, FDA, GDPR, governance, and operational controls.
---

<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# Compliance Planner

Plan privacy, research, regulatory, and governance requirements for a digital health product in a framework-agnostic way.

## When to Use

Use this skill when you need to:
- assess whether a product handles regulated health or research data
- prepare for HIPAA, IRB, FDA, GDPR, or institutional review conversations
- define consent, retention, export, deletion, and audit expectations
- identify compliance work that should shape product scope early

## Working Style

Do not jump straight to controls. First understand:

1. product purpose
2. who the users are
3. whether the product is clinical care, research, wellness, operations, or education
4. what data is collected, derived, shared, or exported
5. which regions, institutions, and partners are involved

Then produce a concise compliance planning brief with assumptions, risks, open questions, and recommended next steps.

## Core Questions

Ask about:

- intended use and claims
- user groups such as patients, participants, clinicians, coordinators, or caregivers
- data types collected, inferred, uploaded, or connected from external systems
- whether the product supports research, quality improvement, or direct care
- data storage, processing, and sharing locations
- third-party vendors and subprocessors
- admin access, audit needs, and incident response expectations
- export, deletion, correction, and retention requirements

## Compliance Areas To Review

### HIPAA and Institutional Privacy

Check whether the product likely handles protected health information or institution-controlled data.

Review:

- what identifiers are present
- who is a covered entity or business associate
- minimum necessary access expectations
- workforce, admin, and support access boundaries
- logging, monitoring, and breach response needs

### Research and IRB

If the product supports a study, review:

- study purpose and protocol maturity
- recruitment and consent approach
- risk level and participant burden
- withdrawal process
- de-identification or anonymization approach
- data sharing and secondary use plans

### FDA and Product Claims

Evaluate whether the product may be treated as software with medical-device implications.

Ask:

- does it diagnose, recommend treatment, monitor for intervention, or drive clinical action
- are outputs informational, advisory, or action-triggering
- what happens if the product is wrong, unavailable, or delayed

### GDPR and Cross-Border Privacy

If EU or UK users may be involved, review:

- lawful basis
- consent and withdrawal mechanics
- subject rights handling
- transfer mechanisms
- retention, deletion, and processing-record expectations

## Planning Outputs

Produce a brief with these sections:

### 1. Scope Summary

- product purpose
- user groups
- jurisdictions and institutions
- data categories in scope

### 2. Likely Compliance Domains

Mark each as `likely`, `possible`, or `unlikely`:

- HIPAA or institutional privacy
- IRB or human subjects review
- FDA or software-as-medical-device review
- GDPR or other regional privacy obligations
- security review by enterprise or academic partners

### 3. Key Risks

Call out the highest-risk issues, such as:

- unclear product claims
- unnecessary data collection
- missing consent boundaries
- unclear vendor or data-sharing relationships
- lack of export, deletion, or audit processes

### 4. Required Decisions

List decisions the team must make soon, for example:

- exact data categories to collect
- whether identifiable data is actually required
- whether the product is research, care delivery, or wellness
- retention timelines
- who can access what data and why

### 5. Recommended Controls

Express these as implementation-neutral capabilities, not code:

- access control and least privilege
- encryption in transit and at rest
- audit logging
- consent capture and versioning
- export and deletion workflows
- vendor review and data processing agreements
- documented retention and incident response procedures

## Important Guardrails

- Do not present legal conclusions as certainties.
- Distinguish clearly between product guidance and legal advice.
- Prefer “you likely need to evaluate” over “you must” unless the requirement is explicit and well established.
- Flag when local counsel, compliance officers, IRB staff, or institutional privacy teams should review the plan.

## Checklist

- [ ] Product purpose and claims clarified
- [ ] User groups and jurisdictions identified
- [ ] Data categories and sharing paths mapped
- [ ] Research and clinical context assessed
- [ ] Likely compliance domains identified
- [ ] High-risk gaps called out
- [ ] Required decisions listed
- [ ] Recommended controls framed without platform-specific implementation details
