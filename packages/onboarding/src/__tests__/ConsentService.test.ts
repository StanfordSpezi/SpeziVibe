import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConsentService } from '../services/ConsentService';
import { CONSENT_KEY } from '../constants';

describe('ConsentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveConsent', () => {
    it('should save consent data to AsyncStorage', async () => {
      const consentData = {
        givenName: 'John',
        familyName: 'Doe',
        consentedAt: '2025-01-01T00:00:00.000Z',
        accepted: true,
      };

      await ConsentService.saveConsent(consentData);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        CONSENT_KEY,
        JSON.stringify(consentData)
      );
    });

    it('should save to custom storage key', async () => {
      const customKey = '@custom_consent';
      const consentData = {
        givenName: 'Jane',
        familyName: 'Smith',
        consentedAt: '2025-01-01T00:00:00.000Z',
        accepted: true,
      };

      await ConsentService.saveConsent(consentData, customKey);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        customKey,
        JSON.stringify(consentData)
      );
    });
  });

  describe('getConsent', () => {
    it('should return consent data from AsyncStorage', async () => {
      const consentData = {
        givenName: 'John',
        familyName: 'Doe',
        consentedAt: '2025-01-01T00:00:00.000Z',
        accepted: true,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(consentData));

      const result = await ConsentService.getConsent();
      expect(result).toEqual(consentData);
    });

    it('should return null if no consent data exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await ConsentService.getConsent();
      expect(result).toBeNull();
    });

    it('should return null if stored data is invalid JSON', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('invalid json');

      const result = await ConsentService.getConsent();
      expect(result).toBeNull();
    });
  });

  describe('hasConsented', () => {
    it('should return true if user has accepted consent', async () => {
      const consentData = {
        givenName: 'John',
        familyName: 'Doe',
        consentedAt: '2025-01-01T00:00:00.000Z',
        accepted: true,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(consentData));

      const result = await ConsentService.hasConsented();
      expect(result).toBe(true);
    });

    it('should return false if user has not accepted consent', async () => {
      const consentData = {
        givenName: 'John',
        familyName: 'Doe',
        consentedAt: '2025-01-01T00:00:00.000Z',
        accepted: false,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(consentData));

      const result = await ConsentService.hasConsented();
      expect(result).toBe(false);
    });

    it('should return false if no consent data exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await ConsentService.hasConsented();
      expect(result).toBe(false);
    });
  });

  describe('clearConsent', () => {
    it('should remove consent data from AsyncStorage', async () => {
      await ConsentService.clearConsent();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(CONSENT_KEY);
    });

    it('should use custom storage key', async () => {
      const customKey = '@custom_consent';
      await ConsentService.clearConsent(customKey);

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(customKey);
    });
  });

  describe('createConsentData', () => {
    it('should create consent data with current timestamp', () => {
      const before = new Date().toISOString();
      const result = ConsentService.createConsentData('John', 'Doe', true);
      const after = new Date().toISOString();

      expect(result.givenName).toBe('John');
      expect(result.familyName).toBe('Doe');
      expect(result.accepted).toBe(true);
      expect(result.consentedAt >= before).toBe(true);
      expect(result.consentedAt <= after).toBe(true);
    });

    it('should trim whitespace from names', () => {
      const result = ConsentService.createConsentData('  John  ', '  Doe  ', true);

      expect(result.givenName).toBe('John');
      expect(result.familyName).toBe('Doe');
    });

    it('should default accepted to true', () => {
      const result = ConsentService.createConsentData('John', 'Doe');

      expect(result.accepted).toBe(true);
    });
  });
});
