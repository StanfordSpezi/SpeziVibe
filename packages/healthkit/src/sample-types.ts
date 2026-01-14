/**
 * HealthKit Sample Types
 *
 * Maps to Apple HealthKit identifiers for quantity and category types.
 * See: https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifier
 */

export enum SampleType {
  // Activity
  stepCount = 'HKQuantityTypeIdentifierStepCount',
  activeEnergyBurned = 'HKQuantityTypeIdentifierActiveEnergyBurned',
  basalEnergyBurned = 'HKQuantityTypeIdentifierBasalEnergyBurned',
  distanceWalkingRunning = 'HKQuantityTypeIdentifierDistanceWalkingRunning',
  distanceCycling = 'HKQuantityTypeIdentifierDistanceCycling',
  distanceSwimming = 'HKQuantityTypeIdentifierDistanceSwimming',
  flightsClimbed = 'HKQuantityTypeIdentifierFlightsClimbed',
  appleExerciseTime = 'HKQuantityTypeIdentifierAppleExerciseTime',
  appleMoveTime = 'HKQuantityTypeIdentifierAppleMoveTime',
  appleStandTime = 'HKQuantityTypeIdentifierAppleStandTime',

  // Vitals
  heartRate = 'HKQuantityTypeIdentifierHeartRate',
  restingHeartRate = 'HKQuantityTypeIdentifierRestingHeartRate',
  walkingHeartRateAverage = 'HKQuantityTypeIdentifierWalkingHeartRateAverage',
  heartRateVariabilitySDNN = 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
  bloodPressureSystolic = 'HKQuantityTypeIdentifierBloodPressureSystolic',
  bloodPressureDiastolic = 'HKQuantityTypeIdentifierBloodPressureDiastolic',
  respiratoryRate = 'HKQuantityTypeIdentifierRespiratoryRate',
  oxygenSaturation = 'HKQuantityTypeIdentifierOxygenSaturation',
  bodyTemperature = 'HKQuantityTypeIdentifierBodyTemperature',

  // Body Measurements
  bodyMass = 'HKQuantityTypeIdentifierBodyMass',
  bodyMassIndex = 'HKQuantityTypeIdentifierBodyMassIndex',
  bodyFatPercentage = 'HKQuantityTypeIdentifierBodyFatPercentage',
  leanBodyMass = 'HKQuantityTypeIdentifierLeanBodyMass',
  height = 'HKQuantityTypeIdentifierHeight',
  waistCircumference = 'HKQuantityTypeIdentifierWaistCircumference',

  // Lab & Test Results
  bloodGlucose = 'HKQuantityTypeIdentifierBloodGlucose',
  insulinDelivery = 'HKQuantityTypeIdentifierInsulinDelivery',
  bloodAlcoholContent = 'HKQuantityTypeIdentifierBloodAlcoholContent',

  // Nutrition
  dietaryEnergyConsumed = 'HKQuantityTypeIdentifierDietaryEnergyConsumed',
  dietaryCarbohydrates = 'HKQuantityTypeIdentifierDietaryCarbohydrates',
  dietaryFiber = 'HKQuantityTypeIdentifierDietaryFiber',
  dietarySugar = 'HKQuantityTypeIdentifierDietarySugar',
  dietaryFatTotal = 'HKQuantityTypeIdentifierDietaryFatTotal',
  dietaryProtein = 'HKQuantityTypeIdentifierDietaryProtein',
  dietaryWater = 'HKQuantityTypeIdentifierDietaryWater',
  dietaryCaffeine = 'HKQuantityTypeIdentifierDietaryCaffeine',

  // Sleep & Mindfulness (Category Types)
  sleepAnalysis = 'HKCategoryTypeIdentifierSleepAnalysis',
  mindfulSession = 'HKCategoryTypeIdentifierMindfulSession',

  // Other
  electrodermalActivity = 'HKQuantityTypeIdentifierElectrodermalActivity',
  numberOfTimesFallen = 'HKQuantityTypeIdentifierNumberOfTimesFallen',
  uvExposure = 'HKQuantityTypeIdentifierUVExposure',
  environmentalAudioExposure = 'HKQuantityTypeIdentifierEnvironmentalAudioExposure',
  headphoneAudioExposure = 'HKQuantityTypeIdentifierHeadphoneAudioExposure',
}

/**
 * Default unit for each sample type
 */
