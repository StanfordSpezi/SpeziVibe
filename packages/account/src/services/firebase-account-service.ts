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
  Persistence,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  Firestore,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get React Native persistence
// This function dynamically loads the React Native persistence
function getReactNativePersistenceCompat(storage: any): Persistence {
  // Create a custom persistence object compatible with Firebase Auth
  return {
    type: 'LOCAL',
    _isAvailable: async () => true,
    _set: async (key: string, value: string) => {
      await storage.setItem(key, value);
    },
    _get: async (key: string) => {
      const value = await storage.getItem(key);
      return value;
    },
    _remove: async (key: string) => {
      await storage.removeItem(key);
    },
  } as Persistence;
}
import {
  AccountService,
  LoginCredentials,
  RegisterCredentials,
  User,
  FirebaseConfig,
  UserProfileUpdate,
} from '../types';
import { createLogger, mapFirebaseError as mapFirebaseErrorUtil } from '../utils';

/**
 * Firebase implementation of the AccountService interface
 *
 * This service handles user authentication using Firebase Authentication
 * and profile storage using Firestore.
 *
 * Features:
 * - Stores user profile data in Firestore at users/{userId}/profile
 * - Loads profile data on authentication
 * - Persists profile updates automatically
 * - Password reset
 * - Email/password changes
 * - Account deletion
 *
 * To use this service:
 * 1. Install firebase: npm install firebase
 * 2. Create a Firebase project at https://console.firebase.google.com
 * 3. Enable Authentication with Email/Password provider
 * 4. Enable Firestore database
 * 5. Pass your Firebase config to the constructor
 */
export class FirebaseAccountService implements AccountService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private currentUser: User | null = null;
  private authStateListeners: Array<(user: User | null) => void> = [];
  private logger = createLogger('FirebaseAccountService');

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

      // Initialize Auth with React Native persistence using AsyncStorage
      try {
        this.auth = initializeAuth(this.app, {
          persistence: getReactNativePersistenceCompat(AsyncStorage),
        });
        this.logger.info('Auth initialized with AsyncStorage persistence');
      } catch (error) {
        // If auth is already initialized, just get the existing instance
        this.auth = getAuth(this.app);
        this.logger.info('Using existing Auth instance');
      }

      // Set up auth state listener with profile loading
      return new Promise((resolve) => {
        onAuthStateChanged(this.auth!, async (firebaseUser) => {
          if (firebaseUser) {
            // Load full profile from Firestore
            this.currentUser = await this.loadUserProfile(firebaseUser);
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

          resolve();
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

    try {
      this.logger.debug('Attempting login');
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );
      this.currentUser = this.mapFirebaseUser(userCredential.user);
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

    try {
      this.logger.debug('Attempting registration');
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );

      // Update profile with name if provided
      if (credentials.name && userCredential.user) {
        await firebaseUpdateProfile(userCredential.user, {
          displayName: credentials.name,
        });
      }

      this.currentUser = this.mapFirebaseUser(userCredential.user);

      // Merge additional details from credentials
      if (credentials.name) {
        this.currentUser.name = credentials.name;
      }
      if (credentials.dateOfBirth) {
        this.currentUser.dateOfBirth = credentials.dateOfBirth;
      }
      if (credentials.sex) {
        this.currentUser.sex = credentials.sex;
      }

      // Save profile to Firestore
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
        await firebaseUpdateProfile(this.auth.currentUser, {
          displayName: updates.name,
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
          displayName: updates.name || this.currentUser.displayName,
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

    try {
      this.logger.debug('Updating email');

      // Reauthenticate before email change
      const credential = EmailAuthProvider.credential(
        this.auth.currentUser.email!,
        password
      );
      await reauthenticateWithCredential(this.auth.currentUser, credential);

      // Update email
      await firebaseUpdateEmail(this.auth.currentUser, newEmail);

      // Update local user object
      if (this.currentUser) {
        this.currentUser = {
          ...this.currentUser,
          email: newEmail,
          updatedAt: new Date(),
        };

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

    try {
      this.logger.debug('Updating password');

      // Reauthenticate before password change
      const credential = EmailAuthProvider.credential(
        this.auth.currentUser.email!,
        currentPassword
      );
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

    try {
      this.logger.debug('Deleting account');

      // Reauthenticate before account deletion
      const credential = EmailAuthProvider.credential(
        this.auth.currentUser.email!,
        password
      );
      await reauthenticateWithCredential(this.auth.currentUser, credential);

      // Delete account
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
      return {
        ...baseUser,
        name: profileData.name || baseUser.name,
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
   */
  private async saveUserProfile(userId: string, profile: Partial<User>): Promise<void> {
    if (!this.db) {
      this.logger.warn('Firestore not initialized, skipping profile save');
      return;
    }

    try {
      const profileData = {
        name: profile.name,
        dateOfBirth: profile.dateOfBirth?.toISOString(),
        sex: profile.sex,
        phoneNumber: profile.phoneNumber,
        biography: profile.biography,
        email: profile.email,
        updatedAt: new Date().toISOString(),
      };

      // Remove undefined values
      const cleanData = Object.fromEntries(
        Object.entries(profileData).filter(([_, value]) => value !== undefined)
      );

      await setDoc(doc(this.db, `users/${userId}/profile/data`), cleanData, { merge: true });
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
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      name: firebaseUser.displayName || undefined,
      profileImageUrl: firebaseUser.photoURL || undefined,
      createdAt: firebaseUser.metadata.creationTime
        ? new Date(firebaseUser.metadata.creationTime)
        : undefined,
      updatedAt: firebaseUser.metadata.lastSignInTime
        ? new Date(firebaseUser.metadata.lastSignInTime)
        : undefined,
    };
  }
}
