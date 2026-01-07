import type {
  Patient,
  Task as FhirTask,
  Observation,
  Consent,
  HumanName,
  Identifier,
  Timing,
  TimingRepeat,
  Period,
  CodeableConcept,
  TaskInput,
  TaskRestriction,
} from '@medplum/fhirtypes';
import type { User, PersonName, Sex } from '@spezivibe/account';
import type { Task, Outcome, Schedule, RecurrenceRule, TaskCategory, AllowedCompletionPolicy } from '../types';

/**
 * Consent data stored when a user agrees to terms
 */
export interface ConsentData {
  /** User's first name */
  givenName: string;
  /** User's last name */
  familyName: string;
  /** ISO timestamp when consent was given */
  consentedAt: string;
  /** Whether the user accepted the terms */
  accepted: boolean;
}

/**
 * FHIR Resource Mapping Utilities
 *
 * Maps between SpeziVibe internal types and FHIR R4 resources for Medplum storage.
 * Uses FHIR-standard fields where possible:
 * - Task.code for category (instead of extension)
 * - Task.focus for questionnaire reference (instead of extension)
 * - Task.input with valueTiming for schedule (instead of extension)
 * - Task.restriction for completion policy (instead of extension)
 * - Task.identifier for original task ID
 */

// ============================================================================
// User <-> Patient Mapping
// ============================================================================

/**
 * Map a FHIR Patient resource to a SpeziVibe User
 */
export function patientToUser(patient: Patient): User {
  const name = patient.name?.[0];
  const personName: PersonName | undefined = name
    ? {
        givenName: name.given?.[0],
        familyName: name.family,
        middleName: name.given?.slice(1).join(' '),
        namePrefix: name.prefix?.[0],
        nameSuffix: name.suffix?.[0],
      }
    : undefined;

  // Extract email from telecom
  const email = patient.telecom?.find((t) => t.system === 'email')?.value ?? null;

  // Extract phone from telecom
  const phone = patient.telecom?.find((t) => t.system === 'phone')?.value;

  // Map FHIR gender to Sex enum
  let sex: Sex | string | undefined;
  if (patient.gender) {
    switch (patient.gender) {
      case 'male':
        sex = 'male';
        break;
      case 'female':
        sex = 'female';
        break;
      case 'other':
        sex = 'other';
        break;
      case 'unknown':
        sex = 'prefer-not-to-state';
        break;
      default:
        sex = patient.gender;
    }
  }

  return {
    uid: patient.id ?? '',
    email,
    name: personName,
    dateOfBirth: patient.birthDate ? new Date(patient.birthDate) : undefined,
    sex,
    phoneNumber: phone,
    profileImageUrl: patient.photo?.[0]?.url,
  };
}

/**
 * Map a SpeziVibe User to FHIR Patient resource
 */
export function userToPatient(user: User): Patient {
  const humanName: HumanName | undefined = user.name
    ? {
        family: user.name.familyName,
        given: [user.name.givenName, user.name.middleName].filter(Boolean) as string[],
        prefix: user.name.namePrefix ? [user.name.namePrefix] : undefined,
        suffix: user.name.nameSuffix ? [user.name.nameSuffix] : undefined,
      }
    : undefined;

  // Map Sex to FHIR gender
  let gender: Patient['gender'];
  if (user.sex) {
    switch (user.sex) {
      case 'male':
        gender = 'male';
        break;
      case 'female':
        gender = 'female';
        break;
      case 'other':
        gender = 'other';
        break;
      case 'prefer-not-to-state':
        gender = 'unknown';
        break;
      default:
        gender = 'other';
    }
  }

  return {
    resourceType: 'Patient',
    id: user.uid || undefined,
    name: humanName ? [humanName] : undefined,
    birthDate: user.dateOfBirth?.toISOString().split('T')[0],
    gender,
    telecom: [
      user.email ? { system: 'email', value: user.email } : undefined,
      user.phoneNumber ? { system: 'phone', value: user.phoneNumber } : undefined,
    ].filter(Boolean) as Patient['telecom'],
    photo: user.profileImageUrl ? [{ url: user.profileImageUrl }] : undefined,
  };
}

// ============================================================================
// Task <-> FHIR Task Mapping
// ============================================================================

/**
 * Code system for SpeziVibe task types
 */
const SPEZIVIBE_TASK_TYPE_SYSTEM = 'http://spezivibe.com/fhir/CodeSystem/task-type';

/**
 * Identifier systems for SpeziVibe resource IDs
 */
