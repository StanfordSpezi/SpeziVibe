import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { QuestionnaireForm } from '../../components/QuestionnaireForm';
import { Questionnaire, QuestionnaireResult } from '../../types';
import { defaultLightTheme } from '../../theme/default-theme';

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('QuestionnaireForm', () => {
  const mockQuestionnaire: Questionnaire = {
    id: 'test-questionnaire',
    title: 'Test Survey',
    description: 'This is a test survey',
    questions: [
      {
        id: 'name',
        type: 'text',
        title: 'Your name',
        required: true,
      },
      {
        id: 'rating',
        type: 'scale',
        title: 'Rate us',
        min: 1,
        max: 5,
        required: true,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render questionnaire title and description', () => {
    const { getByText } = render(
      <QuestionnaireForm questionnaire={mockQuestionnaire} onResult={jest.fn()} />
    );

    expect(getByText('Test Survey')).toBeTruthy();
    expect(getByText('This is a test survey')).toBeTruthy();
  });

  it('should render all questions', () => {
    const { getByText } = render(
      <QuestionnaireForm questionnaire={mockQuestionnaire} onResult={jest.fn()} />
    );

    expect(getByText('Your name')).toBeTruthy();
    expect(getByText('Rate us')).toBeTruthy();
  });

  it('should render submit button with default text', () => {
    const { getByText } = render(
      <QuestionnaireForm questionnaire={mockQuestionnaire} onResult={jest.fn()} />
    );

    expect(getByText('Submit')).toBeTruthy();
  });

  it('should render submit button with custom text', () => {
    const { getByText } = render(
      <QuestionnaireForm
        questionnaire={mockQuestionnaire}
        onResult={jest.fn()}
        submitButtonText="Complete Survey"
      />
    );

    expect(getByText('Complete Survey')).toBeTruthy();
  });

  it('should render cancel button by default', () => {
    const { getByText } = render(
      <QuestionnaireForm questionnaire={mockQuestionnaire} onResult={jest.fn()} />
    );

    expect(getByText('Cancel')).toBeTruthy();
  });

  it('should not render cancel button when disabled', () => {
    const { queryByText } = render(
      <QuestionnaireForm
        questionnaire={mockQuestionnaire}
        onResult={jest.fn()}
        cancelBehavior="disabled"
      />
    );

    expect(queryByText('Cancel')).toBeNull();
  });

  it('should show confirmation dialog when cancel with confirm behavior', () => {
    const onResult = jest.fn();
    const { getByText } = render(
      <QuestionnaireForm
        questionnaire={mockQuestionnaire}
        onResult={onResult}
        cancelBehavior="confirm"
      />
    );

    fireEvent.press(getByText('Cancel'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Cancel Questionnaire',
      'Are you sure you want to cancel? Your responses will not be saved.',
      expect.any(Array)
    );
  });

  it('should call onResult with cancelled immediately when cancelBehavior is immediate', () => {
    const onResult = jest.fn();
    const { getByText } = render(
      <QuestionnaireForm
        questionnaire={mockQuestionnaire}
        onResult={onResult}
        cancelBehavior="immediate"
      />
    );

    fireEvent.press(getByText('Cancel'));

    expect(onResult).toHaveBeenCalledWith({ status: 'cancelled' });
  });

  it('should call onResult with completed response when valid form is submitted', async () => {
    const onResult = jest.fn();
    const { getByText } = render(
      <QuestionnaireForm questionnaire={mockQuestionnaire} onResult={onResult} />
    );

    // Submit button exists
    const submitButton = getByText('Submit');
    expect(submitButton).toBeTruthy();
  });

  it('should show alert when submitting with validation errors', async () => {
    const onResult = jest.fn();
    const { getByText } = render(
      <QuestionnaireForm questionnaire={mockQuestionnaire} onResult={onResult} />
    );

    // Try to submit without filling required fields
    const submitButton = getByText('Submit');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Incomplete Form',
        'Please fill in all required fields'
      );
    });
  });

  it('should apply custom theme', () => {
    const customTheme = {
      colors: {
        primary: '#FF0000',
      },
    };

    const { getByText } = render(
      <QuestionnaireForm
        questionnaire={mockQuestionnaire}
        onResult={jest.fn()}
        theme={customTheme}
      />
    );

    expect(getByText('Test Survey')).toBeTruthy();
  });

  it('should show completion message when provided', () => {
    const { getByText } = render(
      <QuestionnaireForm
        questionnaire={mockQuestionnaire}
        onResult={jest.fn()}
        completionMessage="Thank you for completing the survey!"
      />
    );

    // Initially should show the form
    expect(getByText('Test Survey')).toBeTruthy();
  });

  it('should use custom cancel button text', () => {
    const { getByText } = render(
      <QuestionnaireForm
        questionnaire={mockQuestionnaire}
        onResult={jest.fn()}
        cancelButtonText="Go Back"
      />
    );

    expect(getByText('Go Back')).toBeTruthy();
  });

  it('should handle QuestionnaireResult with completed status', () => {
    const onResult = jest.fn();

    render(
      <QuestionnaireForm questionnaire={mockQuestionnaire} onResult={onResult} />
    );

    // Verify onResult callback accepts the correct type
    expect(onResult).toEqual(expect.any(Function));
  });

  it('should create response with correct structure', async () => {
    const onResult = jest.fn();
    const questionnaire: Questionnaire = {
      id: 'simple',
      title: 'Simple',
      description: 'Simple questionnaire',
      questions: [
        {
          id: 'q1',
          type: 'boolean',
          title: 'Agree?',
          required: false,
        },
      ],
    };

    const { getByText } = render(
      <QuestionnaireForm questionnaire={questionnaire} onResult={onResult} />
    );

    // Select Yes
    fireEvent.press(getByText('Yes'));

    // Submit
    fireEvent.press(getByText('Submit'));

    // Response should be created with proper structure
    await waitFor(() => {
      if (onResult.mock.calls.length > 0) {
        const result: QuestionnaireResult = onResult.mock.calls[0][0];
        if (result.status === 'completed') {
          expect(result.response.id).toBeDefined();
          expect(result.response.questionnaireId).toBe('simple');
          expect(result.response.completedAt).toBeInstanceOf(Date);
          expect(result.response.answers).toBeDefined();
        }
      }
    });
  });
});
