import type {
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireItem,
  QuestionnaireResponseItem,
  QuestionnaireItemEnableWhen,
} from 'fhir/r4';

/**
 * Evaluates whether a questionnaire item should be enabled/shown based on enableWhen conditions
 */
export class EnableWhenEvaluator {
  private questionnaire: Questionnaire;
  private questionnaireResponse: QuestionnaireResponse;
  private responseItemMap: Map<string, QuestionnaireResponseItem>;

  constructor(questionnaire: Questionnaire, questionnaireResponse: QuestionnaireResponse) {
    this.questionnaire = questionnaire;
    this.questionnaireResponse = questionnaireResponse;
    this.responseItemMap = this.buildResponseItemMap();
  }

  private buildResponseItemMap(): Map<string, QuestionnaireResponseItem> {
    const map = new Map<string, QuestionnaireResponseItem>();

    const traverse = (items: QuestionnaireResponseItem[] | undefined) => {
      if (!items) return;

      for (const item of items) {
        if (item.linkId) {
          map.set(item.linkId, item);
        }
        traverse(item.item);
        if (item.answer) {
          for (const answer of item.answer) {
            traverse(answer.item);
          }
        }
      }
    };

    traverse(this.questionnaireResponse.item);
    return map;
  }

  evaluate(questionnaireItem: QuestionnaireItem): boolean {
    const enableWhenList = questionnaireItem.enableWhen;

    if (!enableWhenList || enableWhenList.length === 0) {
      return true;
    }

    if (enableWhenList.length === 1) {
      return this.evaluateSingleEnableWhen(enableWhenList[0]);
    }
    const behavior = questionnaireItem.enableBehavior || 'any';

    if (behavior === 'all') {
      return enableWhenList.every((condition) => this.evaluateSingleEnableWhen(condition));
    } else {
      return enableWhenList.some((condition) => this.evaluateSingleEnableWhen(condition));
    }
  }

  private evaluateSingleEnableWhen(enableWhen: QuestionnaireItemEnableWhen): boolean {
    if (!enableWhen.question) {
      return true;
    }

    // Find the response item for the referenced question
    const targetResponseItem = this.responseItemMap.get(enableWhen.question);

    // Handle 'exists' operator specially
    if (enableWhen.operator === 'exists') {
      const hasAnswer = targetResponseItem?.answer && targetResponseItem.answer.length > 0;
      return enableWhen.answerBoolean === hasAnswer;
    }

    // If no answer exists, most operators return false
    if (!targetResponseItem?.answer || targetResponseItem.answer.length === 0) {
      return false;
    }

    // Get the actual answer value
    const answer = targetResponseItem.answer[0]; // Take first answer for simplicity

    // Compare based on operator
    return this.compareAnswer(enableWhen, answer);
  }

  private compareAnswer(
    enableWhen: QuestionnaireItemEnableWhen,
    answer: any
  ): boolean {
    const operator = enableWhen.operator;

    if (enableWhen.answerBoolean !== undefined && answer.valueBoolean !== undefined) {
      return this.compareValues(answer.valueBoolean, enableWhen.answerBoolean, operator);
    }

    if (enableWhen.answerInteger !== undefined && answer.valueInteger !== undefined) {
      return this.compareValues(answer.valueInteger, enableWhen.answerInteger, operator);
    }

    if (enableWhen.answerDecimal !== undefined && answer.valueDecimal !== undefined) {
      return this.compareValues(answer.valueDecimal, enableWhen.answerDecimal, operator);
    }

    if (enableWhen.answerString !== undefined && answer.valueString !== undefined) {
      return this.compareValues(answer.valueString, enableWhen.answerString, operator);
    }

    if (enableWhen.answerDate !== undefined && answer.valueDate !== undefined) {
      return this.compareValues(answer.valueDate, enableWhen.answerDate, operator);
    }

    if (enableWhen.answerDateTime !== undefined && answer.valueDateTime !== undefined) {
      return this.compareValues(answer.valueDateTime, enableWhen.answerDateTime, operator);
    }

    if (enableWhen.answerTime !== undefined && answer.valueTime !== undefined) {
      return this.compareValues(answer.valueTime, enableWhen.answerTime, operator);
    }

    if (enableWhen.answerCoding && answer.valueCoding) {
      return this.compareCoding(answer.valueCoding, enableWhen.answerCoding, operator);
    }

    return false;
  }

  private compareValues(actualValue: any, expectedValue: any, operator: string): boolean {
    switch (operator) {
      case '=':
        return actualValue === expectedValue;
      case '!=':
        return actualValue !== expectedValue;
      case '>':
        return actualValue > expectedValue;
      case '<':
        return actualValue < expectedValue;
      case '>=':
        return actualValue >= expectedValue;
      case '<=':
        return actualValue <= expectedValue;
      default:
        return false;
    }
  }

  /**
   * Compare Coding values
   * Two codings are equal if their system and code match
   */
  private compareCoding(actual: any, expected: any, operator: string): boolean {
    const isEqual =
      actual.system === expected.system &&
      actual.code === expected.code;

    switch (operator) {
      case '=':
        return isEqual;
      case '!=':
        return !isEqual;
      default:
        // Other operators don't make sense for Coding
        return false;
    }
  }

  /**
   * Update the evaluator with a new response
   * Call this when the user answers a question to re-evaluate conditions
   */
  updateResponse(questionnaireResponse: QuestionnaireResponse): void {
    this.questionnaireResponse = questionnaireResponse;
    this.responseItemMap = this.buildResponseItemMap();
  }
}
