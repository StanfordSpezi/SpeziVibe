import { MedplumClient, LoginAuthenticationResponse } from '@medplum/core';
import type { Patient } from '@medplum/fhirtypes';
import type {
  AccountService,
  User,
  LoginCredentials,
  RegisterCredentials,
  UserProfileUpdate,
  PersonName,
} from '@spezivibe/account';
import { AccountError, AccountErrorCode, createLogger } from '@spezivibe/account';
import { createMedplumClient, getMedplumConfig } from '../client';
import { patientToUser } from '../utils/fhir-mapping';
import { mapMedplumError, notAuthenticatedError } from '../utils/errors';
import type { MedplumConfig } from '../types';

/**
 * Helper to get resource ID from a ProfileResource
 */
function getProfileId(profile: Patient | { resourceType: string; id?: string }): string | undefined {
  return profile.id;
}

/**
 * Helper to get resource type from a ProfileResource
 */
function getProfileResourceType(profile: Patient | { resourceType: string; id?: string }): string {
  return profile.resourceType;
}

/**
 * Medplum Account Service
 *
 * Implements AccountService interface using Medplum for authentication.
 * Users are represented as FHIR Patient resources.
 *
 * @example
 * ```typescript
 * const accountService = new MedplumAccountService({
 *   baseUrl: 'https://api.medplum.com/',
 *   clientId: 'your-client-id',
 *   projectId: 'your-project-id',
 * });
 *
 * await accountService.initialize();
 * await accountService.login({ email: 'user@example.com', password: 'password' });
 * ```
 */
export class MedplumAccountService implements AccountService {
  private medplum: MedplumClient;
  private config: MedplumConfig;
  private currentUser: User | null = null;
  private authStateListeners: Set<(user: User | null) => void> = new Set();
  private initialized = false;
  private logger = createLogger('MedplumAccountService');

  constructor(config: MedplumConfig) {
    this.config = config;
    this.medplum = createMedplumClient(config);
  }

  /**
   * Initialize the account service
   * Checks for existing session and sets up auth state
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Check if there's an existing session
      const profile = this.medplum.getProfile();
      if (profile) {
        this.currentUser = await this.fetchUserFromProfile();
        this.notifyListeners();
      }
    } catch (error) {
      this.logger.debug('No existing session');
    }

    this.initialized = true;
  }

  /**
   * Check if a user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return this.medplum.getProfile() !== undefined;
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    if (!this.currentUser) {
      const profile = this.medplum.getProfile();
      if (profile) {
        this.currentUser = await this.fetchUserFromProfile();
      }
    }
    return this.currentUser;
  }

  /**
   * Log in with email and password
   */
  async login(credentials: LoginCredentials): Promise<void> {
    try {
      const loginRequest: { email: string; password: string; projectId?: string; clientId?: string } = {
        email: credentials.email,
        password: credentials.password,
      };

      // Add projectId if configured
      if (this.config.projectId) {
        loginRequest.projectId = this.config.projectId;
      }
      if (this.config.clientId) {
        loginRequest.clientId = this.config.clientId;
      }

      const response = await this.medplum.startLogin(loginRequest);
      await this.handleAuthResponse(response);
      this.currentUser = await this.fetchUserFromProfile();
      this.notifyListeners();
    } catch (error) {
      this.logger.error('Login failed', error);
      throw mapMedplumError(error);
    }
  }

