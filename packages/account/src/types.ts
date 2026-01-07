/**
 * Account field keys
 * Provides type-safe references to user account fields
 */
export enum AccountKey {
  // Core identifiers
  UserId = 'email',
  AccountId = 'uid',

  // Profile fields
  Name = 'name',
  DateOfBirth = 'dateOfBirth',
  Sex = 'sex',
  PhoneNumber = 'phoneNumber',
  Biography = 'biography',
  ProfileImageUrl = 'profileImageUrl',

  // Timestamps
  CreatedAt = 'createdAt',
  UpdatedAt = 'updatedAt',
}

/**
 * NOTE: AccountError and AccountErrorCode are exported from utils/errors.ts
 * See src/utils/errors.ts for the complete error handling implementation
 */

/**
 * Account events
 * Notification system for account state changes
 */
export type AccountEvent =
  | { type: 'login'; user: User }
  | { type: 'logout' }
  | { type: 'update'; user: User }
  | { type: 'delete' };

/**
 * Credentials for logging into an account
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Credentials for registering a new account
 */
export interface RegisterCredentials {
  email: string;
  password: string;
  /** User's structured name (preferred) or simple string for backward compatibility */
  name?: PersonName | string;
  dateOfBirth?: Date;
  sex?: string;
}

/**
 * Sex options
 */
export enum Sex {
  Male = 'male',
  Female = 'female',
  Other = 'other',
  PreferNotToState = 'prefer-not-to-state',
}

/**
 * Structured representation of a person's name
 *
 * Aligned with SpeziAccount's PersonNameComponents pattern.
 * Stores name components separately for better internationalization
 * and formatting flexibility.
 */
export interface PersonName {
  /** Given name (first name in Western naming conventions) */
  givenName?: string;

  /** Family name (last name in Western naming conventions) */
  familyName?: string;

  /** Middle name */
  middleName?: string;

  /** Name prefix (e.g., "Dr.", "Prof.") */
  namePrefix?: string;

  /** Name suffix (e.g., "Jr.", "III") */
  nameSuffix?: string;

  /** Nickname or preferred name */
  nickname?: string;
}

/**
 * User profile information
 * Represents the editable profile fields for a user account
 */
export interface UserProfile {
  /** User's structured name */
  name?: PersonName;

  /** Date of birth */
  dateOfBirth?: Date;

  /** Sex */
  sex?: Sex | string;

  /** Phone number */
  phoneNumber?: string;

  /** Profile biography/description */
  biography?: string;

  /** Profile image URL */
  profileImageUrl?: string;
}

/**
 * @deprecated Use UserProfile instead. Kept for backward compatibility.
 */
export type AccountDetails = UserProfile;

/**
 * User account information
 * Combines authentication data with user profile information
 */
export interface User extends UserProfile {
  /** Unique user identifier */
  uid: string;

  /** Email address */
  email: string | null;

  /** When the account was created */
  createdAt?: Date;

  /** When the account was last updated */
  updatedAt?: Date;
}

/**
 * Account configuration
 * Defines which fields are required vs optional to collect
 */
export interface AccountConfiguration {
  /**
   * Fields that are required during account creation
   */
  required?: (keyof UserProfile)[];

  /**
   * Fields that should be collected (but are optional)
   */
  collects?: (keyof UserProfile)[];

  /**
   * Allow users to edit their profile after creation
   */
  allowsEditing?: boolean;
}

/**
 * Update payload for user profile
 */
export type UserProfileUpdate = Partial<UserProfile>;

/**
 * Account service interface
 *
 * This interface defines the contract for account management services.
 * Storage-agnostic - implementations are responsible for managing
 * authentication state and tokens.
 */
export interface AccountService {
  /**
   * Initialize the account service
   * Sets up auth state listeners and checks for existing sessions
   */
  initialize(): Promise<void>;

  /**
   * Check if a user is currently authenticated
   * @returns Promise resolving to true if authenticated, false otherwise
   */
  isAuthenticated(): Promise<boolean>;

  /**
   * Get the current authenticated user
   * @returns Promise resolving to the user object or null if not authenticated
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Log in with credentials
   * @param credentials - Login credentials (email/password)
   */
  login(credentials: LoginCredentials): Promise<void>;

