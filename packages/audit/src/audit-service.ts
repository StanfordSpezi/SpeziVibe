/**
 * Abstract audit service interface
 *
 * Backend-specific implementations should extend this base
 * to provide audit logging for their respective storage systems.
 */

import type { AuditEvent, AuditQueryFilters, AuditService } from './types';

/**
 * Create an audit event with defaults
 */
export function createAuditEvent(
  partial: Omit<AuditEvent, 'timestamp'> & { timestamp?: string }
): AuditEvent {
  return {
    timestamp: new Date().toISOString(),
    ...partial,
  };
}

/**
 * No-op audit service for development/testing
 */
export class NoOpAuditService implements AuditService {
  async log(_event: AuditEvent): Promise<void> {
    // No-op
  }

  async query(_filters: AuditQueryFilters): Promise<AuditEvent[]> {
    return [];
  }
}
