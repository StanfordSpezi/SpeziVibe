# HIPAA Mode — Technical Specification

## Overview

Add a `--hipaa` flag to the SpeziVibe CLI that activates HIPAA-compliant defaults for digital health apps handling Protected Health Information (PHI). When enabled, the generator enforces encryption, access controls, audit logging, and produces a compliance checklist tailored to the chosen backend.

## Goals

1. **Zero-config security** — HIPAA mode should "just work" without requiring deep security knowledge
2. **Backend-aware** — Different backends (Firebase, Supabase, Medplum, Local) need different safeguards
3. **Auditable** — Generated apps include audit logging and a compliance checklist
4. **Educational** — Help students understand WHY each safeguard matters

## CLI Integration

### Flag
```bash
npx create-spezivibe-app my-health-app --hipaa
```

### Interactive Prompt (when no flag)
After backend selection, if the user selects Firebase, Supabase, or Medplum:
```
? Will this app handle Protected Health Information (PHI)? (Y/n)
```

If "local" backend is selected and HIPAA is requested, warn:
```
⚠️  Local-only backend stores data on-device without cloud sync.
    On-device data is encrypted by iOS (Data Protection). HIPAA mode will
    add audit logging and consent tracking, but a cloud backend is
    recommended for full HIPAA compliance.
```

### Type Changes

```typescript
// types.ts
export interface ProjectOptions {
  // ... existing fields
  hipaaMode: boolean;  // NEW
}
```

## What HIPAA Mode Generates

### 1. Encryption at Rest

**Firebase:**
- Firestore encrypts at rest by default (Google-managed keys) ✅
- Add note in checklist about Customer-Managed Encryption Keys (CMEK) for extra control
- Generate Storage security rules that enforce authenticated access only

**Supabase:**
- Enable `pgsodium` extension for column-level encryption on PHI columns
- Generate migration with encrypted columns for user health data
- Add `vault` setup for secure key management

**Medplum:**
- Medplum handles encryption at rest natively ✅
- Document in checklist

**Local:**
- iOS Data Protection encrypts on-device storage ✅
- Add `expo-secure-store` for sensitive tokens/keys
- Generate SecureStorage wrapper utility

### 2. Encryption in Transit

**All backends:**
- Verify/enforce HTTPS-only API endpoints
- Generate `app.config.js` with `expo.ios.infoPlist.NSAppTransportSecurity` set to strict (no HTTP exceptions)
- Add certificate pinning config (optional, documented)

### 3. Access Control

**Firebase:**
- Enhanced Firestore rules: per-user isolation + deny-all default (already have basic version)
- Add role-based access rules template (patient, provider, admin)
- Storage rules: authenticated + per-user paths only

**Supabase:**
- Generate Row Level Security (RLS) policies for all PHI tables
- Enable RLS by default on all tables
- Add role-based policies (patient can read own, provider can read assigned)

**Medplum:**
- Generate SMART on FHIR scopes configuration
- AccessPolicy resources for role separation

**All backends:**
- Generate auth middleware that enforces authentication on all routes
- Session timeout configuration (auto-logout after 15 min inactivity)

### 4. Audit Logging

**New feature: `packages/audit`**

Generate an audit logging package that tracks:
- All PHI access (read/write)
- Authentication events (login, logout, failed attempts)
- Data export events
- Consent changes
- Share/access grant events

```typescript
// packages/audit/src/audit-service.ts
export interface AuditEvent {
  timestamp: string;
  userId: string;
  action: 'read' | 'write' | 'delete' | 'export' | 'share' | 'login' | 'logout' | 'login_failed';
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

export interface AuditService {
  log(event: AuditEvent): Promise<void>;
  query(filters: AuditQueryFilters): Promise<AuditEvent[]>;
}
```

**Firebase implementation:** Write to `audit_log` collection (admin-only read access via rules)
**Supabase implementation:** `audit_log` table with RLS (admin-only read)
**Medplum implementation:** AuditEvent FHIR resources
**Local implementation:** SQLite audit table (on-device)

### 5. Session Security

- Auto-logout after 15 minutes of inactivity (configurable)
- Biometric/PIN re-authentication for sensitive screens
- Secure token storage via `expo-secure-store`

```typescript
// packages/audit/src/session-monitor.tsx
export function SessionMonitor({ 
  timeoutMinutes = 15,
  onTimeout: () => void 
}): JSX.Element
```

### 6. Data Handling

- **Minimum Necessary principle:** Generate typed data models that separate PHI from non-PHI
- **Secure deletion:** Soft-delete with audit trail, hard-delete after retention period
- **No PHI in logs:** Generate a `sanitizeForLog()` utility that strips PHI fields

```typescript
// packages/audit/src/sanitize.ts
export function sanitizeForLog<T extends Record<string, unknown>>(
  data: T, 
  phiFields: (keyof T)[]
): Partial<T>
```

### 7. Compliance Checklist (Generated)

Generate `HIPAA_CHECKLIST.md` in the project root:

