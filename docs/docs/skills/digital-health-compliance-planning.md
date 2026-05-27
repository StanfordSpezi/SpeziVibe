---
sidebar_position: 5
---

# digital-health-compliance-planning

:::tip Install this skill

```bash
npx skills add StanfordSpezi/SpeziVibe --skill digital-health-compliance-planning
```

Or install all skills: `npx skills add StanfordSpezi/SpeziVibe --all`. See the [Getting Started guide](/docs/getting-started) for tool-specific options.

:::

<TryThisSkill skill="digital-health-compliance-planning" />

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

## Example

```
AI:   Before diving into compliance domains — what does the product
      actually do? Who uses it, and what data does it collect?

You:  It's a cardiac rehab app that tracks exercise, collects
      patient-reported outcomes, and shares summaries with
      the care team.

AI:   A few follow-ups:
      — Is this for a research study or direct clinical care?
      — Does it recommend exercise intensity or just track it?
      — Are you at a HIPAA-covered entity like a hospital?

You:  Research study at Stanford. It recommends exercise targets
      based on the patient's care plan.

AI:   Here's my initial assessment:

      ✅ HIPAA — Likely. PHI at a covered entity.
      ✅ IRB — Likely. Research study with human subjects.
      ⚠️ FDA — Possible. Exercise recommendations based on
         clinical data may qualify as clinical decision support.
         Needs legal review.
      ❌ GDPR — Unlikely. US-only participants.

      The FDA question is the one I'd flag to counsel first.
```

## Limitations

- **Not legal advice** — distinguishes product guidance from counsel that requires legal review
- Does not perform a full compliance audit
- Prefers "you likely need to evaluate" over "you must" unless the requirement is well-established
- Flags when local counsel, IRB staff, or compliance officers need to review
