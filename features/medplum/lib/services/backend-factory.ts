import { BackendService, BackendConfig } from './types';
import { LocalStorageBackend } from './backends/local-storage';
import { MedplumBackend } from '@spezivibe/medplum';

/**
 * Factory to create the appropriate backend based on configuration
 */
export class BackendFactory {
  static createBackend(config: BackendConfig): BackendService {
    switch (config.type) {
      case 'medplum':
        if (!config.medplum) {
          throw new Error('Medplum configuration is required');
        }
        return new MedplumBackend(config.medplum);
      case 'local':
      default:
        return new LocalStorageBackend();
    }
  }
}
