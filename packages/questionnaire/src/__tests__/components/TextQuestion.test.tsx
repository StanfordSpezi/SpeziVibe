import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Formik } from 'formik';
import { TextQuestion } from '../../components/questions/TextQuestion';
import type { QuestionnaireItem } from 'fhir/r4';
import { defaultLightTheme } from '../../theme/default-theme';

describe('TextQuestion', () => {
  const mockTextItem: QuestionnaireItem = {
    linkId: 'test-text',
    type: 'text',
    text: 'Test Question',
    required: true,
    _text: {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
          valueString: 'Test description',
        },
      ],
    },
  };

  const mockStringItem: QuestionnaireItem = {
    linkId: 'test-string',
    type: 'string',
    text: 'String Question',
    maxLength: 100,
    required: false,
  };

  const renderWithFormik = (item: QuestionnaireItem, initialValues: Record<string, unknown> = {}) => {
    return render(
      <Formik initialValues={initialValues} onSubmit={jest.fn()}>
        {(formik) => <TextQuestion item={item} formik={formik} theme={defaultLightTheme} />}
      </Formik>
    );
  };

  describe('text type (multi-line)', () => {
    it('should render question text', () => {
      const { getByText } = renderWithFormik(mockTextItem);
      expect(getByText(/Test Question/)).toBeTruthy();
    });

    it('should render description from extension', () => {
      const { getByText } = renderWithFormik(mockTextItem);
      expect(getByText('Test description')).toBeTruthy();
    });

    it('should render required asterisk', () => {
      const { getByText } = renderWithFormik(mockTextItem);
      expect(getByText('*')).toBeTruthy();
    });

    it('should be multiline', () => {
      const { getByTestId } = renderWithFormik(mockTextItem);
      const input = getByTestId('text-input-test-text');
      expect(input.props.multiline).toBe(true);
    });

    it('should update formik value on text change', () => {
      const { getByTestId } = renderWithFormik(mockTextItem);
      const input = getByTestId('text-input-test-text');

      fireEvent.changeText(input, 'New text value');

      expect(input.props.value).toBe('New text value');
    });

    it('should display initial value', () => {
      const { getByTestId } = renderWithFormik(mockTextItem, {
        'test-text': 'Initial value',
      });
      const input = getByTestId('text-input-test-text');

      expect(input.props.value).toBe('Initial value');
    });
  });

  describe('string type (single-line)', () => {
    it('should render question text', () => {
      const { getByText } = renderWithFormik(mockStringItem);
      expect(getByText('String Question')).toBeTruthy();
    });

    it('should not render asterisk when not required', () => {
      const { queryByText } = renderWithFormik(mockStringItem);
      expect(queryByText('*')).toBeNull();
    });

    it('should be single-line', () => {
      const { getByTestId } = renderWithFormik(mockStringItem);
      const input = getByTestId('text-input-test-string');
      expect(input.props.multiline).toBe(false);
    });

    it('should respect maxLength', () => {
      const { getByTestId } = renderWithFormik(mockStringItem);
      const input = getByTestId('text-input-test-string');
      expect(input.props.maxLength).toBe(100);
    });

    it('should update formik value on text change', () => {
      const { getByTestId } = renderWithFormik(mockStringItem);
      const input = getByTestId('text-input-test-string');

      fireEvent.changeText(input, 'Short text');

      expect(input.props.value).toBe('Short text');
    });
  });

  describe('without description', () => {
    it('should not render description if not provided', () => {
      const itemWithoutDesc: QuestionnaireItem = {
        linkId: 'no-desc',
        type: 'text',
        text: 'Question without description',
        required: false,
      };

      const { queryByText } = renderWithFormik(itemWithoutDesc);
      expect(queryByText('Test description')).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should display error message when touched and has error', () => {
      const { getByText } = render(
        <Formik<Record<string, unknown>>
          initialValues={{ 'test-text': '' }}
          initialErrors={{ 'test-text': 'This field is required' }}
          initialTouched={{ 'test-text': true }}
          onSubmit={jest.fn()}>
          {(formik) => <TextQuestion item={mockTextItem} formik={formik} theme={defaultLightTheme} />}
        </Formik>
      );

      expect(getByText('This field is required')).toBeTruthy();
    });
  });
});