export const SPEZIVIBE_TASK_ID_SYSTEM = 'http://spezivibe.com/fhir/identifier/task-id';
export const SPEZIVIBE_OUTCOME_ID_SYSTEM = 'http://spezivibe.com/fhir/identifier/outcome-id';

/**
 * Code system for task input types
 */
const SPEZIVIBE_INPUT_TYPE_SYSTEM = 'http://spezivibe.com/fhir/CodeSystem/task-input-type';

/**
 * Map a SpeziVibe Task to FHIR Task resource
 *
 * Uses FHIR-standard fields:
 * - Task.code for category
 * - Task.focus for questionnaire reference
 * - Task.input[valueTiming] for schedule
 * - Task.restriction for completion policy window
 * - Task.identifier for original task ID
 */
export function taskToFhirTask(task: Task, patientId: string): FhirTask {
  const inputs: TaskInput[] = [
    // Schedule as Timing
    {
      type: {
        coding: [{
          system: SPEZIVIBE_INPUT_TYPE_SYSTEM,
          code: 'schedule',
          display: 'Task Schedule',
        }],
      },
      valueTiming: scheduleToTiming(task.schedule),
    },
  ];

  return {
    resourceType: 'Task',
    // Use identifier for original ID, let Medplum assign FHIR id
    identifier: [{ system: SPEZIVIBE_TASK_ID_SYSTEM, value: task.id }],
    status: 'requested',
    // 'order' is the appropriate intent for tasks that should be executed
    // per FHIR R4 spec: https://hl7.org/fhir/R4/valueset-task-intent.html
    intent: 'order',
    // Task category using standard code field
    code: {
      coding: [{
        system: SPEZIVIBE_TASK_TYPE_SYSTEM,
        code: task.category,
        display: categoryToDisplay(task.category),
      }],
    },
    description: task.title,
    note: task.instructions ? [{ text: task.instructions }] : undefined,
    for: { reference: `Patient/${patientId}` },
    // Questionnaire reference using standard focus field
    focus: task.questionnaireId
      ? { reference: `Questionnaire/${task.questionnaireId}` }
      : undefined,
    authoredOn: task.createdAt.toISOString(),
    // Completion policy using standard restriction field
    restriction: completionPolicyToRestriction(task.completionPolicy),
    input: inputs,
  };
}

/**
 * Map a FHIR Task resource to SpeziVibe Task
 */
export function fhirTaskToTask(fhirTask: FhirTask): Task {
  // Get original ID from identifier
  const originalId =
    fhirTask.identifier?.find((id) => id.system === SPEZIVIBE_TASK_ID_SYSTEM)?.value ??
    fhirTask.identifier?.find((id) => id.value)?.value ??
    fhirTask.id ??
    '';

  // Get category from code
  const category = (fhirTask.code?.coding?.find(
    (c) => c.system === SPEZIVIBE_TASK_TYPE_SYSTEM
  )?.code as TaskCategory) || 'task';

  // Get schedule from input with valueTiming
  const scheduleInput = fhirTask.input?.find(
    (input) => input.type?.coding?.some((c) => c.code === 'schedule') && input.valueTiming
  );
  const schedule = scheduleInput?.valueTiming
    ? timingToSchedule(scheduleInput.valueTiming)
    : { startDate: new Date(), recurrence: { type: 'daily' as const, hour: 9, minute: 0 } };

  // Get completion policy from restriction
  const completionPolicy = restrictionToCompletionPolicy(fhirTask.restriction);

  // Get questionnaire ID from focus
  const questionnaireId = fhirTask.focus?.reference?.startsWith('Questionnaire/')
    ? fhirTask.focus.reference.replace('Questionnaire/', '')
    : undefined;

  return {
    id: originalId,
    title: fhirTask.description ?? '',
    instructions: fhirTask.note?.[0]?.text ?? '',
    category,
    schedule,
    completionPolicy,
    questionnaireId,
    createdAt: fhirTask.authoredOn ? new Date(fhirTask.authoredOn) : new Date(),
  };
}

/**
 * Convert category to display name
 */
function categoryToDisplay(category: TaskCategory): string {
  switch (category) {
    case 'questionnaire':
      return 'Questionnaire';
    case 'task':
      return 'Task';
    case 'reminder':
      return 'Reminder';
    case 'measurement':
      return 'Measurement';
    default:
      return category;
  }
}

/**
 * Convert SpeziVibe Schedule to FHIR Timing
 */