export const SAMPLE_TYPE_UNITS: Record<SampleType, string> = {
  // Activity
  [SampleType.stepCount]: 'count',
  [SampleType.activeEnergyBurned]: 'kcal',
  [SampleType.basalEnergyBurned]: 'kcal',
  [SampleType.distanceWalkingRunning]: 'm',
  [SampleType.distanceCycling]: 'm',
  [SampleType.distanceSwimming]: 'm',
  [SampleType.flightsClimbed]: 'count',
  [SampleType.appleExerciseTime]: 'min',
  [SampleType.appleMoveTime]: 'min',
  [SampleType.appleStandTime]: 'min',

  // Vitals
  [SampleType.heartRate]: 'count/min',
  [SampleType.restingHeartRate]: 'count/min',
  [SampleType.walkingHeartRateAverage]: 'count/min',
  [SampleType.heartRateVariabilitySDNN]: 'ms',
  [SampleType.bloodPressureSystolic]: 'mmHg',
  [SampleType.bloodPressureDiastolic]: 'mmHg',
  [SampleType.respiratoryRate]: 'count/min',
  [SampleType.oxygenSaturation]: '%',
  [SampleType.bodyTemperature]: 'degC',

  // Body Measurements
  [SampleType.bodyMass]: 'kg',
  [SampleType.bodyMassIndex]: 'count',
  [SampleType.bodyFatPercentage]: '%',
  [SampleType.leanBodyMass]: 'kg',
  [SampleType.height]: 'cm',
  [SampleType.waistCircumference]: 'cm',

  // Lab & Test Results
  [SampleType.bloodGlucose]: 'mg/dL',
  [SampleType.insulinDelivery]: 'IU',
  [SampleType.bloodAlcoholContent]: '%',

  // Nutrition
  [SampleType.dietaryEnergyConsumed]: 'kcal',
  [SampleType.dietaryCarbohydrates]: 'g',
  [SampleType.dietaryFiber]: 'g',
  [SampleType.dietarySugar]: 'g',
  [SampleType.dietaryFatTotal]: 'g',
  [SampleType.dietaryProtein]: 'g',
  [SampleType.dietaryWater]: 'mL',
  [SampleType.dietaryCaffeine]: 'mg',

  // Sleep & Mindfulness
  [SampleType.sleepAnalysis]: 'min',
  [SampleType.mindfulSession]: 'min',

  // Other
  [SampleType.electrodermalActivity]: 'S',
  [SampleType.numberOfTimesFallen]: 'count',
  [SampleType.uvExposure]: 'count',
  [SampleType.environmentalAudioExposure]: 'dBASPL',
  [SampleType.headphoneAudioExposure]: 'dBASPL',
};

/**
 * Display labels for sample types
 */
export const SAMPLE_TYPE_LABELS: Record<SampleType, string> = {
  // Activity
  [SampleType.stepCount]: 'Steps',
  [SampleType.activeEnergyBurned]: 'Active Energy',
  [SampleType.basalEnergyBurned]: 'Resting Energy',
  [SampleType.distanceWalkingRunning]: 'Walking + Running Distance',
  [SampleType.distanceCycling]: 'Cycling Distance',
  [SampleType.distanceSwimming]: 'Swimming Distance',
  [SampleType.flightsClimbed]: 'Flights Climbed',
  [SampleType.appleExerciseTime]: 'Exercise Time',
  [SampleType.appleMoveTime]: 'Move Time',
  [SampleType.appleStandTime]: 'Stand Time',

  // Vitals
  [SampleType.heartRate]: 'Heart Rate',
  [SampleType.restingHeartRate]: 'Resting Heart Rate',
  [SampleType.walkingHeartRateAverage]: 'Walking Heart Rate',
  [SampleType.heartRateVariabilitySDNN]: 'Heart Rate Variability',
  [SampleType.bloodPressureSystolic]: 'Blood Pressure (Systolic)',
  [SampleType.bloodPressureDiastolic]: 'Blood Pressure (Diastolic)',
  [SampleType.respiratoryRate]: 'Respiratory Rate',
  [SampleType.oxygenSaturation]: 'Blood Oxygen',
  [SampleType.bodyTemperature]: 'Body Temperature',

  // Body Measurements
  [SampleType.bodyMass]: 'Weight',
  [SampleType.bodyMassIndex]: 'BMI',
  [SampleType.bodyFatPercentage]: 'Body Fat',
  [SampleType.leanBodyMass]: 'Lean Body Mass',
  [SampleType.height]: 'Height',
  [SampleType.waistCircumference]: 'Waist Circumference',

  // Lab & Test Results
  [SampleType.bloodGlucose]: 'Blood Glucose',
  [SampleType.insulinDelivery]: 'Insulin Delivery',
  [SampleType.bloodAlcoholContent]: 'Blood Alcohol',

  // Nutrition
  [SampleType.dietaryEnergyConsumed]: 'Dietary Energy',
  [SampleType.dietaryCarbohydrates]: 'Carbohydrates',
  [SampleType.dietaryFiber]: 'Fiber',
  [SampleType.dietarySugar]: 'Sugar',
  [SampleType.dietaryFatTotal]: 'Total Fat',
  [SampleType.dietaryProtein]: 'Protein',
  [SampleType.dietaryWater]: 'Water',
  [SampleType.dietaryCaffeine]: 'Caffeine',

  // Sleep & Mindfulness
  [SampleType.sleepAnalysis]: 'Sleep',
  [SampleType.mindfulSession]: 'Mindfulness',

  // Other
  [SampleType.electrodermalActivity]: 'Electrodermal Activity',
  [SampleType.numberOfTimesFallen]: 'Falls',
  [SampleType.uvExposure]: 'UV Exposure',
  [SampleType.environmentalAudioExposure]: 'Environmental Sound',
  [SampleType.headphoneAudioExposure]: 'Headphone Audio',
};

/**
 * Get the unit for a sample type
 */
export function getUnitForType(type: SampleType): string {
  return SAMPLE_TYPE_UNITS[type] || 'count';
}

/**
 * Get the display label for a sample type
 */
export function getLabelForType(type: SampleType): string {
  return SAMPLE_TYPE_LABELS[type] || type;
}
