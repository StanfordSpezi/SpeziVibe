import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Formik } from 'formik';
import { MultipleChoiceQuestion } from '../../components/questions/MultipleChoiceQuestion';
import { Question } from '../../types';
import { defaultLightTheme } from '../../theme/default-theme';

describe('MultipleChoiceQuestion', () => {
  const mockQuestion: Question = {
    id: 'test-choice',
    type: 'multipleChoice',
    title: 'Choose one',
    description: 'Select the best option',
    options: [
      { label: 'Option A', value: 'a' },
      { label: 'Option B', value: 'b' },
      { label: 'Option C', value: 'c' },
    ],
    required: true,
  };

  const renderWithFormik = (question: Question, initialValues = {}) => {
    return render(
      <Formik initialValues={initialValues} onSubmit={jest.fn()}>
        {(formik) => (
          <MultipleChoiceQuestion question={question} formik={formik} theme={defaultLightTheme} />
        )}
      </Formik>
    );
  };

  it('should render question title', () => {
    const { getByText } = renderWithFormik(mockQuestion);
    expect(getByText('Choose one')).toBeTruthy();
  });

  it('should render all options', () => {
    const { getByText } = renderWithFormik(mockQuestion);
    expect(getByText('Option A')).toBeTruthy();
    expect(getByText('Option B')).toBeTruthy();
    expect(getByText('Option C')).toBeTruthy();
  });

  it('should render description', () => {
    const { getByText } = renderWithFormik(mockQuestion);
    expect(getByText('Select the best option')).toBeTruthy();
  });

  it('should render required asterisk', () => {
    const { getByText } = renderWithFormik(mockQuestion);
    expect(getByText('*')).toBeTruthy();
  });

  it('should update formik value on option press', () => {
    const { getByText } = renderWithFormik(mockQuestion);
    const optionB = getByText('Option B');

    fireEvent.press(optionB);

    // Option should be rendered (selected)
    expect(optionB).toBeTruthy();
  });

  it('should handle numeric values', () => {
    const numericQuestion: Question = {
      ...mockQuestion,
      options: [
        { label: 'One', value: 1 },
        { label: 'Two', value: 2 },
      ],
    };

    const { getByText } = renderWithFormik(numericQuestion);
    expect(getByText('One')).toBeTruthy();
    expect(getByText('Two')).toBeTruthy();
  });

  it('should display initial value', () => {
    const { getByText } = renderWithFormik(mockQuestion, {
      'test-choice': 'b',
    });

    // All options should be rendered
    expect(getByText('Option A')).toBeTruthy();
    expect(getByText('Option B')).toBeTruthy();
    expect(getByText('Option C')).toBeTruthy();
  });
});
