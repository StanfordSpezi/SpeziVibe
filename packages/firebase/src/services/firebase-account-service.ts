import { initializeApp, FirebaseApp, getApps, FirebaseError } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  Auth,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  connectAuthEmulator,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  // @ts-expect-error - getReactNativePersistence exists in RN but not in TS web definitions (Firebase SDK issue)
  getReactNativePersistence,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  deleteField,
  Firestore,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import { Platform } from 'react-native';

// Note: AsyncStorage is imported dynamically in initialize() to avoid bundling issues on web

import {
  AccountService,
  LoginCredentials,
  RegisterCredentials,
  User,
  FirebaseConfig,
  UserProfileUpdate,
  PersonName,
  createLogger,
  formatPersonName,
  parsePersonName,
  normalizePersonName,
  PersonNameStyle,
  validateEmail,
} from '@spezivibe/account';
import { mapFirebaseError as mapFirebaseErrorUtil } from '../utils/errors';

/**
 * Firebase implementation of the AccountService interface
 *
 * This service handles user authentication using Firebase Authentication
 * and profile storage using Firestore.
 *
 * Features:
 * - Stores user profile data in Firestore at users/{userId}/profile/data
 * - Loads profile data on authentication
 * - Persists profile updates automatically
 * - Password reset
 * - Email/password changes
 * - Account deletion
 * - Firebase Emulator support for local development
 *
 * For production:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Authentication with Email/Password provider
 * 3. Enable Firestore database
 * 4. Pass your Firebase config to the constructor
 *
 * For local development with emulators:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Initialize Firebase: firebase init (select Auth and Firestore)
 * 3. Start emulators: firebase emulators:start
 * 4. Set useEmulator: true in your config
 *
 * @example
 * ```typescript
 * // Production
 * const service = new FirebaseAccountService({
 *   apiKey: 'your-api-key',
 *   // ... other config
 * });
 *
 * // Local development with emulators
 * const service = new FirebaseAccountService({
 *   apiKey: 'demo-key',
 *   projectId: 'demo-project',
 *   // ... other config
 *   useEmulator: true,
 * });
 * ```
 */
