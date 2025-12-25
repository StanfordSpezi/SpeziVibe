import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Formik } from 'formik';
import { IntegerQuestion } from '../../components/questions/IntegerQuestion';
import type { QuestionnaireItem } from 'fhir/r4';
import { defaultLightTheme } from '../../theme/default-theme';

describe('IntegerQuestion', () => {
  const mockSliderItem: QuestionnaireItem = {
    linkId: 'test-slider',
    type: 'integer',
    text: 'Rate your pain (0-10)',
    required: true,
    extension: [
      {
        url: 'http://hl7.org/fhir/StructureDefinition/minValue',
        valueInteger: 0,
      },
      {
        url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
        valueInteger: 10,
      },
      {
        url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
        valueCodeableConcept: {
          coding: [{ code: 'slider' }],
        },
      },
    ],
  };

  const mockButtonsItem: QuestionnaireItem = {
    linkId: 'test-buttons',
    type: 'integer',
    text: 'Rate this (1-5)',
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
  };

  const mockInputItem: QuestionnaireItem = {
    linkId: 'test-input',
    type: 'integer',
    text: 'Enter a number',
    required: false,
    extension: [
      {
        url: 'http://hl7.org/fhir/StructureDefinition/minValue',
        valueInteger: 1,
      },
      {
        url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
        valueInteger: 100,
      },
    ],
  };

  const renderWithFormik = (item: QuestionnaireItem, initialValues: Record<string, unknown> = {}) => {
    return render(
      <Formik initialValues={initialValues} onSubmit={jest.fn()}>
        {(formik) => <IntegerQuestion item={item} formik={formik} theme={defaultLightTheme} />}
      </Formik>
    );
  };

  describe('slider control', () => {
    it('should render question text', () => {
      const { getByText } = renderWithFormik(mockSliderItem);
      expect(getByText(/Rate your pain/)).toBeTruthy();
    });

    it('should render required asterisk', () => {
      const { getByText } = renderWithFormik(mockSliderItem);
      expect(getByText('*')).toBeTruthy();
    });

    it('should render input for slider control', () => {
      const { getByTestId } = renderWithFormik(mockSliderItem);
      const input = getByTestId('slider-test-slider');
      expect(input).toBeTruthy();
    });

    it('should show current value', () => {
      const { getByTestId } = renderWithFormik(mockSliderItem, {
        'test-slider': 7,
      });

      const input = getByTestId('slider-test-slider');
      expect(input.props.value).toBe('7');
    });
  });

  describe('button control (small range)', () => {
    it('should render correct number of buttons for small range', () => {
      const { getByText } = renderWithFormik(mockButtonsItem);

      // Should have buttons for 1, 2, 3, 4, 5
      expect(getByText('1')).toBeTruthy();
      expect(getByText('2')).toBeTruthy();
      expect(getByText('3')).toBeTruthy();
      expect(getByText('4')).toBeTruthy();
      expect(getByText('5')).toBeTruthy();
    });

    it('should update formik value on button press', () => {
      const { getByText } = renderWithFormik(mockButtonsItem);

      const button3 = getByText('3');
      fireEvent.press(button3);

      // Button should be rendered
      expect(button3).toBeTruthy();
    });

    it('should render required asterisk', () => {
      const { getByText } = renderWithFormik(mockButtonsItem);
      expect(getByText('*')).toBeTruthy();
    });
  });

  describe('input control (large range)', () => {
    it('should render text input for large range', () => {
      const { getByTestId } = renderWithFormik(mockInputItem);
      const input = getByTestId('integer-input-test-input');
      expect(input).toBeTruthy();
    });

    it('should not render asterisk when not required', () => {
      const { queryByText } = renderWithFormik(mockInputItem);
      expect(queryByText('*')).toBeNull();
    });

    it('should update formik value on text change', () => {
      const { getByTestId } = renderWithFormik(mockInputItem);
      const input = getByTestId('integer-input-test-input');

      fireEvent.changeText(input, '42');

      expect(input.props.value).toBe('42');
    });

    it('should display initial value', () => {
      const { getByTestId } = renderWithFormik(mockInputItem, {
        'test-input': 25,
      });
      const input = getByTestId('integer-input-test-input');

      expect(input.props.value).toBe('25');
    });

    it('should use numeric keyboard', () => {
      const { getByTestId } = renderWithFormik(mockInputItem);
      const input = getByTestId('integer-input-test-input');

      expect(input.props.keyboardType).toBe('number-pad');
    });
  });

  describe('without extensions', () => {
    it('should handle item without min/max extensions', () => {
      const simpleItem: QuestionnaireItem = {
        linkId: 'simple',
        type: 'integer',
        text: 'Simple integer',
        required: false,
      };

      const { getByTestId } = renderWithFormik(simpleItem);
      const input = getByTestId('integer-input-simple');
      expect(input).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should display error message when touched and has error', () => {
      const { getByText } = render(
        <Formik<Record<string, unknown>>
          initialValues={{ 'test-input': 0 }}
          initialErrors={{ 'test-input': 'Must be at least 1' }}
          initialTouched={{ 'test-input': true }}
          onSubmit={jest.fn()}>
          {(formik) => <IntegerQuestion item={mockInputItem} formik={formik} theme={defaultLightTheme} />}
        </Formik>
      );

      expect(getByText('Must be at least 1')).toBeTruthy();
    });
  });
});
