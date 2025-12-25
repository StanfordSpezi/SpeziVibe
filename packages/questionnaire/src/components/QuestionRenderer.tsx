/**
 * QuestionRenderer - Renders individual questionnaire items with enableWhen support
 * Implements FHIR R4 conditional rendering logic
 */

import React, { useMemo } from 'react';
import { FormikProps } from 'formik';
import type { Questionnaire, QuestionnaireItem, QuestionnaireResponse } from 'fhir/r4';
import { QuestionnaireTheme } from '../types';
import { EnableWhenEvaluator } from '../enablewhen/EnableWhenEvaluator';

import { BooleanQuestion } from './questions/BooleanQuestion';
import { TextQuestion } from './questions/TextQuestion';
import { ChoiceQuestion } from './questions/ChoiceQuestion';
import { IntegerQuestion } from './questions/IntegerQuestion';
import { DecimalQuestion } from './questions/DecimalQuestion';
import { DateQuestion } from './questions/DateQuestion';
import { DateTimeQuestion } from './questions/DateTimeQuestion';
import { TimeQuestion } from './questions/TimeQuestion';
import { DisplayQuestion } from './questions/DisplayQuestion';
import { GroupQuestion } from './questions/GroupQuestion';

interface QuestionRendererProps {
  item: QuestionnaireItem;
  formik: FormikProps<Record<string, unknown>>;
  theme: QuestionnaireTheme;
  questionnaire: Questionnaire;
  questionnaireResponse: QuestionnaireResponse;
}

/**
 * Renders a single questionnaire item based on its type
 * Handles enableWhen conditional logic
 */
export const QuestionRenderer = React.memo(function QuestionRenderer({
  item,
  formik,
  theme,
  questionnaire,
  questionnaireResponse,
}: QuestionRendererProps) {
  const isEnabled = useMemo(() => {
    const evaluator = new EnableWhenEvaluator(questionnaire, questionnaireResponse);
    return evaluator.evaluate(item);
  }, [item, questionnaire, questionnaireResponse]);

  if (!isEnabled) {
    return null;
  }

  switch (item.type) {
    case 'boolean':
      return <BooleanQuestion item={item} formik={formik} theme={theme} />;

    case 'string':
    case 'text':
      return <TextQuestion item={item} formik={formik} theme={theme} />;

    case 'integer':
      return <IntegerQuestion item={item} formik={formik} theme={theme} />;

    case 'decimal':
      return <DecimalQuestion item={item} formik={formik} theme={theme} />;

    case 'date':
      return <DateQuestion item={item} formik={formik} theme={theme} />;

    case 'dateTime':
      return <DateTimeQuestion item={item} formik={formik} theme={theme} />;

    case 'time':
      return <TimeQuestion item={item} formik={formik} theme={theme} />;

    case 'choice':
    case 'open-choice':
      return <ChoiceQuestion item={item} formik={formik} theme={theme} />;

    case 'display':
      return <DisplayQuestion item={item} theme={theme} />;

    case 'group':
      return (
        <GroupQuestion
          item={item}
          formik={formik}
          theme={theme}
          questionnaire={questionnaire}
          questionnaireResponse={questionnaireResponse}
        />
      );

    // TODO: Add support for more types as needed
    // case 'attachment':
    // case 'reference':
    // case 'quantity':
    // case 'url':

    default:
      console.warn(`Unsupported question type: ${item.type}`);
      return null;
  }
});
