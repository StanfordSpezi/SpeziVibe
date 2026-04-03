---
sidebar_position: 5
---

# digital-health-compliance-planning

Helps you reason through which compliance domains apply to your project and what controls you should consider. Framework-agnostic — recommends capabilities, not specific implementations.

## Domains Assessed

Each is marked as likely, possible, or unlikely for your project:

- **HIPAA** or institutional privacy
- **IRB** or human subjects review
- **FDA** or Software as a Medical Device (SaMD)
- **GDPR** or other regional privacy
- Enterprise/academic security review

## Output

Produces `docs/planning/compliance-brief.md` containing:

- Scope summary (product, users, jurisdictions, data categories)
- Domain applicability assessment
- Key risks (unclear claims, unnecessary data collection, missing consent, vendor gaps)
- Required decisions
- Recommended controls (access control, encryption, audit logging, consent capture, export/deletion)

## Limitations

- **Not legal advice** — distinguishes product guidance from counsel that requires legal review
- Does not perform a full compliance audit
- Prefers "you likely need to evaluate" over "you must" unless the requirement is well-established
- Flags when local counsel, IRB staff, or compliance officers need to review
