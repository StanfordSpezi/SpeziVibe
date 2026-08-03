---
name: fasten-ehr-integration
description: Integrate patient-authorized EHR record retrieval into a digital health app using Fasten Connect — provider linking, webhook ingestion, FHIR record handling, and the data privacy decisions that come with holding the records.
---

<!--
This source file is part of the Stanford Spezi open-source project.
SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# Fasten EHR Integration

Walk the user through connecting their app to real electronic health record (EHR) data with [Fasten Connect](https://connect.fastenhealth.com) — from developer account to a **working, tested integration** that downloads a patient's FHIR records into the app's own storage, plus a **saved brief of the privacy and architecture decisions** (`docs/planning/ehr-connection-brief.md`). In this architecture the health data ends up in the user's app, and that makes it their responsibility — do not let the integration ship without the privacy walkthrough.

## When to Use

Use this skill when the user wants to:

- let patients pull their own medical records into a digital health app
- get real FHIR data (conditions, meds, labs, documents) without per-health-system integrations
- prototype against realistic EHR sandboxes before going live

Do **not** use this skill when:

- the app must *write* to an EHR, or clinicians launch it from inside the EHR — that is SMART on FHIR / vendor-marketplace territory
- the data source is wearables or HealthKit — use `health-data-model-planning`
- synthetic FHIR data is enough — Fasten publishes an [example EHI export](https://gist.github.com/AnalogJ/1fe4b4da2878dc021f6f4fe6538ee37f) (Epic sandbox, JSONL), and Synthea or public SMART sandboxes need no account at all

## Background

Fasten Connect is a patient-consent record aggregator. Instead of integrating with each EHR vendor and health system individually, the app embeds one widget and the patient authorizes access themselves:

```
Patient ──logs into their own patient portal──▶ Provider EHR
   │                                                │
   ▼                                                ▼
Your app ◀──FHIR records (webhook + download)── Fasten Connect
```

1. The app embeds Fasten's **Stitch widget**. The patient finds their health system and signs in to **their own patient portal** (e.g., MyChart). Credentials go to the provider, never to the app.
2. The authorized connection comes back as an `org_connection_id` the backend stores — this is the durable consent handle.
3. The backend requests a **bulk EHI export**. Fasten retrieves the records and packages them as **FHIR resources in NDJSON/JSONL** (one resource per line; R4 in practice for the major EHR patient-access APIs).
4. Fasten notifies the backend via **webhook** with download links; the backend downloads the files. Fasten deletes the export from its storage after 24 hours — the app's copy becomes the only copy in this flow.

This is *consumer-mediated exchange*: the patient exercises their HIPAA right of access and directs the records to the app. It is read-only — there is no write-back to the EHR. Fasten also supports a TEFCA Individual Access Services path with identity proofing (CLEAR / ID.me) instead of portal logins; the API surface is the same.

## Working Style

You are an expert integration guide. Work step by step and **verify each stage actually works before moving to the next** — the core of this integration is asynchronous and webhook-driven, and debugging it all at the end is far harder than proving each link as you go. Don't front-load questions. Cross-check anything surprising against the [official docs](https://docs.connect.fastenhealth.com) — API details drift, and the docs win over this skill.

---

## Step 1: Understand the App

Ask what you can't infer from the project:

1. "What's your backend stack, and can it receive public HTTPS requests — or are we developing locally?"
2. "Where will the downloaded records live — local disk, a database, a cloud bucket? Who is supposed to be able to see them?"
3. "Sandbox first, or do you already have live-mode access?"

| Answer | What it drives |
|--------|----------------|
| Backend stack & reachability | All Fasten API calls and the private key are server-side; webhook delivery needs a public URL or a local-dev fallback (Step 5) |
| Where records rest | The privacy conversation in the Data Privacy section — storage, encryption, access, deletion |
| Test vs. live | Test keys reach ~24 sandboxes (FooClinic, Epic, Cerner, payer sandboxes); live keys reach real health systems |

Always start in **test mode**. The flow is identical to live mode except which health systems are reachable.

**Confirm before proceeding:** you know the backend, the storage destination, and that you're starting in test mode.

---

## Step 2: Developer Account and Keys

Have the user do this themselves — it is their account, and you should never handle their credentials:

1. Register at the [Fasten Connect developer portal](https://portal.connect.fastenhealth.com).
2. Copy the **test mode** keypair: public id (`public_test_…`) and private key (`private_test_…`). The private key is shown once — save it immediately.
3. The portal requires a **redirect URL** — the URL Fasten redirects to after a successful link, which also receives connection parameters as query params. In the standard Stitch popup/modal flow, results additionally arrive in-page via the widget's events, so most integrations act on the events; the app's base URL is a sensible value here. (Redirect-mode and mobile deep-link flows use it directly — see the docs if that's the app's shape.)

Then configure the project:

- Both keys go in server-side environment configuration (e.g., `.env.local`), **gitignored**. Quote the values — private keys can contain shell-special characters that env-file parsers or `dotenv-expand` mangle.
- The **public id is designed to be public** (it is embedded in the client-side widget). The **private key must never reach a client**: no `NEXT_PUBLIC_`/`EXPO_PUBLIC_`-style prefixes, no client bundles, no mobile app binaries.

API authentication is HTTP Basic against `https://api.connect.fastenhealth.com/v1` — public id as username, private key as password. The same base URL serves test and live; the keys select the mode.

**Verify before proceeding:** smoke-test the keys with any authenticated GET (e.g., the export-status endpoint with a dummy id): a `401` means the keys are wrong or mangled; a `404`/JSON error means auth worked. This catches quoting mistakes two steps before they'd otherwise surface.

---

## Step 3: Embed the Connect Widget

Add the Stitch v4 widget wherever patients will connect a provider. Web component (any framework):

```html
<link rel="stylesheet" href="https://cdn.fastenhealth.com/connect/v4/fasten-stitch-element.css">
<script type="module" src="https://cdn.fastenhealth.com/connect/v4/fasten-stitch-element.js"></script>

<fasten-stitch-element public-id="public_test_…">Connect a provider</fasten-stitch-element>
```

A React SDK (`@fastenhealth/fasten-stitch-element-react`) and React Native support exist — see the [Stitch v4 docs](https://docs.connect.fastenhealth.com/stitch/v4/introduction).

Listen on the element's `eventBus` DOM event. The payload arrives as a **JSON string** in `event.detail.data` — parse it:

```js
document.querySelector('fasten-stitch-element')
  .addEventListener('eventBus', (event) => {
    const payload = JSON.parse(event.detail.data);
    if (payload.event_type === 'widget.complete') {
      // payload.data: [{ org_connection_id, platform_type, connection_status, … }]
      // POST it to YOUR backend and persist org_connection_id
    }
  });
```

Persist every `org_connection_id` server-side with a timestamp and the connection metadata — it is both the API handle for exports and the start of the app's **consent audit trail**. (Richer connection metadata, including `consent_expires_at` when the EHR reports it, arrives via the `patient.connection_success` webhook — Step 5.)

**Verify before proceeding:** connect a sandbox provider — FooClinic with `johndoe@fooclinic.com` / `f00clinic` from Step 7's table is the fastest first run — and confirm the `org_connection_id` lands in backend storage.

---

## Step 4: Request an Export

From the backend only:

```
POST https://api.connect.fastenhealth.com/v1/bridge/fhir/ehi-export
Authorization: Basic base64(public_id:private_key)
Content-Type: application/json

{"org_connection_id": "…"}
```

The response carries a `task_id`; processing is asynchronous (seconds to minutes, and tasks can time out — a `patient.ehi_export_failed` webhook follows, so plan a bounded retry: because `failure_reason` is often suppressed, re-request a small number of times with backoff, then stop and surface to the user or Fasten support).

Make sure the user understands:

- **Download links are delivered only via webhook.** The status endpoint (`GET /v1/bridge/fhir/ehi-export/{task_id}`) returns `pending`/`success`/`failed` for informational use — never links — and Fasten's docs explicitly discourage polling. Without a registered webhook endpoint, the export cannot be retrieved.
- **The endpoint is idempotent per `org_connection_id`** — re-requesting returns the existing task. For missed webhook deliveries, the documented recovery tools are Fasten's automatic retries (up to 4 over ~24h), the portal's **Delivery Logs** (payloads visible for 15 days), and the test-mode **Webhook Simulator**. (In practice a re-request has been observed to re-deliver the completion webhook, but that behavior is not documented — don't build on it.)
- **Order note:** register the webhook endpoint (Step 5) before the first export, or expect the first completion notice to go nowhere — the idempotent re-request makes recovering from that safe in sandbox.

**Verify before proceeding:** `task_id` recorded, and the status endpoint returns `pending` or `success` for it.

---

## Step 5: Receive the Webhook and Download

Implement a webhook endpoint (e.g., `POST /api/webhooks/fasten`) that:

1. **Verifies the signature.** Fasten conforms to the [Standard Webhooks](https://www.standardwebhooks.com) spec — verify with any Standard Webhooks library and the endpoint's signing secret from the portal. This is baseline security for any webhook endpoint, in both modes. Note: secrets are per endpoint and per mode — Fasten's FAQ requires **distinct webhook URLs for test and live**, each with its own signing secret.
2. **Handles these events** (each payload envelope carries `api_mode`, a stable `id` for idempotency, `type`, and `data`):
   - `patient.ehi_export_success` — `data` has `task_id`, `org_connection_id`, `download_links[]` (`url`, `export_type`, `content_type`), and `stats` with per-resource-type counts. Auto-subscribed.
   - `patient.ehi_export_failed` — `failure_reason` is often `suppressed_please_contact` because the real error may contain PHI. Auto-subscribed.
   - `patient.connection_success` and `patient.authorization_revoked` — **not enabled by default**; toggle them on for the endpoint in the portal. Revocations can arrive in bulk.
3. **Downloads immediately.** Fetch each `download_links[].url` with the same Basic auth; the API replies with a redirect to a signed URL (valid ~10 minutes — re-request for a fresh one). Links work for 24 hours from the webhook; **Fasten deletes the export after 24 hours**. Treat the webhook as the moment the app takes custody. Exports range from a few MB to multi-GB for dense records — stream to storage rather than buffering in memory.
4. **Returns 2xx quickly** and does heavy processing after acknowledging; failed deliveries are retried with the same event `id`.

Register the endpoint URL in the portal's webhook settings.

**Local development** — the webhook must reach the developer's machine:

| Option | How | Notes |
|--------|-----|-------|
| Tunnel (preferred) | `cloudflared tunnel --url http://localhost:PORT` (no account) or `ngrok http PORT`; register `https://<tunnel>/api/webhooks/fasten` | Fully automatic. Quick-tunnel URLs change per restart — update the portal, and note a *new* endpoint gets a *new* signing secret (update the env var too; editing the existing endpoint's URL in place keeps the secret) |
| Manual paste | Register the endpoint URL in the portal even if unreachable (deliveries are still attempted and logged), then copy the `patient.ehi_export_success` payload from **Webhooks → Delivery Logs** into a small ingest endpoint in the app that runs the same download logic | No tunnel needed; good enough for sandbox development |
| Hosted inbox (smee.io, requestbin) | Fasten's own docs suggest these for temporary testing | Sandbox only — never route live-patient webhook traffic through a third-party inbox |

**Verify before proceeding:** deliver a `webhook.test` event from the portal's **Webhook Simulator** and see it reach the endpoint (simulator events go through the normal delivery path, so signature verification is exercised). On the manual-paste path, the gate is instead: pipe a copied payload through the ingest endpoint and confirm files land in storage. Then run a real sandbox export end to end.

---

## Step 6: Parse and Display

Export files are NDJSON/JSONL: one FHIR resource per line. Parse tolerantly — real-world records are messy:

- Skip malformed lines rather than failing the file; defensively unwrap any `Bundle` into its entries.
- Group by `resourceType`. A typical export spans `Patient`, `Condition`, `MedicationRequest`, `AllergyIntolerance`, `Observation` (usually the bulk — labs and vitals), `DiagnosticReport`, `Immunization`, `Procedure`, `Encounter`, `DocumentReference`/`Binary` (often PDFs), plus `Practitioner`/`Organization`/`Location` reference data.
- Render names, codes, and dates defensively: prefer `.text`, fall back through `coding[].display` → `code`; dates scatter across `effectiveDateTime`, `onsetDateTime`, `authoredOn`, `issued`, `period.start`.
- You can build and test this entire layer before keys exist, against Fasten's [example export gist](https://gist.github.com/AnalogJ/1fe4b4da2878dc021f6f4fe6538ee37f).
- If the app needs a formal schema, run `fhir-data-model-design` and map incoming resources onto its output.

---

## Step 7: Test End to End

Sandboxes available in test mode (full credential list: [test patient credentials](https://docs.connect.fastenhealth.com/guides/test-patient-credentials)):

| Sandbox | Credentials | Good for |
|---------|-------------|----------|
| FooClinic (Sandbox) — Fasten's own, 16 personas | `johndoe@fooclinic.com` / `f00clinic` (11 resources); `earlcarrillo@fooclinic.com` / `f00clinic` (3,500+ resource oncology record) | First runs; volume testing |
| Epic sandbox | `fhircamila` / `epicepic1` | Realistic Epic-shaped data |
| Cerner, athenahealth, payer sandboxes (Aetna, Cigna, Medicare, VA) | See credentials guide | Breadth across platform types |

Full-flow verification — every item passes before the integration is done:

- [ ] Widget connects a sandbox provider; `org_connection_id` persisted server-side
- [ ] Export requested from the backend; `task_id` recorded
- [ ] Webhook received with signature verified; files streamed into app storage
- [ ] Records parsed and visible in the app's UI
- [ ] `patient.ehi_export_failed` handled: exercise the handler via the portal's Webhook Simulator (or a signed synthetic payload against the endpoint); bounded retry path exists
- [ ] `patient.authorization_revoked` enabled in the portal and handled per the app's consent policy — exercised the same way (the simulator is the sandbox path; real revocations can't be triggered on demand)
- [ ] Private key absent from client bundles and version control

---

## Data Privacy: Where the Health Data Goes

Walk the user through this table explicitly — it is the part innovators skip and regret. This is product guidance, not legal advice; flag that counsel, compliance officers, or institutional privacy teams should review before a live launch.

| Stage | Who holds health data | Notes |
|-------|----------------------|-------|
| Portal login | Provider only | Patient credentials go into the provider's own portal; neither the app nor Fasten stores them in this flow |
| Retrieval & packaging | Fasten's cloud (AWS; subprocessors listed at [trust.fastenhealth.com](https://trust.fastenhealth.com), all US-labeled) | Fasten states data is encrypted in transit and at rest, and that temporary copies are auto-deleted within 24 hours of successful transmission |
| Export at rest (Fasten) | Fasten, ≤ 24 hours | Deleted after the retention window; download links die with it |
| Webhook payload | The app's backend (+ any tunnel or inbox in the path) | Contains identifiers, stats, and download links — links still require the API keys, but treat payloads as sensitive; no third-party inboxes in live mode |
| Download | The app's backend | Basic auth + short-lived signed URL (~10 min) |
| **At rest in the app** | **The app team — indefinitely** | The point of the architecture: the app holds the records. Encryption, access control, retention, deletion, and breach response are now the app's obligations |

Decisions to force before live mode (record them in the brief — Output section):

- **Custody transfers at download.** After 24 hours the app's copy is the only copy in this flow. Decide where records rest, who can access them, how they are encrypted, and how a patient gets them deleted — before real records arrive.
- **Regulatory framing depends on who the app serves.** Three branches to walk through:
  - *Consumer-directed:* per [HHS OCR guidance on the access right and health apps](https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/access-right-health-apps-apis/index.html), records an individual directs to an app that is neither a covered entity nor a business associate are no longer subject to the HIPAA Rules — but the FTC Health Breach Notification Rule and state health-privacy laws (e.g., California CMIA, which treats consumer health-record apps as providers of health care; Washington My Health My Data) likely do apply, and FTC Act Section 5 reaches any privacy promises the app makes. Fasten's materials do not address the HBNR; this analysis is the app team's own.
  - *On behalf of a covered entity:* the app is likely a business associate needing BAAs — including evaluating one with Fasten. Fasten's policy says it "may qualify as a business associate" for some clients; whether Fasten signs BAAs is not publicly documented — **ask Fasten directly**.
  - *Research use:* if records feed a study, engage the IRB before live mode, align the connection/consent moment with research informed consent, and check whether the institution's covered-entity status and data-governance rules (data risk classification, approved storage environments — common at academic medical centers) change the storage and access requirements.
  Run `digital-health-compliance-planning` for the full analysis.
- **Vendor claims need verification.** Fasten self-describes as SOC 2-attested and "SOC2 & HIPAA-compliant" in marketing, while its privacy policy states it is an IAS provider "not directly subject to HIPAA"; the SOC 2 reports and a HIPAA assessment are request-gated at their trust center. For a serious deployment, request them; do not repeat marketing claims in the app's own privacy story.
- **Consent is patient-controlled and expires.** Connection metadata may carry `consent_expires_at` — per Fasten's docs, only when the EHR reports it (they cite an HTI-2 mandate effective January 2026, with EHR support still uneven). Patients can revoke; revocation stops future retrieval but does not undo prior disclosures. For already-downloaded data, the realistic post-revocation choices are **delete** or **archive-and-stop-using** (e.g., for legal hold or audit): continued product use of revoked data likely conflicts with the "stop future use" obligation below, regardless of disclosure.
- **Fasten's consent terms flow down to the app.** Fasten's privacy policy states that, as a CARIN Alliance Code of Conduct signatory, it "enforces" requirements on all customers: consent-only use, easy revocation, and disclosure of AI/ML use and third-party sharing. Confirm the exact flow-down obligations in the Fasten Connect agreement at signup — the app's privacy policy and behavior must actually meet them.
- **Keys are the perimeter.** The private key authorizes every export and download. Server-side only, gitignored, rotated if exposed, separate keypairs per environment.
- **Minimize what is kept.** Exports contain more than most products need — especially free-text notes and `Binary` documents. They can also include heightened-sensitivity categories (substance-use records originating from 42 CFR Part 2 programs, reproductive health, adolescent-confidential records) that raise the stakes of retention and any future sharing — decide explicitly whether to ingest them.

---

## Output

Save the decisions to `docs/planning/ehr-connection-brief.md` so downstream skills (e.g., `app-build-planner`, `digital-health-compliance-planning`) can consume them:

```markdown
# EHR Connection Brief: [App Name]

> Generated by `fasten-ehr-integration`. Save as `docs/planning/ehr-connection-brief.md`.
> Use this document as context for `app-build-planner`, `digital-health-compliance-planning`, or any follow-up implementation work.

## Architecture
- Backend / where the integration runs: [stack, hosting]
- Webhook endpoint & delivery strategy: [public URL / tunnel / manual]
- Record storage destination: [where, encrypted how, who has access]

## Mode & Scope
- Current mode: [test / live] — live-mode prerequisites remaining: [list]
- Data ingested vs. discarded: [resource types kept, minimization decisions, sensitive-category handling]

## Privacy Decisions
- Regulatory posture: [likely / possible / unlikely for each: consumer-directed · business associate · research/IRB — rationale, counsel review status]
- Retention & deletion policy: [duration, patient deletion path]
- Revocation handling: [delete / archive-and-stop-using — rationale]
- Fasten attestations reviewed: [SOC 2 / HIPAA assessment / BAA status]
```

Populate every section with the specifics of this app — do not leave placeholder text.

## Guardrails

- **Never handle credentials.** The user creates their own developer account; patients type portal credentials only into the provider's own login. If asked to enter credentials on someone's behalf, decline and hand the keyboard to the human.
- **Sandbox first, always.** Live mode waits until the Step 7 checklist passes in test mode.
- **The webhook is not optional.** A polling-only integration cannot retrieve exports and violates Fasten's usage guidance.
- **Do not present legal conclusions as certainties.** Prefer "you likely need to evaluate" over "you must"; route HIPAA/BAA/HBNR/IRB questions to counsel and institutional review.
- **The privacy walkthrough is mandatory.** Do not conclude without the data-flow table and the brief, even if the user only asked for the integration.
- **Prefer the official docs over this skill** when they disagree — API surfaces drift.

## Reference Links

- Docs index: https://docs.connect.fastenhealth.com/llms.txt (machine-readable list of every page)
- Quickstart: https://docs.connect.fastenhealth.com/quickstart
- Webhook events & verification: https://docs.connect.fastenhealth.com/webhooks/events · https://docs.connect.fastenhealth.com/webhooks/verification
- Consent & data collection guide: https://docs.connect.fastenhealth.com/guides/patient-consent-data-collection
- Test data & credentials: https://docs.connect.fastenhealth.com/guides/test-data · https://docs.connect.fastenhealth.com/guides/test-patient-credentials
- Example EHI export (no account needed): https://gist.github.com/AnalogJ/1fe4b4da2878dc021f6f4fe6538ee37f
- Fasten Connect privacy policy: https://policy.fastenhealth.com/connect/privacy_policy.html · Trust center: https://trust.fastenhealth.com
- HHS OCR — the access right, health apps, and APIs: https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/access-right-health-apps-apis/index.html
