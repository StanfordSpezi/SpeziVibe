/**
 * @spezivibe/audit
 *
 * HIPAA audit logging, session monitoring, and PHI sanitization.
 */

// Types
export type {
  AuditAction,
  AuditEvent,
  AuditQueryFilters,
  AuditService,
  SessionMonitorProps,
} from './types';

// Core
export { createAuditEvent, NoOpAuditService } from './audit-service';

// Components
export { SessionMonitor } from './session-monitor';

// Utilities
export { sanitizeForLog, DEFAULT_PHI_FIELDS } from './sanitize';
export { InMemorySecureStorage } from './secure-storage';
export type { SecureStorageAdapter } from './secure-storage';

// Backend implementations
export { FirebaseAuditService } from './backends/firebase';
export { SupabaseAuditService } from './backends/supabase';
export { MedplumAuditService } from './backends/medplum';
export { LocalAuditService } from './backends/local';
