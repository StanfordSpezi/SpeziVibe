/**
 * Account field keys
 * Provides type-safe references to user account fields
 * Inspired by SpeziAccount's AccountKeys (simplified for JavaScript)
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
 * Inspired by SpeziAccount's AccountNotifications
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
  name?: string;
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
 * User profile information
 * Represents the editable profile fields for a user account
 * Renamed from AccountDetails for clarity (AccountDetails = user data in SpeziAccount)
 */
export interface UserProfile {
  /** User's full name */
  name?: string;

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
 * In SpeziAccount, AccountDetails refers to the full user object.
 * We use UserProfile for the editable fields.
 */
export type AccountDetails = UserProfile;

/**
 * User account information
 * Extended with UserProfile following SpeziAccount pattern
 * In SpeziAccount terminology, this is similar to Account.details
 */
export interface User extends UserProfile {
  /** Unique user identifier (accountId in SpeziAccount) */
  uid: string;

  /** Email address (userId in SpeziAccount) */
  email: string | null;

  /** Display name (legacy - use name instead) */
  displayName?: string | null;

  /** When the account was created */
  createdAt?: Date;

  /** When the account was last updated */
  updatedAt?: Date;
}

/**
 * Account configuration following SpeziAccount's pattern
 * Defines which fields are required vs optional to collect
 * Maps to SpeziAccount's AccountValueConfiguration
 */
export interface AccountConfiguration {
  /**
   * Fields that are required during account creation
   * Similar to SpeziAccount's .requires() modifier
   */
  required?: Array<keyof UserProfile>;

  /**
   * Fields that should be collected (but are optional)
   * Similar to SpeziAccount's .collects() modifier
   */
  collects?: Array<keyof UserProfile>;

  /**
   * Allow users to edit their profile after creation
   */
  allowsEditing?: boolean;
}

/**
 * Update payload for user profile
 */
export interface UserProfileUpdate extends Partial<UserProfile> {
  // All fields from UserProfile are optional for updates
}

/**
 * Account service interface
 *
 * This interface defines the contract for account management services.
 * Following the Spezi standard, this is storage-agnostic - implementations
 * are responsible for managing authentication state and tokens.
 *
 * Enhanced to match SpeziAccount capabilities including password reset
 * and profile management.
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
}

/**
 * Context value provided by AccountProvider
 * Enhanced to match SpeziAccount capabilities
 */
export interface AccountContextValue {
  /** Whether the user is currently authenticated (matches SpeziAccount's signedIn) */
  signedIn: boolean;

  /** Whether account state is being checked/updated */
  isLoading: boolean;

  /** Current authenticated user with full profile, or null if not authenticated */
  user: User | null;

  /** Account configuration defining field requirements and editing permissions */
  configuration?: AccountConfiguration;

  /** Log in with email and password */
  login: (email: string, password: string) => Promise<void>;

  /** Register a new user account with email and password */
  register: (email: string, password: string, details?: Partial<UserProfile>) => Promise<void>;

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
   * Inspired by SpeziAccount's AccountNotifications
   * This is called for all account events (login, logout, update, delete)
   */
  onAccountEvent?: (event: AccountEvent) => void | Promise<void>;
}
