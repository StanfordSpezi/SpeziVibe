import {
  SampleType,
  getUnitForType,
  getLabelForType,
  SAMPLE_TYPE_UNITS,
  SAMPLE_TYPE_LABELS,
} from '../sample-types';

describe('sample-types', () => {
  describe('SampleType enum', () => {
    it('should have correct identifier for stepCount', () => {
      expect(SampleType.stepCount).toBe('HKQuantityTypeIdentifierStepCount');
    });

    it('should have correct identifier for heartRate', () => {
      expect(SampleType.heartRate).toBe('HKQuantityTypeIdentifierHeartRate');
    });

    it('should have correct identifier for sleepAnalysis', () => {
      expect(SampleType.sleepAnalysis).toBe('HKCategoryTypeIdentifierSleepAnalysis');
    });
  });

  describe('getUnitForType', () => {
    it('should return count for stepCount', () => {
      expect(getUnitForType(SampleType.stepCount)).toBe('count');
    });

    it('should return count/min for heartRate', () => {
      expect(getUnitForType(SampleType.heartRate)).toBe('count/min');
    });

    it('should return kcal for activeEnergyBurned', () => {
      expect(getUnitForType(SampleType.activeEnergyBurned)).toBe('kcal');
    });
  });

  describe('getLabelForType', () => {
    it('should return Steps for stepCount', () => {
      expect(getLabelForType(SampleType.stepCount)).toBe('Steps');
    });

    it('should return Heart Rate for heartRate', () => {
      expect(getLabelForType(SampleType.heartRate)).toBe('Heart Rate');
    });

    it('should return Sleep for sleepAnalysis', () => {
      expect(getLabelForType(SampleType.sleepAnalysis)).toBe('Sleep');
    });
  });

  describe('SAMPLE_TYPE_UNITS', () => {
    it('should have unit for every SampleType', () => {
      Object.values(SampleType).forEach((type) => {
        expect(SAMPLE_TYPE_UNITS[type]).toBeDefined();
      });
    });
  });

  describe('SAMPLE_TYPE_LABELS', () => {
    it('should have label for every SampleType', () => {
      Object.values(SampleType).forEach((type) => {
        expect(SAMPLE_TYPE_LABELS[type]).toBeDefined();
      });
    });
  });
});
