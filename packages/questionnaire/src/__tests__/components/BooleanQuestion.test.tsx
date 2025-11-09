import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Formik } from 'formik';
import { BooleanQuestion } from '../../components/questions/BooleanQuestion';
import type { QuestionnaireItem } from 'fhir/r4';
import { defaultLightTheme } from '../../theme/default-theme';

describe('BooleanQuestion', () => {
  const mockItem: QuestionnaireItem = {
    linkId: 'test-boolean',
    type: 'boolean',
    text: 'Do you agree?',
    required: true,
    _text: {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
          valueString: 'Please confirm',
        },
      ],
    },
  };

  const renderWithFormik = (item: QuestionnaireItem, initialValues = {}) => {
    return render(
      <Formik initialValues={initialValues} onSubmit={jest.fn()}>
        {(formik) => <BooleanQuestion item={item} formik={formik} theme={defaultLightTheme} />}
      </Formik>
    );
  };

  it('should render question text', () => {
    const { getByText } = renderWithFormik(mockItem);
    expect(getByText(/Do you agree\?/)).toBeTruthy();
  });

  it('should render Yes and No buttons', () => {
    const { getByText } = renderWithFormik(mockItem);
    expect(getByText('Yes')).toBeTruthy();
    expect(getByText('No')).toBeTruthy();
  });

  it('should render description from extension', () => {
    const { getByText } = renderWithFormik(mockItem);
    expect(getByText('Please confirm')).toBeTruthy();
  });

  it('should render required asterisk', () => {
    const { getByText } = renderWithFormik(mockItem);
    expect(getByText('*')).toBeTruthy();
  });

  it('should not render asterisk when not required', () => {
    const optionalItem: QuestionnaireItem = {
      ...mockItem,
      required: false,
    };
    const { queryByText } = renderWithFormik(optionalItem);
    expect(queryByText('*')).toBeNull();
  });

  it('should update formik value to true when Yes is pressed', () => {
    const { getByText } = renderWithFormik(mockItem);
    const yesButton = getByText('Yes');

    fireEvent.press(yesButton);

    expect(yesButton).toBeTruthy();
  });

  it('should update formik value to false when No is pressed', () => {
    const { getByText } = renderWithFormik(mockItem);
    const noButton = getByText('No');

    fireEvent.press(noButton);

    expect(noButton).toBeTruthy();
  });

  it('should display initial value true', () => {
    const { getByText } = renderWithFormik(mockItem, {
      'test-boolean': true,
    });

    expect(getByText('Yes')).toBeTruthy();
    expect(getByText('No')).toBeTruthy();
  });

  it('should display initial value false', () => {
    const { getByText } = renderWithFormik(mockItem, {
      'test-boolean': false,
    });

    expect(getByText('Yes')).toBeTruthy();
    expect(getByText('No')).toBeTruthy();
  });

  it('should work without description extension', () => {
    const itemWithoutDesc: QuestionnaireItem = {
      linkId: 'simple-boolean',
      type: 'boolean',
      text: 'Simple question?',
      required: false,
    };

    const { getByText, queryByText } = renderWithFormik(itemWithoutDesc);
    expect(getByText('Simple question?')).toBeTruthy();
    expect(getByText('Yes')).toBeTruthy();
    expect(getByText('No')).toBeTruthy();
    // No description should be rendered
    expect(queryByText('Please confirm')).toBeNull();
  });
});
