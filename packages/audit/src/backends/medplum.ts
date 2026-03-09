/**
 * Medplum FHIR AuditEvent implementation
 *
 * Maps audit events to FHIR AuditEvent resources.
 */

import type { AuditEvent, AuditQueryFilters, AuditService } from '../types';

/** Map SpeziVibe audit actions to FHIR AuditEvent action codes */
const ACTION_MAP: Record<string, string> = {
  read: 'R',
  write: 'C',
  delete: 'D',
  export: 'R',
  share: 'R',
  login: 'E',
  logout: 'E',
  login_failed: 'E',
};

export class MedplumAuditService implements AuditService {
  private client: any; // MedplumClient

  constructor(client: any) {
    this.client = client;
  }

  async log(event: AuditEvent): Promise<void> {
    const fhirAuditEvent = {
      resourceType: 'AuditEvent',
      type: {
        system: 'http://dicom.nema.org/resources/ontology/DCM',
        code: '110100',
        display: 'Application Activity',
      },
      action: ACTION_MAP[event.action] || 'E',
      recorded: event.timestamp,
      outcome: event.action === 'login_failed' ? '4' : '0',
      agent: [
        {
          who: { reference: `Patient/${event.userId}` },
          requestor: true,
        },
      ],
      entity: event.resourceId
        ? [
            {
              what: { reference: `${event.resource}/${event.resourceId}` },
              type: {
                system: 'http://terminology.hl7.org/CodeSystem/audit-entity-type',
                code: '2',
                display: 'System Object',
              },
            },
          ]
        : undefined,
    };

    await this.client.createResource(fhirAuditEvent);
  }

  async query(filters: AuditQueryFilters): Promise<AuditEvent[]> {
    const searchParams: Record<string, string> = {
      _sort: '-date',
    };

    if (filters.userId) {
      searchParams.agent = `Patient/${filters.userId}`;
    }
    if (filters.limit) {
      searchParams._count = String(filters.limit);
    }

    const bundle = await this.client.searchResources('AuditEvent', searchParams);

    return bundle.map((resource: any) => ({
      timestamp: resource.recorded,
      userId: resource.agent?.[0]?.who?.reference?.replace('Patient/', '') || '',
      action: 'read' as const,
      resource: resource.entity?.[0]?.what?.reference || '',
    }));
  }
}
