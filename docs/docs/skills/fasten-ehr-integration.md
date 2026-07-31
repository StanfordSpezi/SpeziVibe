---
sidebar_position: 10
---

# fasten-ehr-integration

:::tip Install this skill

```bash
npx skills add StanfordSpezi/SpeziVibe --skill fasten-ehr-integration
```

Or install all skills: `npx skills add StanfordSpezi/SpeziVibe --all`. See the [Getting Started guide](/docs/getting-started) for tool-specific options.

:::

<TryThisSkill skill="fasten-ehr-integration" />

Walks you through connecting your app to real EHR data with [Fasten Connect](https://connect.fastenhealth.com): patients link their own patient portals through an embedded widget, your backend requests a bulk FHIR export, and a webhook delivers the records into your app's own storage. The skill verifies each stage as you build — keys, widget, export, webhook, parsing — and finishes with a mandatory data-privacy walkthrough covering exactly where the health data travels and what obligations come with holding it.

## What It Produces

- A working, sandbox-tested Fasten Connect integration (widget → export → webhook → local records)
- A data-flow and privacy decision walkthrough (HIPAA right-of-access framing, FTC HBNR, business-associate and research/IRB branches — not legal advice)
- `docs/planning/ehr-connection-brief.md` recording the architecture and privacy decisions for downstream skills

## Output

Produces `docs/planning/ehr-connection-brief.md` alongside the integration code.

## Example

```
AI:   What's your backend stack, and can it receive public HTTPS
      requests — or are we developing locally?

You:  Next.js, running locally for now.

AI:   Then we'll use a tunnel for webhook delivery during development.
      First: create your developer account at
      portal.connect.fastenhealth.com and grab the test-mode keys —
      I'll set up the env config and a key smoke test while you do.
      ...
AI:   Export downloaded: 325 FHIR resources for the Epic sandbox
      patient. Before we go further — here is exactly where that
      data traveled, and the decisions you now own as its custodian.
```