function scheduleToTiming(schedule: Schedule): Timing {
  const repeat: TimingRepeat = {};

  // Set bounds for schedule start/end
  if (schedule.startDate || schedule.endDate) {
    repeat.boundsPeriod = {
      start: schedule.startDate.toISOString(),
      end: schedule.endDate?.toISOString(),
    };
  }

  const recurrence = schedule.recurrence;

  if (recurrence.type === 'once') {
    // One-time event - use event array instead of repeat
    return {
      event: [recurrence.date.toISOString()],
    };
  }

  // Format time as HH:MM:SS
  const timeOfDay = `${String(recurrence.hour).padStart(2, '0')}:${String(recurrence.minute).padStart(2, '0')}:00`;
  repeat.timeOfDay = [timeOfDay];

  switch (recurrence.type) {
    case 'daily':
      repeat.frequency = 1;
      repeat.period = 1;
      repeat.periodUnit = 'd';
      break;

    case 'weekly':
      repeat.frequency = 1;
      repeat.period = 1;
      repeat.periodUnit = 'wk';
      // Map weekday (0=Sunday) to FHIR dayOfWeek
      repeat.dayOfWeek = [weekdayToFhir(recurrence.weekday)];
      break;

    case 'monthly':
      repeat.frequency = 1;
      repeat.period = 1;
      repeat.periodUnit = 'mo';
      // FHIR doesn't have a standard field for day of month,
      // so we use an extension within the timing
      // For now, store it in the bounds start date
      break;
  }

  return { repeat };
}

/**
 * Convert FHIR Timing to SpeziVibe Schedule
 */
function timingToSchedule(timing: Timing): Schedule {
  // Handle one-time events
  if (timing.event && timing.event.length > 0) {
    return {
      startDate: new Date(timing.event[0]),
      recurrence: { type: 'once', date: new Date(timing.event[0]) },
    };
  }

  const repeat = timing.repeat;
  if (!repeat) {
    return {
      startDate: new Date(),
      recurrence: { type: 'daily', hour: 9, minute: 0 },
    };
  }

  // Parse time of day
  let hour = 9;
  let minute = 0;
  if (repeat.timeOfDay && repeat.timeOfDay.length > 0) {
    const [h, m] = repeat.timeOfDay[0].split(':').map(Number);
    hour = h || 9;
    minute = m || 0;
  }

  // Determine recurrence type from period unit
  let recurrence: RecurrenceRule;
  switch (repeat.periodUnit) {
    case 'wk':
      recurrence = {
        type: 'weekly',
        weekday: repeat.dayOfWeek?.[0] ? fhirToWeekday(repeat.dayOfWeek[0]) : 0,
        hour,
        minute,
      };
      break;

    case 'mo':
      recurrence = {
        type: 'monthly',
        day: repeat.boundsPeriod?.start
          ? new Date(repeat.boundsPeriod.start).getDate()
          : 1,
        hour,
        minute,
      };
      break;

    case 'd':
    default:
      recurrence = { type: 'daily', hour, minute };
      break;
  }

  return {
    startDate: repeat.boundsPeriod?.start
      ? new Date(repeat.boundsPeriod.start)
      : new Date(),
    endDate: repeat.boundsPeriod?.end
      ? new Date(repeat.boundsPeriod.end)
      : undefined,
    recurrence,
  };
}

/**
 * Convert weekday number (0=Sunday) to FHIR day of week code
 */
function weekdayToFhir(weekday: number): 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun' {
  const days: ('sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat')[] = [
    'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat',
  ];
  return days[weekday] || 'mon';
}

/**
 * Convert FHIR day of week code to weekday number (0=Sunday)
 */
function fhirToWeekday(day: string): number {
  const days: Record<string, number> = {
    sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
  };
  return days[day] ?? 0;
}

/**
 * Convert completion policy to FHIR Task restriction
 */
function completionPolicyToRestriction(policy: AllowedCompletionPolicy): TaskRestriction | undefined {
  if (policy.type === 'anytime') {
    // No restriction for anytime completion
    return undefined;
  }

  // For window-based policy, we encode start/end minutes in the period
  // The period represents the allowed completion window
  return {
    repetitions: 1,
    // We'll use an extension within restriction to store the window
    // Since FHIR restriction.period is absolute, not relative
    extension: [{
      url: 'http://spezivibe.com/fhir/StructureDefinition/completion-window',
      extension: [
        { url: 'start', valueInteger: policy.start },
        { url: 'end', valueInteger: policy.end },
      ],
    }],
  };
}