```markdown
# HIPAA Compliance Checklist — [App Name]

Generated by SpeziVibe CLI on [date]
Backend: [Firebase/Supabase/Medplum/Local]

## ✅ Automatically Configured
- [x] Encryption at rest ([backend-specific details])
- [x] Encryption in transit (HTTPS-only, strict ATS)
- [x] Per-user data isolation ([backend-specific details])
- [x] Audit logging (all PHI access tracked)
- [x] Session timeout (15 min inactivity)
- [x] Secure token storage (expo-secure-store)
- [x] PHI sanitization in logs

## 🔧 Requires Your Action
- [ ] Sign BAA with [Firebase/Supabase/Medplum] (REQUIRED before production)
- [ ] Enable MFA on [backend] admin console
- [ ] Configure data retention policy (default: 7 years)
- [ ] Complete staff training documentation
- [ ] Establish breach notification procedures (72-hour rule)
- [ ] Designate a HIPAA Security Officer
- [ ] Conduct initial risk assessment

## 📋 For Research Apps (IRB)
- [ ] Submit IRB protocol
- [ ] Prepare informed consent (template in /docs/consent-template.md)
- [ ] Document data de-identification procedures
- [ ] Establish participant withdrawal process

## 🔗 Resources
- [Firebase BAA](https://cloud.google.com/terms/hipaa-baa)
- [Supabase BAA](https://supabase.com/docs/guides/platform/hipaa)
- [HHS HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
```

### 8. BAA Reminder (Build-time)

When building with HIPAA mode for production:
```
⚠️  HIPAA REMINDER: Before deploying to production with PHI, ensure you have
    a signed Business Associate Agreement (BAA) with your backend provider.

    Firebase: https://cloud.google.com/terms/hipaa-baa
    Supabase: https://supabase.com/docs/guides/platform/hipaa

    Without a BAA, you are NOT HIPAA-compliant regardless of technical safeguards.
```

## File Structure

New/modified files:
```
cli/src/types.ts          — Add hipaaMode to ProjectOptions
cli/src/prompts.ts        — Add HIPAA prompt after backend selection
cli/src/generator.ts      — Apply HIPAA transforms when enabled
cli/src/config.ts         — Add HIPAA feature config

features/hipaa/           — NEW feature directory
  manifest.json           — Feature manifest (category: null, auto-included via flag)
  lib/                    — Runtime utilities
    audit-service.ts
    session-monitor.tsx
    sanitize.ts
    secure-storage.ts
  HIPAA_CHECKLIST.md      — Template (with {{backend}} variables)

packages/audit/           — NEW package
  src/
    index.ts
    types.ts
    audit-service.ts      — Abstract audit interface
    session-monitor.tsx   — Inactivity timeout component
    sanitize.ts           — PHI log sanitization
    backends/
      firebase.ts         — Firestore audit implementation
      supabase.ts         — Supabase audit implementation
      medplum.ts          — Medplum FHIR AuditEvent implementation
      local.ts            — SQLite audit implementation
  package.json

# Backend-specific additions when HIPAA is on:
features/firebase/
  hipaa/
    firestore-hipaa.rules — Enhanced rules with role-based access + audit
    storage-hipaa.rules   — Strict storage rules

features/supabase/
  hipaa/
    migrations/
      001_enable_rls.sql
      002_audit_log.sql
      003_encrypted_columns.sql

features/medplum/
  hipaa/
    access-policies.json  — SMART on FHIR access policies
```

## Test Plan

### Unit Tests (cli/src/__tests__/)
1. `hipaa-flag.test.ts` — CLI parses `--hipaa` flag correctly
2. `hipaa-prompts.test.ts` — PHI prompt appears after backend selection
3. `hipaa-generator.test.ts` — HIPAA features are applied when enabled
4. `hipaa-checklist.test.ts` — Checklist is generated with correct backend info

### Integration Tests
5. Generate Firebase + HIPAA → verify enhanced rules, audit package, checklist
6. Generate Supabase + HIPAA → verify RLS migrations, audit table
7. Generate Local + HIPAA → verify secure storage, on-device audit
8. Generate without HIPAA → verify no audit package, no checklist

### Snapshot Tests
9. Update existing snapshots to include hipaaMode: false
10. Add HIPAA-enabled snapshots for each backend

## Implementation Order

1. Types + config changes (hipaaMode in ProjectOptions)
2. Prompt integration (PHI question after backend selection)
3. Audit package (core types + interfaces)
4. Backend-specific audit implementations
5. Session monitor component
6. Sanitize utility
7. Firebase HIPAA rules + storage rules
8. Supabase RLS + migrations
9. Medplum access policies
10. HIPAA checklist template generation
11. Generator integration (apply HIPAA feature when flag is set)
12. Tests
13. Documentation (README update, --hipaa flag docs)

## Non-Goals (v1)

- Automated penetration testing
- HITRUST certification tooling
- Automated BAA signing
- FDA SaMD classification (separate concern)
- GDPR compliance (future: `--gdpr` flag)
