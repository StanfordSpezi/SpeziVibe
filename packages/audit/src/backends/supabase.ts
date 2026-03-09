/**
 * Supabase audit logging implementation
 *
 * Writes audit events to an `audit_log` table with RLS (admin-only read).
 */

import type { AuditEvent, AuditQueryFilters, AuditService } from '../types';

export class SupabaseAuditService implements AuditService {
  private client: any; // Supabase client
  private tableName: string;

  constructor(client: any, tableName = 'audit_log') {
    this.client = client;
    this.tableName = tableName;
  }

  async log(event: AuditEvent): Promise<void> {
    const { error } = await this.client
      .from(this.tableName)
      .insert(event);

    if (error) {
      console.error('Audit log failed:', error.message);
    }
  }

  async query(filters: AuditQueryFilters): Promise<AuditEvent[]> {
    let query = this.client
      .from(this.tableName)
      .select('*')
      .order('timestamp', { ascending: false });

    if (filters.userId) {
      query = query.eq('userId', filters.userId);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.resource) {
      query = query.eq('resource', filters.resource);
    }
    if (filters.startDate) {
      query = query.gte('timestamp', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('timestamp', filters.endDate);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Audit query failed:', error.message);
      return [];
    }

    return data as AuditEvent[];
  }
}