/**
 * Convert FHIR Task restriction to completion policy
 */
function restrictionToCompletionPolicy(restriction: TaskRestriction | undefined): AllowedCompletionPolicy {
  if (!restriction) {
    return { type: 'anytime' };
  }

  // Check for window extension
  const windowExt = restriction.extension?.find(
    (e) => e.url === 'http://spezivibe.com/fhir/StructureDefinition/completion-window'
  );

  if (windowExt?.extension) {
    const startExt = windowExt.extension.find((e) => e.url === 'start');
    const endExt = windowExt.extension.find((e) => e.url === 'end');

    if (startExt?.valueInteger !== undefined && endExt?.valueInteger !== undefined) {
      return {
        type: 'window',
        start: startExt.valueInteger,
        end: endExt.valueInteger,
      };
    }
  }

  return { type: 'anytime' };
}

// ============================================================================
// Outcome <-> Observation Mapping
// ============================================================================

/**
 * Map a SpeziVibe Outcome to FHIR Observation resource
 */
export function outcomeToObservation(outcome: Outcome, patientId: string, taskId?: string): Observation {
  return {
    resourceType: 'Observation',
    // Add identifier for searchability - critical for finding existing outcomes
    identifier: [{ system: SPEZIVIBE_OUTCOME_ID_SYSTEM, value: outcome.id }],
    status: 'final',
    code: {
      coding: [
        {
          system: 'http://spezivibe.com/fhir/code/outcome',
          code: 'task-completion',
          display: 'Task Completion Outcome',
        },
      ],
    },
    subject: { reference: `Patient/${patientId}` },
    effectiveDateTime: outcome.completedAt.toISOString(),
    focus: taskId
      ? [{ reference: `Task/${taskId}` }]
      : undefined,
    valueString: outcome.data ? JSON.stringify(outcome.data) : undefined,
  };
}

/**
 * Map a FHIR Observation resource to SpeziVibe Outcome
 */
export function observationToOutcome(observation: Observation): Outcome {
  // Prefer identifier for original ID, fall back to FHIR id
  const originalId =
    observation.identifier?.find((id) => id.system === SPEZIVIBE_OUTCOME_ID_SYSTEM)?.value ??
    observation.identifier?.find((id) => id.value)?.value ??
    observation.id ??
    '';

  return {
    id: originalId,
    completedAt: observation.effectiveDateTime
      ? new Date(observation.effectiveDateTime)
      : new Date(),
    data: observation.valueString ? JSON.parse(observation.valueString) : undefined,
  };
}

// ============================================================================
// Consent <-> FHIR Consent Mapping
// ============================================================================

/**
 * Code system for consent scope
 */
const CONSENT_SCOPE_SYSTEM = 'http://terminology.hl7.org/CodeSystem/consentscope';

/**
 * Code system for consent category
 */
const CONSENT_CATEGORY_SYSTEM = 'http://loinc.org';

/**
 * Map ConsentData to FHIR Consent resource
 */
export function consentDataToFhirConsent(consent: ConsentData, patientId: string): Consent {
  return {
    resourceType: 'Consent',
    status: consent.accepted ? 'active' : 'rejected',
    scope: {
      coding: [{
        system: CONSENT_SCOPE_SYSTEM,
        code: 'research',
        display: 'Research',
      }],
    },
    category: [{
      coding: [{
        system: CONSENT_CATEGORY_SYSTEM,
        code: '59284-0',
        display: 'Consent Document',
      }],
    }],
    patient: { reference: `Patient/${patientId}` },
    dateTime: consent.consentedAt,
    performer: [{
      reference: `Patient/${patientId}`,
      display: `${consent.givenName} ${consent.familyName}`,
    }],
    // policyRule is required by FHIR constraint ppc-1
    policyRule: {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'OPTIN',
        display: 'Opt-in',
      }],
    },
  };
}

/**
 * Map FHIR Consent resource to ConsentData
 */
export function fhirConsentToConsentData(fhirConsent: Consent): ConsentData {
  // Extract name from performer display
  const performerDisplay = fhirConsent.performer?.[0]?.display ?? '';
  const nameParts = performerDisplay.split(' ');
  const givenName = nameParts[0] ?? '';
  const familyName = nameParts.slice(1).join(' ') ?? '';

  return {
    givenName,
    familyName,
    consentedAt: fhirConsent.dateTime ?? new Date().toISOString(),
    accepted: fhirConsent.status === 'active',
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a unique identifier for FHIR resources
 */
export function generateFhirId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
