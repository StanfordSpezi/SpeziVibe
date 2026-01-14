import { isExpoGo, isStandalone, getExpoGoMessage } from '../utils/expo-detection';

describe('expo-detection', () => {
  describe('isExpoGo', () => {
    it('should return false for standalone apps (default mock)', () => {
      // The default mock sets appOwnership to 'standalone'
      expect(isExpoGo()).toBe(false);
    });
  });

  describe('isStandalone', () => {
    it('should return true for standalone apps (default mock)', () => {
      expect(isStandalone()).toBe(true);
    });
  });

  describe('getExpoGoMessage', () => {
    it('should return a message mentioning custom development build', () => {
      const message = getExpoGoMessage();
      expect(message).toContain('custom development build');
      expect(message).toContain('npx expo run:ios');
    });
  });
});
