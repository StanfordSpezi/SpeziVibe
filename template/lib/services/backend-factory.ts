import { BackendService, BackendConfig } from './types';
import { LocalStorageBackend } from './backends/local-storage';

/**
 * Factory to create the appropriate backend service based on configuration
 *
 * Base template only supports local storage.
 * When firebase feature is added, this file is replaced with one that supports Firebase.
 */
export class BackendFactory {
  static createBackend(config: BackendConfig): BackendService {
    switch (config.type) {
      case 'local':
        return new LocalStorageBackend();
      default:
        console.warn(`Backend type ${config.type} not available, falling back to local storage`);
        return new LocalStorageBackend();
    }
  }
}
