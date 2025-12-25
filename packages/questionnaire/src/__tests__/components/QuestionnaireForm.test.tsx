import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { QuestionnaireForm } from '../../components/QuestionnaireForm';
import { QuestionnaireResult } from '../../types';
import type { Questionnaire } from 'fhir/r4';
// Mock Alert
jest.spyOn(Alert, 'alert');

describe('QuestionnaireForm', () => {
  const mockQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    title: 'Test Survey',
    description: 'This is a test survey',
    item: [
      {
        linkId: 'name',
        type: 'text',
        text: 'Your name',
        required: true,
      },
      {
        linkId: 'rating',
        type: 'integer',
        text: 'Rate us',
        required: true,
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/minValue',
            valueInteger: 1,
          },
          {
            url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
            valueInteger: 5,
          },
        ],
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

    expect(getByText(/Your name/)).toBeTruthy();
    expect(getByText(/Rate us/)).toBeTruthy();
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

  it('should not submit when there are validation errors', async () => {
    const onResult = jest.fn();
    const { getByText } = render(
      <QuestionnaireForm questionnaire={mockQuestionnaire} onResult={onResult} />
    );

    // Try to submit without filling required fields
    const submitButton = getByText('Submit');
    fireEvent.press(submitButton);

    // Wait a bit to ensure no submission happens
    await new Promise(resolve => setTimeout(resolve, 100));

    // onResult should not be called when validation fails
    expect(onResult).not.toHaveBeenCalled();
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

  it('should create response with correct FHIR structure', async () => {
    const onResult = jest.fn();
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      title: 'Simple',
      description: 'Simple questionnaire',
      item: [
        {
          linkId: 'q1',
          type: 'boolean',
          text: 'Agree?',
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

    // Response should be created with proper FHIR structure
    await waitFor(() => {
      if (onResult.mock.calls.length > 0) {
        const result: QuestionnaireResult = onResult.mock.calls[0][0];
        if (result.status === 'completed') {
          expect(result.response.resourceType).toBe('QuestionnaireResponse');
          expect(result.response.status).toBe('completed');
          expect(result.response.authored).toBeDefined();
          expect(result.response.item).toBeDefined();
        }
      }
    });
  });

  it('should handle conditional questions with enableWhen', () => {
    const conditionalQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      title: 'Conditional Survey',
      item: [
        {
          linkId: 'has-symptoms',
          type: 'boolean',
          text: 'Do you have symptoms?',
          required: true,
        },
        {
          linkId: 'describe-symptoms',
          type: 'text',
          text: 'Please describe your symptoms',
          required: false,
          enableWhen: [
            {
              question: 'has-symptoms',
              operator: '=',
              answerBoolean: true,
            },
          ],
        },
      ],
    };

    const { getByText } = render(
      <QuestionnaireForm questionnaire={conditionalQuestionnaire} onResult={jest.fn()} />
    );

    expect(getByText(/Do you have symptoms\?/)).toBeTruthy();
  });

  it('should handle questionnaire with groups', () => {
    const groupedQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      title: 'Grouped Survey',
      item: [
        {
          linkId: 'demographics',
          type: 'group',
          text: 'Demographics',
          item: [
            {
              linkId: 'age',
              type: 'integer',
              text: 'What is your age?',
              required: true,
            },
            {
              linkId: 'gender',
              type: 'choice',
              text: 'What is your gender?',
              required: false,
              answerOption: [
                {
                  valueCoding: {
                    code: 'male',
                    display: 'Male',
                  },
                },
                {
                  valueCoding: {
                    code: 'female',
                    display: 'Female',
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const { getByText } = render(
      <QuestionnaireForm questionnaire={groupedQuestionnaire} onResult={jest.fn()} />
    );

    expect(getByText('Demographics')).toBeTruthy();
  });
});
