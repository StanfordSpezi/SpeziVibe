import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Formik } from 'formik';
import { TextQuestion } from '../../components/questions/TextQuestion';
import { Question } from '../../types';
import { defaultLightTheme } from '../../theme/default-theme';

describe('TextQuestion', () => {
  const mockQuestion: Question = {
    id: 'test-text',
    type: 'text',
    title: 'Test Question',
    description: 'Test description',
    placeholder: 'Enter text here...',
    required: true,
  };

  const renderWithFormik = (question: Question, initialValues = {}) => {
    return render(
      <Formik initialValues={initialValues} onSubmit={jest.fn()}>
        {(formik) => <TextQuestion question={question} formik={formik} theme={defaultLightTheme} />}
      </Formik>
    );
  };

  it('should render question title', () => {
    const { getByText } = renderWithFormik(mockQuestion);
    expect(getByText('Test Question')).toBeTruthy();
  });

  it('should render question description', () => {
    const { getByText } = renderWithFormik(mockQuestion);
    expect(getByText('Test description')).toBeTruthy();
  });

  it('should render required asterisk', () => {
    const { getByText } = renderWithFormik(mockQuestion);
    expect(getByText('*')).toBeTruthy();
  });

  it('should not render required asterisk when not required', () => {
    const optionalQuestion = { ...mockQuestion, required: false };
    const { queryByText } = renderWithFormik(optionalQuestion);
    expect(queryByText('*')).toBeNull();
  });

  it('should render placeholder text', () => {
    const { getByPlaceholderText } = renderWithFormik(mockQuestion);
    expect(getByPlaceholderText('Enter text here...')).toBeTruthy();
  });

  it('should update formik value on text change', () => {
    const { getByPlaceholderText } = renderWithFormik(mockQuestion);
    const input = getByPlaceholderText('Enter text here...');

    fireEvent.changeText(input, 'New text value');

    // Value should be in the input
    expect(input.props.value).toBe('New text value');
  });

  it('should display initial value', () => {
    const { getByPlaceholderText } = renderWithFormik(mockQuestion, {
      'test-text': 'Initial value',
    });
    const input = getByPlaceholderText('Enter text here...');

    expect(input.props.value).toBe('Initial value');
  });

  it('should not render description if not provided', () => {
    const questionWithoutDesc = { ...mockQuestion, description: undefined };
    const { queryByText } = renderWithFormik(questionWithoutDesc);
    expect(queryByText('Test description')).toBeNull();
  });

  it('should be multiline', () => {
    const { getByPlaceholderText } = renderWithFormik(mockQuestion);
    const input = getByPlaceholderText('Enter text here...');

    expect(input.props.multiline).toBe(true);
  });
});