export class FirebaseAccountService implements AccountService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];
  private logger = createLogger('FirebaseAccountService');
  private firebaseUnsubscribe: (() => void) | null = null;
  private authStateSequence = 0;

  constructor(private config: FirebaseConfig) {
    if (!config) {
      throw new Error('Firebase configuration is required');
    }
  }

  async initialize(): Promise<void> {
    try {
      // Check if Firebase is already initialized
      if (getApps().length === 0) {
        this.logger.info('Initializing with config:', {
          projectId: this.config.projectId,
          authDomain: this.config.authDomain,
          hasApiKey: !!this.config.apiKey,
        });
        this.app = initializeApp(this.config);
        this.logger.info('Initialized successfully');
      } else {
        this.logger.info('Using existing Firebase app instance');
        this.app = getApps()[0];
      }

      // Initialize Firestore for profile storage
      this.db = getFirestore(this.app);

      // Initialize Auth with platform-specific persistence
      try {
        if (Platform.OS === 'web') {
          // Web: use browser localStorage with IndexedDB fallback
          this.auth = initializeAuth(this.app, {
            persistence: [indexedDBLocalPersistence, browserLocalPersistence],
          });
          this.logger.info('Auth initialized with browser persistence');
        } else {
          // React Native (iOS/Android): use AsyncStorage
          // Dynamic import to avoid bundling issues on web
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          this.auth = initializeAuth(this.app, {
            persistence: getReactNativePersistence(AsyncStorage),
          });
          this.logger.info('Auth initialized with AsyncStorage persistence');
        }
      } catch {
        // If auth is already initialized, just get the existing instance
        this.auth = getAuth(this.app);
        this.logger.info('Using existing Auth instance');
      }

      // Connect to Firebase emulators if configured
      if (this.config.useEmulator) {
        const emulatorConfig = this.config.emulatorConfig || {};
        const authHost = emulatorConfig.authHost || 'localhost';
        const authPort = emulatorConfig.authPort || 9099;
        const firestoreHost = emulatorConfig.firestoreHost || 'localhost';
        const firestorePort = emulatorConfig.firestorePort || 8080;

        // Verify emulator is running before connecting (skip on web due to CORS)
        const authEmulatorUrl = `http://${authHost}:${authPort}`;
        if (Platform.OS !== 'web') {
          try {
            const response = await fetch(authEmulatorUrl, { method: 'GET' });
            if (!response.ok) {
              throw new Error(`Auth emulator returned status ${response.status}`);
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(
              `Firebase Auth emulator is not running at ${authEmulatorUrl}. ` +
                `Please start the emulator with 'firebase emulators:start' or disable emulator mode. ` +
                `Error: ${message}`
            );
          }
        }

        try {
          connectAuthEmulator(this.auth, authEmulatorUrl, {
            disableWarnings: true,
          });
          this.logger.info(`Connected to Auth emulator at ${authHost}:${authPort}`);
        } catch {
          // Emulator may already be connected
          this.logger.debug('Auth emulator already connected');
        }

        try {
          connectFirestoreEmulator(this.db, firestoreHost, firestorePort);
          this.logger.info(`Connected to Firestore emulator at ${firestoreHost}:${firestorePort}`);
        } catch {
          // Emulator may already be connected
          this.logger.debug('Firestore emulator already connected');
        }
      }

      // Set up auth state listener with profile loading
      // Use a flag to ensure we only resolve the initialization promise once
      let initialized = false;
      return new Promise((resolve) => {
        this.firebaseUnsubscribe = onAuthStateChanged(this.auth!, async (firebaseUser) => {
          // Increment sequence to track this auth state change
          this.authStateSequence++;
          const currentSequence = this.authStateSequence;

          if (firebaseUser) {
            // Load full profile from Firestore
            const userProfile = await this.loadUserProfile(firebaseUser);

            // Check if auth state changed while loading profile (race condition prevention)
            if (currentSequence !== this.authStateSequence) {
              this.logger.debug('Auth state changed during profile load, discarding stale data');
              return;
            }

            this.currentUser = userProfile;
          } else {
            this.currentUser = null;
          }

          this.logger.debug(
            'Auth state changed:',
            firebaseUser ? `Logged in as ${firebaseUser.uid}` : 'Not logged in'
          );

          // Notify all listeners
          this.authStateListeners.forEach((listener) => {
            try {
              listener(this.currentUser);
            } catch (error) {
              this.logger.error('Error in auth state listener', error);
            }
          });

          // Only resolve once on first auth state callback
          if (!initialized) {
            initialized = true;
            resolve();
          }
        });
      });
    } catch (error) {
      this.logger.error('Initialization error', error);
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    return this.currentUser !== null;
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  async login(credentials: LoginCredentials): Promise<void> {
    if (!this.auth) {
      throw new Error('Firebase account service not initialized');
    }

    // Validate email before making Firebase call
    const emailValidation = validateEmail(credentials.email);
    if (!emailValidation.valid) {
      throw new Error(emailValidation.message || 'Invalid email address');
    }

    try {
      this.logger.debug('Attempting login');
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );
      // Load full profile from Firestore (not just Firebase Auth data)
      this.currentUser = await this.loadUserProfile(userCredential.user);
      this.logger.info('Login successful');
    } catch (error) {
      if (error instanceof FirebaseError) {
        this.logger.error('Login failed', error.code);
        throw mapFirebaseErrorUtil(error.code);
      }
      this.logger.error('Login failed', error);
      throw new Error('Login failed. Please try again.');
    }
  }

  async register(credentials: RegisterCredentials): Promise<void> {
    if (!this.auth) {
      throw new Error('Firebase account service not initialized');
    }

    // Validate email before making Firebase call
    const emailValidation = validateEmail(credentials.email);
    if (!emailValidation.valid) {
      throw new Error(emailValidation.message || 'Invalid email address');
    }

    try {
      this.logger.debug('Attempting registration');
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );

      // Normalize name: accept PersonName or string
      const name = credentials.name
        ? normalizePersonName(credentials.name)
        : undefined;

      // Update Firebase Auth profile with formatted name
      if (name && userCredential.user) {
        const displayName = formatPersonName(name, PersonNameStyle.Long);
        await firebaseUpdateProfile(userCredential.user, {
          displayName,
        });
      }

      this.currentUser = this.mapFirebaseUser(userCredential.user);

      // Merge additional details from credentials
      // Use the structured PersonName instead of the parsed displayName
      if (name) {
        this.currentUser.name = name;
      }
      if (credentials.dateOfBirth) {
        this.currentUser.dateOfBirth = credentials.dateOfBirth;
      }
      if (credentials.sex) {
        this.currentUser.sex = credentials.sex;
      }

      // Save profile to Firestore (stores structured PersonName)
      await this.saveUserProfile(userCredential.user.uid, this.currentUser);

      this.logger.info('Registration successful');
    } catch (error) {
      if (error instanceof FirebaseError) {
        this.logger.error('Registration failed', error.code);
        throw mapFirebaseErrorUtil(error.code);
      }
      this.logger.error('Registration failed', error);
      throw new Error('Registration failed. Please try again.');
    }
  }

  async logout(): Promise<void> {
    if (!this.auth) {
      throw new Error('Firebase account service not initialized');
    }

    try {
      this.logger.debug('Logging out');
      await signOut(this.auth);
      this.currentUser = null;
      this.logger.info('Logout successful');
    } catch (error) {
      this.logger.error('Logout failed', error);
      throw new Error('Failed to log out. Please try again.');
    }
  }

  async resetPassword(email: string): Promise<void> {
    if (!this.auth) {
      throw new Error('Firebase account service not initialized');
    }

    // Validate email before making Firebase call
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      throw new Error(emailValidation.message || 'Invalid email address');
    }

    try {
      this.logger.debug('Sending password reset email');
      await sendPasswordResetEmail(this.auth, email);
      this.logger.info('Password reset email sent');
    } catch (error) {
      if (error instanceof FirebaseError) {
        this.logger.error('Password reset failed', error.code);
        throw mapFirebaseErrorUtil(error.code);
      }
      this.logger.error('Password reset failed', error);
      throw new Error('Failed to send password reset email. Please try again.');
    }
  }

  async updateProfile(updates: UserProfileUpdate): Promise<void> {
    if (!this.auth || !this.auth.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      this.logger.debug('Updating profile');

      // Update Firebase profile with displayName if name is provided
      if (updates.name !== undefined) {
        const displayName = formatPersonName(updates.name, PersonNameStyle.Long);
        await firebaseUpdateProfile(this.auth.currentUser, {
          displayName,
        });
      }

      // Update photoURL if profileImageUrl is provided
      if (updates.profileImageUrl !== undefined) {
        await firebaseUpdateProfile(this.auth.currentUser, {
          photoURL: updates.profileImageUrl,
        });
      }

      // Update local user object
      if (this.currentUser) {
        this.currentUser = {
          ...this.currentUser,
          ...updates,
          updatedAt: new Date(),
        };

        // Save to Firestore
        await this.saveUserProfile(this.auth.currentUser.uid, this.currentUser);

        // Notify listeners of the update
        this.authStateListeners.forEach((listener) => {
          try {
            listener(this.currentUser);
          } catch (error) {
            this.logger.error('Error in auth state listener', error);
          }
        });
      }

      this.logger.info('Profile updated successfully');
    } catch (error) {
      this.logger.error('Profile update failed', error);
      throw new Error('Failed to update profile. Please try again.');
    }
  }

  async updateEmail(newEmail: string, password: string): Promise<void> {
    if (!this.auth || !this.auth.currentUser) {
      throw new Error('No authenticated user');
    }

    // Validate new email before making Firebase call
    const emailValidation = validateEmail(newEmail);
    if (!emailValidation.valid) {
      throw new Error(emailValidation.message || 'Invalid email address');
    }

    const currentEmail = this.auth.currentUser.email;
    if (!currentEmail) {
      throw new Error('Cannot update email: current user has no email address');
    }

    try {
      this.logger.debug('Updating email');

      // Reauthenticate before email change
      const credential = EmailAuthProvider.credential(currentEmail, password);
      await reauthenticateWithCredential(this.auth.currentUser, credential);

      // Update email
      await firebaseUpdateEmail(this.auth.currentUser, newEmail);

      // Update local user object and save to Firestore
      if (this.currentUser) {
        this.currentUser = {
          ...this.currentUser,
          email: newEmail,
          updatedAt: new Date(),
        };

        // Save updated email to Firestore
        await this.saveUserProfile(this.auth.currentUser.uid, this.currentUser);

        // Notify listeners
        this.authStateListeners.forEach((listener) => {
          try {
            listener(this.currentUser);
          } catch (error) {
            this.logger.error('Error in auth state listener', error);
          }
        });
      }

      this.logger.info('Email updated successfully');
    } catch (error) {
      if (error instanceof FirebaseError) {
        this.logger.error('Email update failed', error.code);
        throw mapFirebaseErrorUtil(error.code);
      }
      this.logger.error('Email update failed', error);
      throw new Error('Failed to update email. Please try again.');
    }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.auth || !this.auth.currentUser) {
      throw new Error('No authenticated user');
    }

    const currentEmail = this.auth.currentUser.email;
    if (!currentEmail) {
      throw new Error('Cannot update password: current user has no email address');
    }

    try {
      this.logger.debug('Updating password');

      // Reauthenticate before password change
      const credential = EmailAuthProvider.credential(currentEmail, currentPassword);
      await reauthenticateWithCredential(this.auth.currentUser, credential);

      // Update password
      await firebaseUpdatePassword(this.auth.currentUser, newPassword);

      this.logger.info('Password updated successfully');
    } catch (error) {
      if (error instanceof FirebaseError) {
        this.logger.error('Password update failed', error.code);
        throw mapFirebaseErrorUtil(error.code);
      }
      this.logger.error('Password update failed', error);
      throw new Error('Failed to update password. Please try again.');
    }
  }

  async deleteAccount(password: string): Promise<void> {
    if (!this.auth || !this.auth.currentUser) {
      throw new Error('No authenticated user');
    }

    const currentEmail = this.auth.currentUser.email;
    if (!currentEmail) {
      throw new Error('Cannot delete account: current user has no email address');
    }

    const userId = this.auth.currentUser.uid;

    try {
      this.logger.debug('Deleting account');

      // Reauthenticate before account deletion
      const credential = EmailAuthProvider.credential(currentEmail, password);
      await reauthenticateWithCredential(this.auth.currentUser, credential);

      // Delete user data from Firestore before deleting auth user
      if (this.db) {
        try {
          await deleteDoc(doc(this.db, `users/${userId}/profile/data`));
          this.logger.debug('Deleted user profile from Firestore');
        } catch (firestoreError) {
          // Log but don't fail - auth user deletion is more important
          this.logger.warn('Failed to delete Firestore profile', firestoreError);
        }
      }

      // Delete auth account
      await deleteUser(this.auth.currentUser);

      this.currentUser = null;

      // Notify listeners
      this.authStateListeners.forEach((listener) => {
        try {
          listener(null);
        } catch (error) {
          this.logger.error('Error in auth state listener', error);
        }
      });

      this.logger.info('Account deleted successfully');
    } catch (error) {
      if (error instanceof FirebaseError) {
        this.logger.error('Account deletion failed', error.code);
        throw mapFirebaseErrorUtil(error.code);
      }
      this.logger.error('Account deletion failed', error);
      throw new Error('Failed to delete account. Please try again.');
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback);

    // Immediately call with current state
    callback(this.currentUser);

    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Cleanup resources and unsubscribe from all listeners
   * Should be called when the service is no longer needed
   */
  cleanup(): void {
    // Unsubscribe from Firebase auth state changes
    if (this.firebaseUnsubscribe) {
      this.firebaseUnsubscribe();
      this.firebaseUnsubscribe = null;
    }

    // Clear all local listeners
    this.authStateListeners = [];

    // Reset state
    this.currentUser = null;
    this.authStateSequence++;

    this.logger.info('Service cleanup completed');
  }

  /**
   * Load user profile from Firestore and merge with Firebase Auth data
   */
  private async loadUserProfile(firebaseUser: FirebaseUser): Promise<User> {
    const baseUser = this.mapFirebaseUser(firebaseUser);

    if (!this.db) {
      return baseUser;
    }

    try {
      const profileDoc = await getDoc(doc(this.db, `users/${firebaseUser.uid}/profile/data`));

      if (!profileDoc.exists()) {
        this.logger.debug('No profile data found in Firestore');
        return baseUser;
      }

      const profileData = profileDoc.data();

      // Handle name: Firestore stores PersonName as object
      // For backward compatibility, also handle string names
      let name: PersonName | undefined;
      if (profileData.name) {
        if (typeof profileData.name === 'string') {
          // Legacy string name - parse it
          name = parsePersonName(profileData.name);
        } else if (this.isValidPersonName(profileData.name)) {
          // Validated PersonName object from Firestore
          name = profileData.name;
        } else {
          this.logger.warn('Invalid PersonName structure in Firestore, using base user name');
          name = baseUser.name;
        }
      } else {
        name = baseUser.name;
      }

      return {
        ...baseUser,
        name,
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined,
        sex: profileData.sex,
        phoneNumber: profileData.phoneNumber,
        biography: profileData.biography,
      };
    } catch (error) {
      this.logger.error('Failed to load profile from Firestore', error);
      return baseUser;
    }
  }

  /**
   * Save user profile to Firestore
   *
   * Fields set to null will be deleted from Firestore.
   * Fields set to undefined will be ignored (no change).
   */
  private async saveUserProfile(userId: string, profile: Partial<User>): Promise<void> {
    if (!this.db) {
      this.logger.warn('Firestore not initialized, skipping profile save');
      return;
    }

    try {
      const profileData: Record<string, unknown> = {
        updatedAt: new Date().toISOString(),
      };

      // Helper to add field - use deleteField() for null, skip undefined
      const addField = (key: string, value: unknown, transform?: (v: unknown) => unknown) => {
        if (value === null) {
          // Explicitly clear the field in Firestore
          profileData[key] = deleteField();
        } else if (value !== undefined) {
          // Set the value (optionally transformed)
          const transformed = transform ? transform(value) : value;
          // If transform returns undefined, skip the field
          if (transformed !== undefined) {
            profileData[key] = transformed;
          }
        }
        // undefined values are skipped - no change to that field
      };

      addField('name', profile.name);
      addField('dateOfBirth', profile.dateOfBirth, (v) => {
        if (!this.isValidDate(v)) {
          this.logger.warn('Invalid date for dateOfBirth, skipping field');
          return undefined;
        }
        return (v as Date).toISOString();
      });
      addField('sex', profile.sex);
      addField('phoneNumber', profile.phoneNumber);
      addField('biography', profile.biography);
      addField('email', profile.email);

      await setDoc(doc(this.db, `users/${userId}/profile/data`), profileData, { merge: true });
      this.logger.info('Profile saved to Firestore');
    } catch (error) {
      this.logger.error('Failed to save profile to Firestore', error);
      throw error;
    }
  }

  /**
   * Map Firebase user to our User interface
   */
  private mapFirebaseUser(firebaseUser: FirebaseUser): User {
    // Parse displayName into PersonName components
    // Firebase Auth only stores a single displayName string,
    // so we parse it back into PersonName components
    const name = firebaseUser.displayName
      ? parsePersonName(firebaseUser.displayName)
      : undefined;

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name,
      profileImageUrl: firebaseUser.photoURL || undefined,
      createdAt: firebaseUser.metadata.creationTime
        ? new Date(firebaseUser.metadata.creationTime)
        : undefined,
      updatedAt: firebaseUser.metadata.lastSignInTime
        ? new Date(firebaseUser.metadata.lastSignInTime)
        : undefined,
    };
  }

  /**
   * Validate that an object has a valid PersonName structure
   */
  private isValidPersonName(value: unknown): value is PersonName {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const obj = value as Record<string, unknown>;
    const validKeys = ['givenName', 'familyName', 'middleName', 'namePrefix', 'nameSuffix', 'nickname'];

    // Check that all present keys are valid and string values
    for (const key of Object.keys(obj)) {
      if (!validKeys.includes(key)) {
        return false;
      }
      if (obj[key] !== undefined && typeof obj[key] !== 'string') {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate that a value is a valid Date
   */
  private isValidDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }
}
