# Study Planner

Plan digital health studies and research protocols.

## When to Use

Invoke `/study-planner` when you need to:
- Design a health study or research protocol
- Plan data collection requirements
- Define enrollment criteria and consent flows
- Structure questionnaires and assessments

## Study Planning Framework

### 1. Study Overview

Define the core elements:

```markdown
## Study: [Name]

**Objective:** What health outcome are you measuring?
**Population:** Who are the participants?
**Duration:** How long will the study run?
**Type:** Observational / Interventional / Survey
```

### 2. Enrollment & Consent

```markdown
## Enrollment Criteria

**Inclusion:**
- Age range
- Health conditions
- Device requirements (iOS, HealthKit access)

**Exclusion:**
- Contraindications
- Conflicting medications
- Technical limitations

## Consent Requirements
- [ ] Plain language summary
- [ ] Data usage explanation
- [ ] Withdrawal process
- [ ] Contact information
```

### 3. Data Collection Plan

| Data Type | Source | Frequency | FHIR Resource |
|-----------|--------|-----------|---------------|
| Steps | HealthKit | Daily | Observation |
| Heart Rate | HealthKit | Continuous | Observation |
| Symptoms | Questionnaire | Weekly | QuestionnaireResponse |
| Medications | User Input | As needed | MedicationStatement |

### 4. Assessment Schedule

```markdown
## Timeline

**Baseline (Day 0)**
- Consent
- Demographics questionnaire
- Initial health assessment

**Daily**
- Symptom check-in (2 min)
- Passive HealthKit collection

**Weekly**
- Quality of life questionnaire
- Medication adherence check

**Monthly**
- Comprehensive health assessment
- Progress review

**End of Study**
- Final assessment
- Feedback survey
```

### 5. Outcome Measures

```markdown
## Primary Outcomes
1. [Measurable health metric]
2. [Questionnaire score change]

## Secondary Outcomes
1. [Engagement metrics]
2. [Adherence rates]
3. [User satisfaction]
```

## Task Configuration

Map study activities to app tasks:

```typescript
const studyTasks: Task[] = [
  {
    title: 'Daily Check-in',
    category: 'questionnaire',
    questionnaireId: 'daily-symptoms',
    schedule: {
      recurrence: { type: 'daily', hour: 9, minute: 0 }
    },
    completionPolicy: { type: 'window', start: -60, end: 180 }
  },
  {
    title: 'Weekly Assessment',
    category: 'questionnaire',
    questionnaireId: 'weekly-qol',
    schedule: {
      recurrence: { type: 'weekly', weekday: 1, hour: 10, minute: 0 }
    }
  }
];
```

## Questionnaire Design

Follow FHIR Questionnaire structure:

```typescript
const questionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'active',
  title: 'Daily Symptom Check',
  item: [
    {
      linkId: 'pain-level',
      text: 'Rate your pain level (0-10)',
      type: 'integer',
      extension: [{
        url: 'http://hl7.org/fhir/StructureDefinition/minValue',
        valueInteger: 0
      }, {
        url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
        valueInteger: 10
      }]
    },
    {
      linkId: 'symptoms',
      text: 'Select any symptoms you experienced',
      type: 'choice',
      repeats: true,
      answerOption: [
        { valueCoding: { code: 'fatigue', display: 'Fatigue' }},
        { valueCoding: { code: 'nausea', display: 'Nausea' }},
        { valueCoding: { code: 'headache', display: 'Headache' }}
      ]
    }
  ]
};
```

## Checklist

- [ ] Study objectives clearly defined
- [ ] Enrollment criteria specified
- [ ] Consent flow designed
- [ ] Data collection plan complete
- [ ] Assessment schedule created
- [ ] Outcome measures defined
- [ ] Tasks configured in app
- [ ] Questionnaires designed (FHIR-compliant)
- [ ] HealthKit permissions identified
- [ ] Data retention policy defined
