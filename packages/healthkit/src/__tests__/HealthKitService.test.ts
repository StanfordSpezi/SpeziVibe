import { HealthKitService } from '../services/HealthKitService';
import { SampleType } from '../sample-types';

describe('HealthKitService', () => {
  beforeEach(() => {
    global.resetHealthKitMocks();
  });

  describe('isAvailable', () => {
    it('should return true on iOS', () => {
      // Default mock is iOS
      expect(HealthKitService.isAvailable()).toBe(true);
    });
  });

  describe('authorization', () => {
    it('should request authorization for specified types', async () => {
      const result = await HealthKitService.requestAuthorization([
        SampleType.stepCount,
        SampleType.heartRate,
      ]);
      expect(result).toBe(true);
    });

    it('should handle authorization denial', async () => {
      const mockModule = require('@kingstinct/react-native-healthkit');
      mockModule.requestAuthorization.mockRejectedValueOnce(new Error('Denied'));

      const result = await HealthKitService.requestAuthorization([SampleType.stepCount]);
      expect(result).toBe(false);
    });
  });

  describe('data queries', () => {
    beforeEach(async () => {
      await HealthKitService.requestAuthorization([SampleType.stepCount]);
    });

    it('should get most recent sample', async () => {
      global.setMockHealthData('HKQuantityTypeIdentifierStepCount', 5000);

      const sample = await HealthKitService.getMostRecentSample(SampleType.stepCount);
      expect(sample?.value).toBe(5000);
    });

    it('should return null when no data available', async () => {
      const sample = await HealthKitService.getMostRecentSample(SampleType.heartRate);
      expect(sample).toBeNull();
    });
  });

  describe('getTodaySteps', () => {
    it('should return 0 when no steps', async () => {
      const steps = await HealthKitService.getTodaySteps();
      expect(steps).toBe(0);
    });
  });

  describe('getTodayActiveEnergy', () => {
    it('should return 0 when no energy data', async () => {
      const energy = await HealthKitService.getTodayActiveEnergy();
      expect(energy).toBe(0);
    });
  });
});
