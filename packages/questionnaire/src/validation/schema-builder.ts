import * as Yup from 'yup';
import type { QuestionnaireItem } from 'fhir/r4';

/**
 * Creates a Yup validation schema from FHIR Questionnaire items
 */
export function createValidationSchema(items: QuestionnaireItem[]): Yup.ObjectSchema<any> {
  const schema: Record<string, any> = {};

  const processItem = (item: QuestionnaireItem) => {
    if (item.type === 'display') {
      return;
    }

    if (item.type === 'group') {
      if (item.item) {
        item.item.forEach(processItem);
      }
      return;
    }

    if (item.required && item.linkId) {
      schema[item.linkId] = createValidationForItem(item);
    }

    if (item.item) {
      item.item.forEach(processItem);
    }
  };

  items.forEach(processItem);

  return Yup.object().shape(schema);
}

/**
 * Creates a Yup validator for a single FHIR questionnaire item
 */
function createValidationForItem(item: QuestionnaireItem): Yup.Schema {
  switch (item.type) {
    case 'boolean':
      return Yup.boolean().required('Please make a selection');

    case 'string':
      return createStringValidation(item);

    case 'text':
      return Yup.string().required('This field is required');

    case 'integer':
      return createIntegerValidation(item);

    case 'decimal':
      return createDecimalValidation(item);

    case 'date':
      return Yup.date().required('This field is required');

    case 'dateTime':
      return Yup.date().required('This field is required');

    case 'time':
      return Yup.string().required('This field is required');

    case 'choice':
    case 'open-choice':
      return Yup.mixed().required('Please select an option');

    default:
      return Yup.mixed().required('This field is required');
  }
}

/**
 * Create string validation with maxLength support
 */
function createStringValidation(item: QuestionnaireItem): Yup.StringSchema {
  let schema = Yup.string().required('This field is required');

  if (item.maxLength) {
    schema = schema.max(item.maxLength, `Maximum length is ${item.maxLength} characters`);
  }

  return schema;
}

/**
 * Create integer validation with min/max from extensions
 */
function createIntegerValidation(item: QuestionnaireItem): Yup.NumberSchema {
  let schema = Yup.number()
    .integer('Must be a whole number')
    .required('This field is required');

  const { min, max } = getMinMaxFromExtensions(item);

  if (min !== undefined) {
    schema = schema.min(min, `Must be at least ${min}`);
  }

  if (max !== undefined) {
    schema = schema.max(max, `Must be at most ${max}`);
  }

  return schema;
}

/**
 * Create decimal validation with min/max from extensions
 */
function createDecimalValidation(item: QuestionnaireItem): Yup.NumberSchema {
  let schema = Yup.number().required('This field is required');

  const { min, max } = getMinMaxFromExtensions(item);

  if (min !== undefined) {
    schema = schema.min(min, `Must be at least ${min}`);
  }

  if (max !== undefined) {
    schema = schema.max(max, `Must be at most ${max}`);
  }

  return schema;
}

/**
 * Extract min and max values from FHIR extensions
 */
function getMinMaxFromExtensions(item: QuestionnaireItem): { min?: number; max?: number } {
  if (!item.extension) {
    return {};
  }

  let min: number | undefined;
  let max: number | undefined;

  for (const ext of item.extension) {
    if (ext.url === 'http://hl7.org/fhir/StructureDefinition/minValue') {
      min = ext.valueInteger ?? ext.valueDecimal;
    }
    if (ext.url === 'http://hl7.org/fhir/StructureDefinition/maxValue') {
      max = ext.valueInteger ?? ext.valueDecimal;
    }
  }

  return { min, max };
}
