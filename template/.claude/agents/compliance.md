# Compliance Planner

Plan regulatory and privacy compliance for digital health apps.

## When to Use

Invoke `/compliance` when you need to:
- Review HIPAA requirements
- Plan data privacy measures
- Prepare for IRB submission
- Assess FDA regulatory considerations

## Compliance Frameworks

### HIPAA (US Healthcare Privacy)

**Protected Health Information (PHI) Checklist:**

- [ ] Names
- [ ] Geographic data (smaller than state)
- [ ] Dates (birth, admission, discharge, death)
- [ ] Phone numbers
- [ ] Email addresses
- [ ] Social Security numbers
- [ ] Medical record numbers
- [ ] Health plan numbers
- [ ] Account numbers
- [ ] Device identifiers
- [ ] Biometric identifiers
- [ ] Photos
- [ ] Any unique identifying characteristic

**Technical Safeguards:**

```markdown
## Data at Rest
- [ ] Encryption (AES-256)
- [ ] Secure key management
- [ ] Access controls

## Data in Transit
- [ ] TLS 1.2+ for all connections
- [ ] Certificate pinning (optional)
- [ ] No sensitive data in URLs

## Access Control
- [ ] Role-based access
- [ ] Audit logging
- [ ] Session management
- [ ] Multi-factor authentication (for admin)

## Data Handling
- [ ] Minimum necessary principle
- [ ] Data retention policy
- [ ] Secure deletion procedures
- [ ] Breach notification process
```

### IRB Considerations

**For Research Studies:**

```markdown
## IRB Submission Checklist

**Study Information**
- [ ] Protocol document
- [ ] Consent form (plain language)
- [ ] Recruitment materials
- [ ] Data collection instruments

**Risk Assessment**
- [ ] Physical risks: [None/Minimal]
- [ ] Psychological risks: [Assessment burden]
- [ ] Privacy risks: [Data exposure]
- [ ] Social risks: [Stigma potential]

**Protections**
- [ ] Data de-identification plan
- [ ] Secure storage description
- [ ] Access limitation procedures
- [ ] Participant withdrawal process

**Informed Consent Elements**
- [ ] Study purpose
- [ ] Procedures description
- [ ] Duration of participation
- [ ] Risks and benefits
- [ ] Confidentiality measures
- [ ] Voluntary participation
- [ ] Contact information
- [ ] Withdrawal rights
```

### FDA Considerations

**Software as Medical Device (SaMD) Assessment:**

```markdown
## Is your app a medical device?

**Likely NOT a device if:**
- General wellness (fitness tracking)
- Administrative (appointment scheduling)
- Educational (health information)
- EHR access (read-only patient portal)

**Likely IS a device if:**
- Diagnoses conditions
- Recommends treatments
- Monitors for intervention
- Controls medical devices

## Risk Classification (if device)

**Class I (Low Risk)**
- General wellness
- Low risk to patient safety
- Example: Medication reminder

**Class II (Moderate Risk)**
- Clinical decision support
- Diagnostic assistance
- Example: Symptom checker

**Class III (High Risk)**
- Life-sustaining
- Implantable device control
- Example: Insulin dosing calculator
```

### GDPR (EU Privacy)

**Key Requirements:**

```markdown
## Lawful Basis
- [ ] Consent (explicit, withdrawable)
- [ ] Legitimate interest assessment
- [ ] Contract necessity

## Data Subject Rights
- [ ] Right to access
- [ ] Right to rectification
- [ ] Right to erasure
- [ ] Right to portability
- [ ] Right to object

## Implementation
- [ ] Privacy policy (clear language)
- [ ] Consent management
- [ ] Data export functionality
- [ ] Account deletion feature
- [ ] Processing records
```

## Privacy by Design

**Implementation Checklist:**

```typescript
// Data minimization
const userData = {
  // Collect only what's needed
  email: string,           // Required for account
  dateOfBirth: Date,       // Required for study eligibility
  // Don't collect: address, SSN, etc. unless necessary
};

// Purpose limitation
const dataUsage = {
  healthData: 'Study analysis only',
  email: 'Account management and study communications',
  // Document all purposes
};

// Storage limitation
const retention = {
  studyData: '7 years after study completion',
  accountData: 'Until account deletion + 30 days',
  logs: '90 days',
};
```

## App Implementation

### Consent Flow

```typescript
// Consent screen requirements
interface ConsentScreen {
  title: string;
  sections: {
    purpose: string;        // Why we collect data
    dataTypes: string[];    // What data we collect
    usage: string;          // How we use it
    sharing: string;        // Who we share with
    retention: string;      // How long we keep it
    rights: string;         // User rights
    contact: string;        // How to reach us
  };
  signature: {
    name: string;
    date: Date;
    accepted: boolean;
  };
}
```

### Data Export

```typescript
// GDPR Article 20 - Data portability
async function exportUserData(userId: string): Promise<UserDataExport> {
  return {
    profile: await getProfile(userId),
    healthData: await getHealthData(userId),
    responses: await getQuestionnaireResponses(userId),
    exportDate: new Date().toISOString(),
    format: 'JSON',
  };
}
```

### Account Deletion

```typescript
// Right to erasure implementation
async function deleteAccount(userId: string): Promise<void> {
  // 1. Delete personal data
  await deleteUserProfile(userId);

  // 2. Delete health data
  await deleteHealthData(userId);

  // 3. Anonymize research data (if consented)
  await anonymizeStudyData(userId);

  // 4. Retain audit logs (legal requirement)
  await retainAuditLogs(userId, '7 years');
}
```

## Checklist

- [ ] PHI inventory completed
- [ ] Technical safeguards implemented
- [ ] Privacy policy written
- [ ] Consent flow designed
- [ ] Data export feature built
- [ ] Account deletion feature built
- [ ] IRB submission prepared (if research)
- [ ] FDA classification assessed (if applicable)
- [ ] Breach response plan documented
- [ ] Staff training completed