  /**
   * Register a new user account
   * @param credentials - Registration credentials (email/password and optional profile data)
   */
  register(credentials: RegisterCredentials): Promise<void>;

  /**
   * Log out the current user
   */
  logout(): Promise<void>;

  /**
   * Send a password reset email to the user
   * @param email - Email address to send reset link to
   */
  resetPassword(email: string): Promise<void>;

  /**
   * Update the current user's profile
   * @param updates - Partial user data to update
   */
  updateProfile(updates: UserProfileUpdate): Promise<void>;

  /**
   * Update the current user's email
   * @param newEmail - New email address
   * @param password - Current password for verification
   */
  updateEmail?(newEmail: string, password: string): Promise<void>;

  /**
   * Update the current user's password
   * @param currentPassword - Current password
   * @param newPassword - New password
   */
  updatePassword?(currentPassword: string, newPassword: string): Promise<void>;

  /**
   * Delete the current user's account
   * @param password - Current password for verification
   */
  deleteAccount?(password: string): Promise<void>;

  /**
   * Subscribe to authentication state changes
   * @param callback - Function called when auth state changes
   * @returns Unsubscribe function
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void;

  /**
   * Cleanup resources and unsubscribe from all listeners
   * Should be called when the service is no longer needed
   */
  cleanup?(): void;
}

/**
 * Configuration for Firebase account service
 */
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;

  /**
   * Enable Firebase emulator for local development
   * When true, connects to Auth emulator at localhost:9099
   * and Firestore emulator at localhost:8080
   */
  useEmulator?: boolean;

  /**
   * Custom emulator configuration (optional)
   * Override default emulator hosts and ports
   */
  emulatorConfig?: {
    /** Auth emulator host (default: 'localhost') */
    authHost?: string;
    /** Auth emulator port (default: 9099) */
    authPort?: number;
    /** Firestore emulator host (default: 'localhost') */
    firestoreHost?: string;
    /** Firestore emulator port (default: 8080) */
    firestorePort?: number;
  };
}

/**
 * Context value provided by AccountProvider
 */
export interface AccountContextValue {
  /** Whether the user is currently authenticated */
  signedIn: boolean;

  /** Whether account state is being checked/updated */
  isLoading: boolean;

  /** Current authenticated user with full profile, or null if not authenticated */
  user: User | null;

  /** Account configuration defining field requirements and editing permissions */
  configuration?: AccountConfiguration;

  /** Log in with email and password */
  login: (email: string, password: string) => Promise<void>;

  /**
   * Register a new user account with email and password
   * @param email - User's email address
   * @param password - User's password
   * @param details - Optional profile details (name, dateOfBirth, sex)
   */
  register: (
    email: string,
    password: string,
    details?: Partial<UserProfile>
  ) => Promise<void>;

  /** Log out the current user */
  logout: () => Promise<void>;

  /** Send password reset email */
  resetPassword: (email: string) => Promise<void>;

  /** Update user profile */
  updateProfile: (updates: UserProfileUpdate) => Promise<void>;

  /** Update user email (if supported by service) */
  updateEmail?: (newEmail: string, password: string) => Promise<void>;

  /** Update user password (if supported by service) */
  updatePassword?: (currentPassword: string, newPassword: string) => Promise<void>;

  /** Delete user account (if supported by service) */
  deleteAccount?: (password: string) => Promise<void>;

  /** Error message from the last operation, or null */
  error: string | null;

  /** Clear the current error */
  clearError: () => void;
}

/**
 * Props for AccountProvider component
 */
export interface AccountProviderProps {
  /** Account service implementation */
  accountService: AccountService;

  /** Account configuration (optional) */
  configuration?: AccountConfiguration;

  /** Child components */
  children: React.ReactNode;

  /** Optional callback called after successful login */
  onLogin?: (user: User) => void | Promise<void>;

  /** Optional callback called after successful logout */
  onLogout?: () => void | Promise<void>;

  /**
   * Optional event handler for all account events
   * This is called for all account events (login, logout, update, delete)
   */
  onAccountEvent?: (event: AccountEvent) => void | Promise<void>;
}
