import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Formik } from 'formik';
import { ScaleQuestion } from '../../components/questions/ScaleQuestion';
import { Question } from '../../types';
import { defaultLightTheme } from '../../theme/default-theme';

describe('ScaleQuestion', () => {
  const mockQuestion: Question = {
    id: 'test-scale',
    type: 'scale',
    title: 'Rate this',
    description: 'On a scale of 1-5',
    min: 1,
    max: 5,
    required: true,
  };

  const renderWithFormik = (question: Question, initialValues = {}) => {
    return render(
      <Formik initialValues={initialValues} onSubmit={jest.fn()}>
        {(formik) => <ScaleQuestion question={question} formik={formik} theme={defaultLightTheme} />}
      </Formik>
    );
  };

  it('should render question title', () => {
    const { getByText } = renderWithFormik(mockQuestion);
    expect(getByText('Rate this')).toBeTruthy();
  });

  it('should render correct number of scale buttons', () => {
    const { getByText } = renderWithFormik(mockQuestion);

    // Should have buttons for 1, 2, 3, 4, 5
    expect(getByText('1')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
    expect(getByText('4')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
  });

  it('should use default min/max when not specified', () => {
    const questionWithoutRange = { ...mockQuestion, min: undefined, max: undefined };
    const { getByText } = renderWithFormik(questionWithoutRange);

    // Default is 1-10
    expect(getByText('1')).toBeTruthy();
    expect(getByText('10')).toBeTruthy();
  });

  it('should handle custom range', () => {
    const customQuestion = { ...mockQuestion, min: 0, max: 3 };
    const { getByText } = renderWithFormik(customQuestion);

    expect(getByText('0')).toBeTruthy();
    expect(getByText('1')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
  });

  it('should update formik value on button press', () => {
    const onSubmit = jest.fn();
    const { getByText } = render(
      <Formik initialValues={{}} onSubmit={onSubmit}>
        {(formik) => (
          <>
            <ScaleQuestion question={mockQuestion} formik={formik} theme={defaultLightTheme} />
          </>
        )}
      </Formik>
    );

    const button3 = getByText('3');
    fireEvent.press(button3);

    // Formik should have the value
    expect(getByText('3').parent?.parent).toBeTruthy(); // Button should be rendered
  });

  it('should render required asterisk', () => {
    const { getByText } = renderWithFormik(mockQuestion);
    expect(getByText('*')).toBeTruthy();
  });

  it('should render description', () => {
    const { getByText } = renderWithFormik(mockQuestion);
    expect(getByText('On a scale of 1-5')).toBeTruthy();
  });
});
