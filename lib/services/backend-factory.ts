import { BackendService, BackendConfig } from './types';
import { LocalStorageBackend } from './backends/local-storage';
import { FirebaseBackend } from './backends/firebase';

/**
 * Factory to create the appropriate backend service based on configuration
 *
 * Usage:
 * ```typescript
 * const config: BackendConfig = { type: 'firebase', firebase: {...} };
 * const backend = BackendFactory.createBackend(config);
 * await backend.initialize();
 * ```
 */
export class BackendFactory {
  static createBackend(config: BackendConfig): BackendService {
    switch (config.type) {
      case 'local':
        return new LocalStorageBackend();
      case 'firebase':
        return new FirebaseBackend(config);
      default:
        throw new Error(`Unknown backend type: ${config.type}`);
    }
  }
}
