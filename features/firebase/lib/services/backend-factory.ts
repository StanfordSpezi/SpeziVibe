import { BackendService, BackendConfig } from './types';
import { LocalStorageBackend } from './backends/local-storage';
import { FirebaseBackend } from './backends/firebase';

/**
 * Factory to create the appropriate backend based on configuration
 */
export class BackendFactory {
  static createBackend(config: BackendConfig): BackendService {
    switch (config.type) {
      case 'firebase':
        return new FirebaseBackend(config);
      case 'local':
      default:
        return new LocalStorageBackend();
    }
  }
}
