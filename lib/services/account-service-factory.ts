import { AccountService, FirebaseAccountService, LocalAccountService } from '@spezivibe/account';
import { BackendConfig } from './types';

/**
 * Factory to create an AccountService from backend configuration
 *
 * This factory bridges the existing backend configuration with the new
 * @spezivibe/account package, creating the appropriate account service
 * based on the backend type.
 */
export class AccountServiceFactory {
  static createAccountService(config: BackendConfig): AccountService {
    switch (config.type) {
      case 'firebase':
        if (!config.firebase) {
          throw new Error('Firebase configuration is required for Firebase backend');
        }
        return new FirebaseAccountService(config.firebase);

      case 'local':
        return new LocalAccountService();

      default:
        throw new Error(`Unsupported backend type: ${config.type}`);
    }
  }
}