  /**
   * Register a new user account
   */
  async register(credentials: RegisterCredentials): Promise<void> {
    try {
      // Parse the name
      const personName: PersonName | undefined =
        typeof credentials.name === 'string'
          ? { givenName: credentials.name }
          : credentials.name;

      const newUserRequest = {
        email: credentials.email,
        password: credentials.password,
        firstName: personName?.givenName || '',
        lastName: personName?.familyName || '',
        projectId: this.config.projectId,
        clientId: this.config.clientId,
        // Note: reCAPTCHA token is required by Medplum SDK.
        // For projects not requiring reCAPTCHA, pass empty string.
        // For production with reCAPTCHA enabled, implement reCAPTCHA v3
        // and pass the token via credentials.recaptchaToken.
        recaptchaToken: (credentials as { recaptchaToken?: string }).recaptchaToken || '',
      };

      const response = await this.medplum.startNewUser(newUserRequest);
      await this.handleAuthResponse(response);

      // After registration, update the Patient resource with additional profile data
      if (credentials.dateOfBirth || credentials.sex) {
        const profile = this.medplum.getProfile();
        if (profile && getProfileResourceType(profile) === 'Patient') {
          const patientId = getProfileId(profile);
          if (patientId) {
            const patient = await this.medplum.readResource('Patient', patientId);

            const updates: Partial<Patient> = {};
            if (credentials.dateOfBirth) {
              updates.birthDate = credentials.dateOfBirth.toISOString().split('T')[0];
            }
            if (credentials.sex) {
              updates.gender = this.mapSexToGender(credentials.sex);
            }

            await this.medplum.updateResource({
              ...patient,
              ...updates,
            });
          }
        }
      }

      this.currentUser = await this.fetchUserFromProfile();
      this.notifyListeners();
    } catch (error) {
      this.logger.error('Registration failed', error);
      throw mapMedplumError(error);
    }
  }

  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    try {
      await this.medplum.signOut();
      this.currentUser = null;
      this.notifyListeners();
    } catch (error) {
      this.logger.error('Logout failed', error);
      // Clear local state even if server logout fails
      this.currentUser = null;
      this.notifyListeners();
    }
  }

  /**
   * Send a password reset email
   *
   * Note: Medplum handles password reset through its own flow.
   * This initiates the reset - user receives an email with a link
   * to set their new password via /auth/setpassword.
   *
   * Important: In production, you'll need to implement reCAPTCHA
   * as Medplum requires it for unauthenticated requests.
   * See: https://www.medplum.com/docs/api/auth/resetpassword
   */
  async resetPassword(email: string): Promise<void> {
    try {
      const resetRequest: {
        email: string;
        projectId?: string;
        recaptchaToken?: string;
      } = { email };

      // Add projectId if configured
      if (this.config.projectId) {
        resetRequest.projectId = this.config.projectId;
      }

      // Note: In production, you should pass a recaptchaToken here
      // This requires implementing reCAPTCHA v3 in your app
      // resetRequest.recaptchaToken = await getReCaptchaToken();

      await this.medplum.post('auth/resetpassword', resetRequest);
    } catch (error) {
      this.logger.error('Password reset failed', error);
      throw mapMedplumError(error);
    }
  }

  /**
   * Update the current user's profile
   */
  async updateProfile(updates: UserProfileUpdate): Promise<void> {
    const profile = this.medplum.getProfile();
    if (!profile) {
      throw notAuthenticatedError();
    }

    try {
      const resourceType = getProfileResourceType(profile);
      const id = getProfileId(profile);

      if (resourceType !== 'Patient' || !id) {
        throw new AccountError(
          AccountErrorCode.PROFILE_UPDATE_FAILED,
          'Profile is not a Patient resource. Only Patient profiles are supported.'
        );
      }

      const patient = await this.medplum.readResource('Patient', id);
      const updatedPatient = this.applyProfileUpdates(patient, updates);
      await this.medplum.updateResource(updatedPatient);

      this.currentUser = await this.fetchUserFromProfile();
      this.notifyListeners();
    } catch (error) {
      this.logger.error('Profile update failed', error);
      throw mapMedplumError(error);
    }
  }

  /**
   * Update the current user's email
   */
  async updateEmail(newEmail: string, _password: string): Promise<void> {
    const profile = this.medplum.getProfile();
    if (!profile) {
      throw notAuthenticatedError();
    }

    try {
      const resourceType = getProfileResourceType(profile);
      const id = getProfileId(profile);

      if (resourceType !== 'Patient' || !id) {
        throw new AccountError(
          AccountErrorCode.PROFILE_UPDATE_FAILED,
          'Profile is not a Patient resource. Only Patient profiles are supported.'
        );
      }

      const patient = await this.medplum.readResource('Patient', id);
      const telecom = patient.telecom || [];
      const emailIndex = telecom.findIndex((t) => t.system === 'email');

      if (emailIndex >= 0) {
        telecom[emailIndex] = { system: 'email', value: newEmail };
      } else {
        telecom.push({ system: 'email', value: newEmail });
      }

      await this.medplum.updateResource({ ...patient, telecom });

      this.currentUser = await this.fetchUserFromProfile();
      this.notifyListeners();
    } catch (error) {
      this.logger.error('Email update failed', error);
      throw mapMedplumError(error);
    }
  }

  /**
   * Update the current user's password
   *
   * Note: Medplum does not provide a direct "change password" API for authenticated users.
   * Password changes in Medplum are done through the password reset flow:
   * 1. Call resetPassword(email) to send a reset email
   * 2. User clicks link in email and sets new password via /auth/setpassword
   *
   * For self-hosted Medplum, super admins can force-set passwords via the admin UI.
   * See: https://www.medplum.com/docs/auth/user-management-guide
   *
   * This method throws an error to indicate the limitation.
   * Applications should use resetPassword() instead for password changes.
   */
  async updatePassword(_currentPassword: string, _newPassword: string): Promise<void> {
    throw new AccountError(
      AccountErrorCode.PASSWORD_UPDATE_FAILED,
      'Medplum does not support direct password changes. ' +
        'Use resetPassword(email) to initiate a password reset flow instead.'
    );
  }

  /**
   * Delete the current user's account
   *
   * Note: This is a destructive operation. Medplum may have additional
   * requirements or restrictions for account deletion.
   */
  async deleteAccount(_password: string): Promise<void> {
    const profile = this.medplum.getProfile();
    if (!profile) {
      throw notAuthenticatedError();
    }

    try {
      const resourceType = getProfileResourceType(profile);
      const id = getProfileId(profile);

      if (resourceType === 'Patient' && id) {
        await this.medplum.deleteResource('Patient', id);
      }

      await this.medplum.signOut();
      this.currentUser = null;
      this.notifyListeners();
    } catch (error) {
      this.logger.error('Account deletion failed', error);
      throw mapMedplumError(error);
    }
  }

  /**
   * Subscribe to authentication state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.authStateListeners.add(callback);

    // Immediately call with current state
    callback(this.currentUser);

    return () => {
      this.authStateListeners.delete(callback);
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.authStateListeners.clear();
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Handle the auth response from Medplum
   * Handles both single-profile and multi-profile scenarios
   */
  private async handleAuthResponse(response: LoginAuthenticationResponse): Promise<void> {
    if (response.code) {
      // Single profile - exchange code for token
      await this.medplum.processCode(response.code);
    } else if (response.memberships && response.memberships.length > 0) {
      // Multiple profiles - select the first one (or could be made configurable)
      const selectedMembership = response.memberships[0];
      const profileResponse = await this.medplum.post('auth/profile', {
        login: response.login,
        profile: selectedMembership.id,
      });
      await this.handleAuthResponse(profileResponse as LoginAuthenticationResponse);
    }
  }

  /**
   * Fetch the current user from the Medplum profile
   */
  private async fetchUserFromProfile(): Promise<User | null> {
    const profile = this.medplum.getProfile();
    if (!profile) {
      return null;
    }

    try {
      const resourceType = getProfileResourceType(profile);
      const id = getProfileId(profile);

      if (resourceType === 'Patient' && id) {
        const patient = await this.medplum.readResource('Patient', id);
        return patientToUser(patient);
      }

      // For Practitioner or other resource types, return basic info
      return {
        uid: id || '',
        email: null,
      };
    } catch (error) {
      this.logger.error('Failed to fetch user profile', error);
      return null;
    }
  }

  /**
   * Apply profile updates to a Patient resource
   */
  private applyProfileUpdates(patient: Patient, updates: UserProfileUpdate): Patient {
    const result = { ...patient };

    if (updates.name) {
      result.name = [
        {
          family: updates.name.familyName,
          given: [updates.name.givenName, updates.name.middleName].filter(Boolean) as string[],
          prefix: updates.name.namePrefix ? [updates.name.namePrefix] : undefined,
          suffix: updates.name.nameSuffix ? [updates.name.nameSuffix] : undefined,
        },
      ];
    }

    if (updates.dateOfBirth) {
      result.birthDate = updates.dateOfBirth.toISOString().split('T')[0];
    }

    if (updates.sex) {
      result.gender = this.mapSexToGender(updates.sex);
    }

    if (updates.phoneNumber !== undefined) {
      const telecom = result.telecom || [];
      const phoneIndex = telecom.findIndex((t) => t.system === 'phone');
      if (updates.phoneNumber) {
        if (phoneIndex >= 0) {
          telecom[phoneIndex] = { system: 'phone', value: updates.phoneNumber };
        } else {
          telecom.push({ system: 'phone', value: updates.phoneNumber });
        }
      } else if (phoneIndex >= 0) {
        telecom.splice(phoneIndex, 1);
      }
      result.telecom = telecom;
    }

    if (updates.profileImageUrl !== undefined) {
      result.photo = updates.profileImageUrl ? [{ url: updates.profileImageUrl }] : undefined;
    }

    return result;
  }

  /**
   * Map Sex value to FHIR gender
   */
  private mapSexToGender(sex: string): Patient['gender'] {
    switch (sex) {
      case 'male':
        return 'male';
      case 'female':
        return 'female';
      case 'other':
        return 'other';
      case 'prefer-not-to-state':
        return 'unknown';
      default:
        return 'other';
    }
  }

  /**
   * Notify all auth state listeners
   */
  private notifyListeners(): void {
    for (const listener of this.authStateListeners) {
      try {
        listener(this.currentUser);
      } catch (error) {
        this.logger.error('Listener error', error);
      }
    }
  }
}
