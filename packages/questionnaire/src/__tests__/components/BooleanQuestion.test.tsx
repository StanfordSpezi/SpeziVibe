import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Formik } from 'formik';
import { BooleanQuestion } from '../../components/questions/BooleanQuestion';
import { Question } from '../../types';
import { defaultLightTheme } from '../../theme/default-theme';

describe('BooleanQuestion', () => {
  const mockQuestion: Question = {
    id: 'test-boolean',
    type: 'boolean',
    title: 'Do you agree?',
    description: 'Please confirm',
    required: true,
  };

  const renderWithFormik = (question: Question, initialValues = {}) => {
    return render(
      <Formik initialValues={initialValues} onSubmit={jest.fn()}>
        {(formik) => <BooleanQuestion question={question} formik={formik} theme={defaultLightTheme} />}
      </Formik>
    );
  };

  it('should render question title', () => {
    const { getByText } = renderWithFormik(mockQuestion);
    expect(getByText('Do you agree?')).toBeTruthy();
  });

  it('should render Yes and No buttons', () => {
    const { getByText } = renderWithFormik(mockQuestion);
    expect(getByText('Yes')).toBeTruthy();
    expect(getByText('No')).toBeTruthy();
  });

  it('should render description', () => {
    const { getByText } = renderWithFormik(mockQuestion);
    expect(getByText('Please confirm')).toBeTruthy();
  });

  it('should render required asterisk', () => {
    const { getByText } = renderWithFormik(mockQuestion);
    expect(getByText('*')).toBeTruthy();
  });

  it('should update formik value to true when Yes is pressed', () => {
    const { getByText } = renderWithFormik(mockQuestion);
    const yesButton = getByText('Yes');

    fireEvent.press(yesButton);

    expect(yesButton).toBeTruthy();
  });

  it('should update formik value to false when No is pressed', () => {
    const { getByText } = renderWithFormik(mockQuestion);
    const noButton = getByText('No');

    fireEvent.press(noButton);

    expect(noButton).toBeTruthy();
  });

  it('should display initial value true', () => {
    const { getByText } = renderWithFormik(mockQuestion, {
      'test-boolean': true,
    });

    expect(getByText('Yes')).toBeTruthy();
    expect(getByText('No')).toBeTruthy();
  });

  it('should display initial value false', () => {
    const { getByText } = renderWithFormik(mockQuestion, {
      'test-boolean': false,
    });

    expect(getByText('Yes')).toBeTruthy();
    expect(getByText('No')).toBeTruthy();
  });
});
