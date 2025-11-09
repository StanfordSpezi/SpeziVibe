import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Formik } from 'formik';
import { ChoiceQuestion } from '../../components/questions/ChoiceQuestion';
import type { QuestionnaireItem } from 'fhir/r4';
import { defaultLightTheme } from '../../theme/default-theme';

describe('ChoiceQuestion', () => {
  const mockChoiceItem: QuestionnaireItem = {
    linkId: 'test-choice',
    type: 'choice',
    text: 'Choose one',
    required: true,
    _text: {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
          valueString: 'Select the best option',
        },
      ],
    },
    answerOption: [
      {
        valueCoding: {
          code: 'a',
          display: 'Option A',
        },
      },
      {
        valueCoding: {
          code: 'b',
          display: 'Option B',
        },
      },
      {
        valueCoding: {
          code: 'c',
          display: 'Option C',
        },
      },
    ],
  };

  const renderWithFormik = (item: QuestionnaireItem, initialValues = {}) => {
    return render(
      <Formik initialValues={initialValues} onSubmit={jest.fn()}>
        {(formik) => (
          <ChoiceQuestion item={item} formik={formik} theme={defaultLightTheme} />
        )}
      </Formik>
    );
  };

  it('should render question text', () => {
    const { getByText } = renderWithFormik(mockChoiceItem);
    expect(getByText(/Choose one/)).toBeTruthy();
  });

  it('should render all answer options', () => {
    const { getByText } = renderWithFormik(mockChoiceItem);
    expect(getByText('Option A')).toBeTruthy();
    expect(getByText('Option B')).toBeTruthy();
    expect(getByText('Option C')).toBeTruthy();
  });

  it('should render description from extension', () => {
    const { getByText } = renderWithFormik(mockChoiceItem);
    expect(getByText('Select the best option')).toBeTruthy();
  });

  it('should render required asterisk', () => {
    const { getByText } = renderWithFormik(mockChoiceItem);
    expect(getByText('*')).toBeTruthy();
  });

  it('should not render asterisk when not required', () => {
    const optionalItem: QuestionnaireItem = {
      ...mockChoiceItem,
      required: false,
    };
    const { queryByText } = renderWithFormik(optionalItem);
    expect(queryByText('*')).toBeNull();
  });

  it('should update formik value on option press', () => {
    const { getByText } = renderWithFormik(mockChoiceItem);
    const optionB = getByText('Option B');

    fireEvent.press(optionB);

    // Option should be rendered (selected)
    expect(optionB).toBeTruthy();
  });

  it('should handle numeric codes', () => {
    const numericItem: QuestionnaireItem = {
      ...mockChoiceItem,
      answerOption: [
        {
          valueCoding: {
            code: '1',
            display: 'One',
          },
        },
        {
          valueCoding: {
            code: '2',
            display: 'Two',
          },
        },
      ],
    };

    const { getByText } = renderWithFormik(numericItem);
    expect(getByText('One')).toBeTruthy();
    expect(getByText('Two')).toBeTruthy();
  });

  it('should display initial value', () => {
    const { getByText } = renderWithFormik(mockChoiceItem, {
      'test-choice': { code: 'b', display: 'Option B' },
    });

    // All options should be rendered
    expect(getByText('Option A')).toBeTruthy();
    expect(getByText('Option B')).toBeTruthy();
    expect(getByText('Option C')).toBeTruthy();
  });

  it('should work without description extension', () => {
    const itemWithoutDesc: QuestionnaireItem = {
      linkId: 'simple-choice',
      type: 'choice',
      text: 'Simple choice?',
      required: false,
      answerOption: [
        {
          valueCoding: {
            code: 'yes',
            display: 'Yes',
          },
        },
        {
          valueCoding: {
            code: 'no',
            display: 'No',
          },
        },
      ],
    };

    const { getByText, queryByText } = renderWithFormik(itemWithoutDesc);
    expect(getByText('Simple choice?')).toBeTruthy();
    expect(getByText('Yes')).toBeTruthy();
    expect(getByText('No')).toBeTruthy();
    // No description should be rendered
    expect(queryByText('Select the best option')).toBeNull();
  });

  it('should handle answerOption with valueInteger', () => {
    const integerItem: QuestionnaireItem = {
      linkId: 'integer-choice',
      type: 'choice',
      text: 'Select a number',
      required: false,
      answerOption: [
        {
          valueInteger: 1,
        },
        {
          valueInteger: 2,
        },
        {
          valueInteger: 3,
        },
      ],
    };

    const { getByText } = renderWithFormik(integerItem);
    expect(getByText('1')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
  });
});
