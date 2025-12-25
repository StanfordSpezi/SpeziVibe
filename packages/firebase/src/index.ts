/**
 * @spezivibe/firebase
 *
 * Firebase integration for SpeziVibe applications.
 * Provides Firebase-backed implementations of account management and backend services.
 *
 * @example
 * ```tsx
 * import { FirebaseAccountService } from '@spezivibe/firebase';
 * import { AccountProvider } from '@spezivibe/account';
 *
 * const firebaseConfig = {
 *   apiKey: "your-api-key",
 *   authDomain: "your-app.firebaseapp.com",
 *   projectId: "your-project-id",
 *   // ... other config
 * };
 *
 * const accountService = new FirebaseAccountService(firebaseConfig);
 *
 * function App() {
 *   return (
 *     <AccountProvider accountService={accountService}>
 *       <YourApp />
 *     </AccountProvider>
 *   );
 * }
 * ```
 */

// Firebase Account Service
export { FirebaseAccountService } from './services/firebase-account-service';

// Firebase Error Utilities
export { mapFirebaseError } from './utils/errors';
