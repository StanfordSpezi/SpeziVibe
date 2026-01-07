// Re-export types from @spezivibe/medplum for type compatibility
export type { BackendService, SchedulerState } from '@spezivibe/medplum';

export type BackendType = 'local' | 'medplum';

export interface BackendConfig {
  type: BackendType;
  medplum?: {
    baseUrl: string;
    clientId?: string;
    projectId?: string;
  };
}
