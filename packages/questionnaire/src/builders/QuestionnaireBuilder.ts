/**
 * Builder utility for creating FHIR Questionnaires with a fluent API
 */

import type {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireItemEnableWhen,
  QuestionnaireItemAnswerOption,
  Coding,
} from 'fhir/r4';

export class QuestionnaireBuilder {
  private questionnaire: Questionnaire;

  constructor(id: string) {
    this.questionnaire = {
      resourceType: 'Questionnaire',
      id,
      status: 'active',
      item: [],
    };
  }

  title(title: string): this {
    this.questionnaire.title = title;
    return this;
  }

  description(description: string): this {
    this.questionnaire.description = description;
    return this;
  }

  version(version: string): this {
    this.questionnaire.version = version;
    return this;
  }

  status(status: 'draft' | 'active' | 'retired' | 'unknown'): this {
    this.questionnaire.status = status;
    return this;
  }

  addItem(item: QuestionnaireItem): this {
    if (!this.questionnaire.item) {
      this.questionnaire.item = [];
    }
    this.questionnaire.item.push(item);
    return this;
  }

  addBoolean(linkId: string, text: string, options?: { required?: boolean; enableWhen?: QuestionnaireItemEnableWhen[] }): this {
    return this.addItem({
      linkId,
      type: 'boolean',
      text,
      required: options?.required,
      enableWhen: options?.enableWhen,
    });
  }

  addString(linkId: string, text: string, options?: { required?: boolean; maxLength?: number; enableWhen?: QuestionnaireItemEnableWhen[] }): this {
    const item: QuestionnaireItem = {
      linkId,
      type: 'string',
      text,
      required: options?.required,
      enableWhen: options?.enableWhen,
    };

    if (options?.maxLength) {
      item.maxLength = options.maxLength;
    }

    return this.addItem(item);
  }

  addText(linkId: string, text: string, options?: { required?: boolean; enableWhen?: QuestionnaireItemEnableWhen[] }): this {
    return this.addItem({
      linkId,
      type: 'text',
      text,
      required: options?.required,
      enableWhen: options?.enableWhen,
    });
  }

  addInteger(
    linkId: string,
    text: string,
    options?: { required?: boolean; min?: number; max?: number; enableWhen?: QuestionnaireItemEnableWhen[] }
  ): this {
    const item: QuestionnaireItem = {
      linkId,
      type: 'integer',
      text,
      required: options?.required,
      enableWhen: options?.enableWhen,
    };

    // Add min/max as extensions (following FHIR SDC spec)
    if (options?.min !== undefined || options?.max !== undefined) {
      item.extension = [];
      if (options.min !== undefined) {
        item.extension.push({
          url: 'http://hl7.org/fhir/StructureDefinition/minValue',
          valueInteger: options.min,
        });
      }
      if (options.max !== undefined) {
        item.extension.push({
          url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
          valueInteger: options.max,
        });
      }
    }

    return this.addItem(item);
  }

  addDecimal(
    linkId: string,
    text: string,
    options?: { required?: boolean; min?: number; max?: number; enableWhen?: QuestionnaireItemEnableWhen[] }
  ): this {
    const item: QuestionnaireItem = {
      linkId,
      type: 'decimal',
      text,
      required: options?.required,
      enableWhen: options?.enableWhen,
    };

    if (options?.min !== undefined || options?.max !== undefined) {
      item.extension = [];
      if (options.min !== undefined) {
        item.extension.push({
          url: 'http://hl7.org/fhir/StructureDefinition/minValue',
          valueDecimal: options.min,
        });
      }
      if (options.max !== undefined) {
        item.extension.push({
          url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
          valueDecimal: options.max,
        });
      }
    }

    return this.addItem(item);
  }

  addDate(linkId: string, text: string, options?: { required?: boolean; enableWhen?: QuestionnaireItemEnableWhen[] }): this {
    return this.addItem({
      linkId,
      type: 'date',
      text,
      required: options?.required,
      enableWhen: options?.enableWhen,
    });
  }

  addDateTime(linkId: string, text: string, options?: { required?: boolean; enableWhen?: QuestionnaireItemEnableWhen[] }): this {
    return this.addItem({
      linkId,
      type: 'dateTime',
      text,
      required: options?.required,
      enableWhen: options?.enableWhen,
    });
  }

  addTime(linkId: string, text: string, options?: { required?: boolean; enableWhen?: QuestionnaireItemEnableWhen[] }): this {
    return this.addItem({
      linkId,
      type: 'time',
      text,
      required: options?.required,
      enableWhen: options?.enableWhen,
    });
  }

  addChoice(
    linkId: string,
    text: string,
    options: {
      required?: boolean;
      answerOption: { value: string | number; display: string }[];
      enableWhen?: QuestionnaireItemEnableWhen[];
    }
  ): this {
    const answerOption: QuestionnaireItemAnswerOption[] = options.answerOption.map((opt) => ({
      valueCoding: {
        code: String(opt.value),
        display: opt.display,
      },
    }));

    return this.addItem({
      linkId,
      type: 'choice',
      text,
      required: options?.required,
      answerOption,
      enableWhen: options?.enableWhen,
    });
  }

  addSlider(
    linkId: string,
    text: string,
    options: { required?: boolean; min: number; max: number; step?: number; enableWhen?: QuestionnaireItemEnableWhen[] }
  ): this {
    const item: QuestionnaireItem = {
      linkId,
      type: 'integer',
      text,
      required: options?.required,
      enableWhen: options?.enableWhen,
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minValue',
          valueInteger: options.min,
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
          valueInteger: options.max,
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'slider',
                display: 'Slider',
              },
            ],
          },
        },
      ],
    };

    if (options.step) {
      item.extension!.push({
        url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-sliderStepValue',
        valueInteger: options.step,
      });
    }

    return this.addItem(item);
  }

  addDisplay(linkId: string, text: string): this {
    return this.addItem({
      linkId,
      type: 'display',
      text,
    });
  }

  addGroup(linkId: string, text: string, items: QuestionnaireItem[], options?: { enableWhen?: QuestionnaireItemEnableWhen[] }): this {
    return this.addItem({
      linkId,
      type: 'group',
      text,
      item: items,
      enableWhen: options?.enableWhen,
    });
  }

  build(): Questionnaire {
    return this.questionnaire;
  }
}

/**
 * Helper function to create enableWhen conditions
 * Follows FHIR R4 spec: https://www.hl7.org/fhir/questionnaire-definitions.html#Questionnaire.item.enableWhen
 */
export function enableWhen(
  question: string,
  operator: 'exists' | '=' | '!=' | '>' | '<' | '>=' | '<=',
  answer?: boolean | number | string | Coding
): QuestionnaireItemEnableWhen {
  const condition: QuestionnaireItemEnableWhen = {
    question,
    operator,
  };

  if (answer !== undefined) {
    if (typeof answer === 'boolean') {
      condition.answerBoolean = answer;
    } else if (typeof answer === 'number') {
      if (Number.isInteger(answer)) {
        condition.answerInteger = answer;
      } else {
        condition.answerDecimal = answer;
      }
    } else if (typeof answer === 'string') {
      condition.answerString = answer;
    } else {
      condition.answerCoding = answer;
    }
  }

  return condition;
}
