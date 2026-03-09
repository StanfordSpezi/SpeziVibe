/**
 * Local (on-device) audit logging implementation
 *
 * Stores audit events in an in-memory array.
 * In production, this would use SQLite or AsyncStorage.
 */

import type { AuditEvent, AuditQueryFilters, AuditService } from '../types';

export class LocalAuditService implements AuditService {
  private events: AuditEvent[] = [];

  async log(event: AuditEvent): Promise<void> {
    this.events.push(event);
  }

  async query(filters: AuditQueryFilters): Promise<AuditEvent[]> {
    let results = [...this.events];

    if (filters.userId) {
      results = results.filter((e) => e.userId === filters.userId);
    }
    if (filters.action) {
      results = results.filter((e) => e.action === filters.action);
    }
    if (filters.resource) {
      results = results.filter((e) => e.resource === filters.resource);
    }
    if (filters.startDate) {
      results = results.filter((e) => e.timestamp >= filters.startDate!);
    }
    if (filters.endDate) {
      results = results.filter((e) => e.timestamp <= filters.endDate!);
    }

    // Sort by timestamp descending
    results.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    if (filters.limit) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }
}
