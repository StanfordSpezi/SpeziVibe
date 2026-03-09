/**
 * Core types for HIPAA audit logging
 */

export type AuditAction =
  | 'read'
  | 'write'
  | 'delete'
  | 'export'
  | 'share'
  | 'login'
  | 'logout'
  | 'login_failed';

export interface AuditEvent {
  timestamp: string;
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

export interface AuditQueryFilters {
  userId?: string;
  action?: AuditAction;
  resource?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface AuditService {
  /** Log an audit event */
  log(event: AuditEvent): Promise<void>;
  /** Query audit events with optional filters */
  query(filters: AuditQueryFilters): Promise<AuditEvent[]>;
}

export interface SessionMonitorProps {
  /** Inactivity timeout in minutes (default: 15) */
  timeoutMinutes?: number;
  /** Callback when session times out */
  onTimeout: () => void;
  /** Children to render */
  children: React.ReactNode;
}
