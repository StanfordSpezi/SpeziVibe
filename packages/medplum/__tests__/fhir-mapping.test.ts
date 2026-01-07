/**
 * Tests for FHIR Resource Mapping Utilities
 */

import {
  taskToFhirTask,
  fhirTaskToTask,
  patientToUser,
  userToPatient,
  outcomeToObservation,
  observationToOutcome,
  consentDataToFhirConsent,
  fhirConsentToConsentData,
  generateFhirId,
  type ConsentData,
} from '../src/utils/fhir-mapping';
import type { Task } from '../src/types';
import type { User } from '@spezivibe/account';
import type { Task as FhirTask, Patient, Observation, Consent } from '@medplum/fhirtypes';

describe('FHIR Mapping', () => {
  describe('Task <-> FHIR Task', () => {
    const sampleTask: Task = {
      id: 'task-123',
      title: 'Morning Check-in',
      instructions: 'Complete your daily wellness check',
      category: 'questionnaire',
      schedule: {
        startDate: new Date('2024-01-01T00:00:00Z'),
        endDate: new Date('2024-12-31T23:59:59Z'),
        recurrence: {
          type: 'daily',
          hour: 9,
          minute: 30,
        },
      },
      completionPolicy: { type: 'anytime' },
      questionnaireId: 'wellness-checkin',
      createdAt: new Date('2024-01-01T00:00:00Z'),
    };

    describe('taskToFhirTask', () => {
      it('should map basic task properties', () => {
        const fhirTask = taskToFhirTask(sampleTask, 'patient-456');

        expect(fhirTask.resourceType).toBe('Task');
        expect(fhirTask.status).toBe('requested');
        // 'order' is used for tasks that should be executed (FHIR R4 compliant)
        expect(fhirTask.intent).toBe('order');
        expect(fhirTask.description).toBe('Morning Check-in');
        expect(fhirTask.note?.[0]?.text).toBe('Complete your daily wellness check');
        expect(fhirTask.for?.reference).toBe('Patient/patient-456');
      });

      it('should store original ID in identifier', () => {
        const fhirTask = taskToFhirTask(sampleTask, 'patient-456');

        expect(fhirTask.identifier).toHaveLength(1);
        expect(fhirTask.identifier?.[0]?.value).toBe('task-123');
      });

      it('should map category to Task.code', () => {
        const fhirTask = taskToFhirTask(sampleTask, 'patient-456');

        expect(fhirTask.code?.coding?.[0]?.code).toBe('questionnaire');
        expect(fhirTask.code?.coding?.[0]?.system).toBe('http://spezivibe.com/fhir/CodeSystem/task-type');
      });

      it('should map questionnaireId to Task.focus', () => {
        const fhirTask = taskToFhirTask(sampleTask, 'patient-456');

        expect(fhirTask.focus?.reference).toBe('Questionnaire/wellness-checkin');
      });

      it('should not set focus when no questionnaireId', () => {
        const taskWithoutQuestionnaire = { ...sampleTask, questionnaireId: undefined };
        const fhirTask = taskToFhirTask(taskWithoutQuestionnaire, 'patient-456');

        expect(fhirTask.focus).toBeUndefined();
      });

      it('should map createdAt to authoredOn', () => {
        const fhirTask = taskToFhirTask(sampleTask, 'patient-456');

        expect(fhirTask.authoredOn).toBe('2024-01-01T00:00:00.000Z');
      });

      it('should include schedule in Task.input as Timing', () => {
        const fhirTask = taskToFhirTask(sampleTask, 'patient-456');

        expect(fhirTask.input).toHaveLength(1);
        expect(fhirTask.input?.[0]?.type?.coding?.[0]?.code).toBe('schedule');
        expect(fhirTask.input?.[0]?.valueTiming).toBeDefined();
      });
    });

    describe('fhirTaskToTask', () => {
      it('should round-trip a task correctly', () => {
        const fhirTask = taskToFhirTask(sampleTask, 'patient-456');
        const roundTripped = fhirTaskToTask(fhirTask);

        expect(roundTripped.id).toBe(sampleTask.id);
        expect(roundTripped.title).toBe(sampleTask.title);
        expect(roundTripped.instructions).toBe(sampleTask.instructions);
        expect(roundTripped.category).toBe(sampleTask.category);
        expect(roundTripped.questionnaireId).toBe(sampleTask.questionnaireId);
        expect(roundTripped.completionPolicy.type).toBe('anytime');
      });

      it('should extract ID from identifier', () => {
        const fhirTask: FhirTask = {
          resourceType: 'Task',
          status: 'requested',
          intent: 'plan',
          identifier: [{ value: 'my-task-id' }],
        };

        const task = fhirTaskToTask(fhirTask);
        expect(task.id).toBe('my-task-id');
      });

      it('should fall back to fhirTask.id if no identifier', () => {
        const fhirTask: FhirTask = {
          resourceType: 'Task',
          id: 'fhir-id-123',
          status: 'requested',
          intent: 'plan',
        };

        const task = fhirTaskToTask(fhirTask);
        expect(task.id).toBe('fhir-id-123');
      });

      it('should extract questionnaireId from focus reference', () => {
        const fhirTask: FhirTask = {
          resourceType: 'Task',
          status: 'requested',
          intent: 'plan',
          focus: { reference: 'Questionnaire/phq-9' },
        };

        const task = fhirTaskToTask(fhirTask);
        expect(task.questionnaireId).toBe('phq-9');
      });

      it('should default to task category if code not found', () => {
        const fhirTask: FhirTask = {
          resourceType: 'Task',
          status: 'requested',
          intent: 'plan',
        };

        const task = fhirTaskToTask(fhirTask);
        expect(task.category).toBe('task');
      });
    });

    describe('Schedule <-> Timing conversions', () => {
      it('should correctly map daily schedule', () => {
        const dailyTask: Task = {
          ...sampleTask,
          schedule: {
            startDate: new Date('2024-01-01T00:00:00Z'),
            recurrence: { type: 'daily', hour: 14, minute: 30 },
          },
        };

        const fhirTask = taskToFhirTask(dailyTask, 'patient-456');
        const timing = fhirTask.input?.[0]?.valueTiming;

        expect(timing?.repeat?.frequency).toBe(1);
        expect(timing?.repeat?.period).toBe(1);
        expect(timing?.repeat?.periodUnit).toBe('d');
        expect(timing?.repeat?.timeOfDay).toContain('14:30:00');
      });

      it('should correctly map weekly schedule', () => {
        const weeklyTask: Task = {
          ...sampleTask,
          schedule: {
            startDate: new Date('2024-01-01T00:00:00Z'),
            recurrence: { type: 'weekly', weekday: 1, hour: 10, minute: 0 }, // Monday
          },
        };

        const fhirTask = taskToFhirTask(weeklyTask, 'patient-456');
        const timing = fhirTask.input?.[0]?.valueTiming;

        expect(timing?.repeat?.periodUnit).toBe('wk');
        expect(timing?.repeat?.dayOfWeek).toContain('mon');
        expect(timing?.repeat?.timeOfDay).toContain('10:00:00');
      });

      it('should correctly map monthly schedule', () => {
        const monthlyTask: Task = {
          ...sampleTask,
          schedule: {
            startDate: new Date('2024-01-15T00:00:00Z'),
            recurrence: { type: 'monthly', day: 15, hour: 9, minute: 0 },
          },
        };

        const fhirTask = taskToFhirTask(monthlyTask, 'patient-456');
        const timing = fhirTask.input?.[0]?.valueTiming;

        expect(timing?.repeat?.periodUnit).toBe('mo');
        expect(timing?.repeat?.timeOfDay).toContain('09:00:00');
      });

      it('should correctly map one-time schedule', () => {
        const oneTimeTask: Task = {
          ...sampleTask,
          schedule: {
            startDate: new Date('2024-06-15T14:00:00Z'),
            recurrence: { type: 'once', date: new Date('2024-06-15T14:00:00Z') },
          },
        };

        const fhirTask = taskToFhirTask(oneTimeTask, 'patient-456');
        const timing = fhirTask.input?.[0]?.valueTiming;

        expect(timing?.event).toHaveLength(1);
        expect(timing?.event?.[0]).toBe('2024-06-15T14:00:00.000Z');
        expect(timing?.repeat).toBeUndefined();
      });

      it('should round-trip daily schedule correctly', () => {
        const dailyTask: Task = {
          ...sampleTask,
          schedule: {
            startDate: new Date('2024-01-01T00:00:00Z'),
            recurrence: { type: 'daily', hour: 8, minute: 15 },
          },
        };

        const fhirTask = taskToFhirTask(dailyTask, 'patient-456');
        const roundTripped = fhirTaskToTask(fhirTask);

        expect(roundTripped.schedule.recurrence.type).toBe('daily');
        if (roundTripped.schedule.recurrence.type === 'daily') {
          expect(roundTripped.schedule.recurrence.hour).toBe(8);
          expect(roundTripped.schedule.recurrence.minute).toBe(15);
        }
      });

      it('should round-trip weekly schedule correctly', () => {
        const weeklyTask: Task = {
          ...sampleTask,
          schedule: {
            startDate: new Date('2024-01-01T00:00:00Z'),
            recurrence: { type: 'weekly', weekday: 3, hour: 16, minute: 45 }, // Wednesday
          },
        };

        const fhirTask = taskToFhirTask(weeklyTask, 'patient-456');
        const roundTripped = fhirTaskToTask(fhirTask);

        expect(roundTripped.schedule.recurrence.type).toBe('weekly');
        if (roundTripped.schedule.recurrence.type === 'weekly') {
          expect(roundTripped.schedule.recurrence.weekday).toBe(3);
          expect(roundTripped.schedule.recurrence.hour).toBe(16);
          expect(roundTripped.schedule.recurrence.minute).toBe(45);
        }
      });

      it('should round-trip one-time schedule correctly', () => {
        const eventDate = new Date('2024-06-15T14:00:00Z');
        const oneTimeTask: Task = {
          ...sampleTask,
          schedule: {
            startDate: eventDate,
            recurrence: { type: 'once', date: eventDate },
          },
        };

        const fhirTask = taskToFhirTask(oneTimeTask, 'patient-456');
        const roundTripped = fhirTaskToTask(fhirTask);

        expect(roundTripped.schedule.recurrence.type).toBe('once');
        if (roundTripped.schedule.recurrence.type === 'once') {
          expect(roundTripped.schedule.recurrence.date.toISOString()).toBe(eventDate.toISOString());
        }
      });
    });

    describe('Completion Policy <-> Restriction', () => {
      it('should not set restriction for anytime policy', () => {
        const anytimeTask: Task = {
          ...sampleTask,
          completionPolicy: { type: 'anytime' },
        };

        const fhirTask = taskToFhirTask(anytimeTask, 'patient-456');
        expect(fhirTask.restriction).toBeUndefined();
      });

      it('should set restriction with extension for window policy', () => {
        const windowTask: Task = {
          ...sampleTask,
          completionPolicy: { type: 'window', start: -30, end: 120 },
        };

        const fhirTask = taskToFhirTask(windowTask, 'patient-456');

        expect(fhirTask.restriction).toBeDefined();
        expect(fhirTask.restriction?.repetitions).toBe(1);
        expect(fhirTask.restriction?.extension).toBeDefined();
      });

      it('should round-trip window policy correctly', () => {
        const windowTask: Task = {
          ...sampleTask,
          completionPolicy: { type: 'window', start: -30, end: 120 },
        };

        const fhirTask = taskToFhirTask(windowTask, 'patient-456');
        const roundTripped = fhirTaskToTask(fhirTask);

        expect(roundTripped.completionPolicy.type).toBe('window');
        if (roundTripped.completionPolicy.type === 'window') {
          expect(roundTripped.completionPolicy.start).toBe(-30);
          expect(roundTripped.completionPolicy.end).toBe(120);
        }
      });

      it('should default to anytime when no restriction', () => {
        const fhirTask: FhirTask = {
          resourceType: 'Task',
          status: 'requested',
          intent: 'plan',
        };

        const task = fhirTaskToTask(fhirTask);
        expect(task.completionPolicy.type).toBe('anytime');
      });
    });

    describe('All task categories', () => {
      const categories = ['questionnaire', 'task', 'reminder', 'measurement'] as const;

      categories.forEach((category) => {
        it(`should correctly map ${category} category`, () => {
          const task: Task = { ...sampleTask, category };
          const fhirTask = taskToFhirTask(task, 'patient-456');
          const roundTripped = fhirTaskToTask(fhirTask);

          expect(roundTripped.category).toBe(category);
        });
      });
    });
  });

  describe('Patient <-> User', () => {
    const sampleUser: User = {
      uid: 'user-123',
      email: 'test@example.com',
      name: {
        givenName: 'John',
        familyName: 'Doe',
        middleName: 'Michael',
        namePrefix: 'Dr.',
        nameSuffix: 'Jr.',
      },
      dateOfBirth: new Date('1990-05-15'),
      sex: 'male',
      phoneNumber: '+1234567890',
      profileImageUrl: 'https://example.com/photo.jpg',
    };

    describe('userToPatient', () => {
      it('should map basic user properties', () => {
        const patient = userToPatient(sampleUser);

        expect(patient.resourceType).toBe('Patient');
        expect(patient.id).toBe('user-123');
        expect(patient.gender).toBe('male');
        expect(patient.birthDate).toBe('1990-05-15');
      });

      it('should map name correctly', () => {
        const patient = userToPatient(sampleUser);

        expect(patient.name?.[0]?.family).toBe('Doe');
        expect(patient.name?.[0]?.given).toContain('John');
        expect(patient.name?.[0]?.given).toContain('Michael');
        expect(patient.name?.[0]?.prefix).toContain('Dr.');
        expect(patient.name?.[0]?.suffix).toContain('Jr.');
      });

      it('should map telecom (email and phone)', () => {
        const patient = userToPatient(sampleUser);

        const email = patient.telecom?.find((t) => t.system === 'email');
        const phone = patient.telecom?.find((t) => t.system === 'phone');

        expect(email?.value).toBe('test@example.com');
        expect(phone?.value).toBe('+1234567890');
      });

      it('should map photo URL', () => {
        const patient = userToPatient(sampleUser);

        expect(patient.photo?.[0]?.url).toBe('https://example.com/photo.jpg');
      });

      it('should map sex values correctly', () => {
        const sexMappings: Array<{ input: User['sex']; expected: Patient['gender'] }> = [
          { input: 'male', expected: 'male' },
          { input: 'female', expected: 'female' },
          { input: 'other', expected: 'other' },
          { input: 'prefer-not-to-state', expected: 'unknown' },
        ];

        sexMappings.forEach(({ input, expected }) => {
          const user = { ...sampleUser, sex: input };
          const patient = userToPatient(user);
          expect(patient.gender).toBe(expected);
        });
      });
    });

    describe('patientToUser', () => {
      it('should round-trip user correctly', () => {
        const patient = userToPatient(sampleUser);
        const roundTripped = patientToUser(patient);

        expect(roundTripped.uid).toBe(sampleUser.uid);
        expect(roundTripped.email).toBe(sampleUser.email);
        expect(roundTripped.name?.givenName).toBe(sampleUser.name?.givenName);
        expect(roundTripped.name?.familyName).toBe(sampleUser.name?.familyName);
        expect(roundTripped.sex).toBe(sampleUser.sex);
        expect(roundTripped.phoneNumber).toBe(sampleUser.phoneNumber);
        expect(roundTripped.profileImageUrl).toBe(sampleUser.profileImageUrl);
      });

      it('should handle patient without name', () => {
        const patient: Patient = {
          resourceType: 'Patient',
          id: 'patient-123',
        };

        const user = patientToUser(patient);
        expect(user.uid).toBe('patient-123');
        expect(user.name).toBeUndefined();
      });

      it('should handle patient without telecom', () => {
        const patient: Patient = {
          resourceType: 'Patient',
          id: 'patient-123',
        };

        const user = patientToUser(patient);
        expect(user.email).toBeNull();
        expect(user.phoneNumber).toBeUndefined();
      });

      it('should map FHIR gender to sex correctly', () => {
        const genderMappings: Array<{ input: Patient['gender']; expected: string }> = [
          { input: 'male', expected: 'male' },
          { input: 'female', expected: 'female' },
          { input: 'other', expected: 'other' },
          { input: 'unknown', expected: 'prefer-not-to-state' },
        ];

        genderMappings.forEach(({ input, expected }) => {
          const patient: Patient = {
            resourceType: 'Patient',
            id: 'test',
            gender: input,
          };
          const user = patientToUser(patient);
          expect(user.sex).toBe(expected);
        });
      });
    });
  });

  describe('Outcome <-> Observation', () => {
    const sampleOutcome = {
      id: 'outcome-123',
      completedAt: new Date('2024-01-15T10:30:00Z'),
      data: { score: 85, notes: 'Feeling good' },
    };

    describe('outcomeToObservation', () => {
      it('should map basic outcome properties', () => {
        const observation = outcomeToObservation(sampleOutcome, 'patient-456');

        expect(observation.resourceType).toBe('Observation');
        // Original ID is stored in identifier, not id (Medplum assigns FHIR id)
        expect(observation.identifier?.[0]?.value).toBe('outcome-123');
        expect(observation.status).toBe('final');
        expect(observation.subject?.reference).toBe('Patient/patient-456');
        expect(observation.effectiveDateTime).toBe('2024-01-15T10:30:00.000Z');
      });

      it('should include task completion code', () => {
        const observation = outcomeToObservation(sampleOutcome, 'patient-456');

        expect(observation.code?.coding?.[0]?.code).toBe('task-completion');
        expect(observation.code?.coding?.[0]?.system).toBe('http://spezivibe.com/fhir/code/outcome');
      });

      it('should store data as JSON in valueString', () => {
        const observation = outcomeToObservation(sampleOutcome, 'patient-456');

        expect(observation.valueString).toBe(JSON.stringify(sampleOutcome.data));
      });

      it('should include task reference in focus when provided', () => {
        const observation = outcomeToObservation(sampleOutcome, 'patient-456', 'task-789');

        expect(observation.focus?.[0]?.reference).toBe('Task/task-789');
      });

      it('should not include focus when no taskId provided', () => {
        const observation = outcomeToObservation(sampleOutcome, 'patient-456');

        expect(observation.focus).toBeUndefined();
      });
    });

    describe('observationToOutcome', () => {
      it('should round-trip outcome correctly', () => {
        const observation = outcomeToObservation(sampleOutcome, 'patient-456');
        const roundTripped = observationToOutcome(observation);

        expect(roundTripped.id).toBe(sampleOutcome.id);
        expect(roundTripped.completedAt.toISOString()).toBe(sampleOutcome.completedAt.toISOString());
        expect(roundTripped.data).toEqual(sampleOutcome.data);
      });

      it('should handle observation without data', () => {
        const outcomeNoData = { ...sampleOutcome, data: undefined };
        const observation = outcomeToObservation(outcomeNoData, 'patient-456');
        const roundTripped = observationToOutcome(observation);

        expect(roundTripped.data).toBeUndefined();
      });
    });
  });

  describe('Consent <-> ConsentData', () => {
    const sampleConsent: ConsentData = {
      givenName: 'John',
      familyName: 'Doe',
      consentedAt: '2024-01-15T10:30:00.000Z',
      accepted: true,
    };

    describe('consentDataToFhirConsent', () => {
      it('should map basic consent properties', () => {
        const fhirConsent = consentDataToFhirConsent(sampleConsent, 'patient-456');

        expect(fhirConsent.resourceType).toBe('Consent');
        expect(fhirConsent.status).toBe('active');
        expect(fhirConsent.patient?.reference).toBe('Patient/patient-456');
        expect(fhirConsent.dateTime).toBe('2024-01-15T10:30:00.000Z');
      });

      it('should set status to rejected when not accepted', () => {
        const rejectedConsent = { ...sampleConsent, accepted: false };
        const fhirConsent = consentDataToFhirConsent(rejectedConsent, 'patient-456');

        expect(fhirConsent.status).toBe('rejected');
      });

      it('should include research scope', () => {
        const fhirConsent = consentDataToFhirConsent(sampleConsent, 'patient-456');

        expect(fhirConsent.scope?.coding?.[0]?.code).toBe('research');
      });

      it('should include consent document category', () => {
        const fhirConsent = consentDataToFhirConsent(sampleConsent, 'patient-456');

        expect(fhirConsent.category?.[0]?.coding?.[0]?.code).toBe('59284-0');
      });

      it('should include performer with display name', () => {
        const fhirConsent = consentDataToFhirConsent(sampleConsent, 'patient-456');

        expect(fhirConsent.performer?.[0]?.reference).toBe('Patient/patient-456');
        expect(fhirConsent.performer?.[0]?.display).toBe('John Doe');
      });
    });

    describe('fhirConsentToConsentData', () => {
      it('should round-trip consent correctly', () => {
        const fhirConsent = consentDataToFhirConsent(sampleConsent, 'patient-456');
        const roundTripped = fhirConsentToConsentData(fhirConsent);

        expect(roundTripped.givenName).toBe(sampleConsent.givenName);
        expect(roundTripped.familyName).toBe(sampleConsent.familyName);
        expect(roundTripped.consentedAt).toBe(sampleConsent.consentedAt);
        expect(roundTripped.accepted).toBe(sampleConsent.accepted);
      });

      it('should handle rejected consent', () => {
        const rejectedConsent = { ...sampleConsent, accepted: false };
        const fhirConsent = consentDataToFhirConsent(rejectedConsent, 'patient-456');
        const roundTripped = fhirConsentToConsentData(fhirConsent);

        expect(roundTripped.accepted).toBe(false);
      });

      it('should handle consent without performer', () => {
        const fhirConsent: Consent = {
          resourceType: 'Consent',
          status: 'active',
          scope: { coding: [{ code: 'research' }] },
          category: [{ coding: [{ code: '59284-0' }] }],
        };

        const consentData = fhirConsentToConsentData(fhirConsent);

        expect(consentData.givenName).toBe('');
        expect(consentData.familyName).toBe('');
      });

      it('should handle consent without dateTime', () => {
        const fhirConsent: Consent = {
          resourceType: 'Consent',
          status: 'active',
          scope: { coding: [{ code: 'research' }] },
          category: [{ coding: [{ code: '59284-0' }] }],
        };

        const consentData = fhirConsentToConsentData(fhirConsent);

        // Should default to current time (we just check it's a valid ISO string)
        expect(consentData.consentedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      });

      it('should extract name parts from performer display', () => {
        const fhirConsent: Consent = {
          resourceType: 'Consent',
          status: 'active',
          scope: { coding: [{ code: 'research' }] },
          category: [{ coding: [{ code: '59284-0' }] }],
          performer: [{ display: 'Jane Mary Smith' }],
        };

        const consentData = fhirConsentToConsentData(fhirConsent);

        expect(consentData.givenName).toBe('Jane');
        expect(consentData.familyName).toBe('Mary Smith');
      });
    });
  });

  describe('generateFhirId', () => {
    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateFhirId());
      }
      expect(ids.size).toBe(100);
    });

    it('should generate IDs with expected format', () => {
      const id = generateFhirId();
      // Format: timestamp-randomstring
      expect(id).toMatch(/^\d+-[a-z0-9]+$/);
    });
  });
});
