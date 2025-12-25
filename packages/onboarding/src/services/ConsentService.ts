import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConsentData } from '../types';
import { CONSENT_KEY } from '../constants';

/**
 * Service for managing consent data persistence.
 *
 * @example
 * ```tsx
 * import { ConsentService } from '@spezivibe/onboarding';
 *
 * // Save consent
 * await ConsentService.saveConsent({
 *   givenName: 'John',
 *   familyName: 'Doe',
 *   consentedAt: new Date().toISOString(),
 *   accepted: true,
 * });
 *
 * // Get consent
 * const consent = await ConsentService.getConsent();
 *
 * // Check if user has consented
 * const hasConsented = await ConsentService.hasConsented();
 * ```
 */
export const ConsentService = {
  /**
   * Save consent data to AsyncStorage.
   *
   * @param data - The consent data to save
   * @param storageKey - Optional custom storage key
   */
  async saveConsent(
    data: ConsentData,
    storageKey: string = CONSENT_KEY
  ): Promise<void> {
    await AsyncStorage.setItem(storageKey, JSON.stringify(data));
  },

  /**
   * Get consent data from AsyncStorage.
   *
   * @param storageKey - Optional custom storage key
   * @returns The consent data or null if not found
   */
  async getConsent(storageKey: string = CONSENT_KEY): Promise<ConsentData | null> {
    try {
      const value = await AsyncStorage.getItem(storageKey);
      if (value) {
        return JSON.parse(value) as ConsentData;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Check if user has given consent.
   *
   * @param storageKey - Optional custom storage key
   * @returns true if consent has been given and accepted
   */
  async hasConsented(storageKey: string = CONSENT_KEY): Promise<boolean> {
    const consent = await this.getConsent(storageKey);
    return consent?.accepted === true;
  },

  /**
   * Clear consent data from AsyncStorage.
   *
   * @param storageKey - Optional custom storage key
   */
  async clearConsent(storageKey: string = CONSENT_KEY): Promise<void> {
    await AsyncStorage.removeItem(storageKey);
  },

  /**
   * Create consent data object with current timestamp.
   *
   * @param givenName - User's first name
   * @param familyName - User's last name
   * @param accepted - Whether user accepted the terms
   * @returns ConsentData object with current timestamp
   */
  createConsentData(
    givenName: string,
    familyName: string,
    accepted: boolean = true
  ): ConsentData {
    return {
      givenName: givenName.trim(),
      familyName: familyName.trim(),
      consentedAt: new Date().toISOString(),
      accepted,
    };
  },
};
