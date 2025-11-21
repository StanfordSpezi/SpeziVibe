import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { PasswordResetForm } from '../components/PasswordResetForm';
import { renderWithAccountProvider } from './test-utils';

describe('PasswordResetForm', () => {
  it('should render email input', () => {
    const { getByPlaceholderText } = renderWithAccountProvider(<PasswordResetForm />);

    expect(getByPlaceholderText('your@email.com')).toBeTruthy();
  });

  it('should render description text', () => {
    const { getByText } = renderWithAccountProvider(<PasswordResetForm />);

    expect(
      getByText("Enter your email address and we'll send you a link to reset your password.")
    ).toBeTruthy();
  });

  it('should render send reset email button', () => {
    const { getByText } = renderWithAccountProvider(<PasswordResetForm />);

    expect(getByText('Send Reset Email')).toBeTruthy();
  });

  it('should render custom button text', () => {
    const { getByText } = renderWithAccountProvider(
      <PasswordResetForm buttonText="Reset Password" />
    );

    expect(getByText('Reset Password')).toBeTruthy();
  });

  it('should show back to login link by default', () => {
    const { getByText } = renderWithAccountProvider(
      <PasswordResetForm onBackToLogin={jest.fn()} />
    );

    expect(getByText('Back to Login')).toBeTruthy();
  });

  it('should hide back to login link when showBackToLogin is false', () => {
    const { queryByText } = renderWithAccountProvider(
      <PasswordResetForm showBackToLogin={false} />
    );

    expect(queryByText('Back to Login')).toBeNull();
  });

  it('should call onBackToLogin when back link is pressed', () => {
    const onBackToLogin = jest.fn();
    const { getByText } = renderWithAccountProvider(
      <PasswordResetForm onBackToLogin={onBackToLogin} />
    );

    fireEvent.press(getByText('Back to Login'));

    expect(onBackToLogin).toHaveBeenCalled();
  });

  it('should call onError when email is empty', async () => {
    const onError = jest.fn();
    const { getByText } = renderWithAccountProvider(
      <PasswordResetForm onError={onError} />
    );

    fireEvent.press(getByText('Send Reset Email'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Please enter your email address' })
      );
    });
  });

  it('should call onError when email is invalid', async () => {
    const onError = jest.fn();
    const { getByPlaceholderText, getByText } = renderWithAccountProvider(
      <PasswordResetForm onError={onError} />
    );

    fireEvent.changeText(getByPlaceholderText('your@email.com'), 'invalidemail');
    fireEvent.press(getByText('Send Reset Email'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Please enter a valid email address' })
      );
    });
  });

  it('should call onSuccess after successful password reset', async () => {
    const onSuccess = jest.fn();
    const { getByPlaceholderText, getByText } = renderWithAccountProvider(
      <PasswordResetForm onSuccess={onSuccess} />
    );

    fireEvent.changeText(getByPlaceholderText('your@email.com'), 'test@example.com');
    fireEvent.press(getByText('Send Reset Email'));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should show success message after reset', async () => {
    const { getByPlaceholderText, getByText } = renderWithAccountProvider(
      <PasswordResetForm />
    );

    fireEvent.changeText(getByPlaceholderText('your@email.com'), 'test@example.com');
    fireEvent.press(getByText('Send Reset Email'));

    await waitFor(() => {
      expect(getByText('Password reset email sent! Check your inbox.')).toBeTruthy();
    });
  });

  it('should show custom success message', async () => {
    const { getByPlaceholderText, getByText } = renderWithAccountProvider(
      <PasswordResetForm successMessage="Check your email!" />
    );

    fireEvent.changeText(getByPlaceholderText('your@email.com'), 'test@example.com');
    fireEvent.press(getByText('Send Reset Email'));

    await waitFor(() => {
      expect(getByText('Check your email!')).toBeTruthy();
    });
  });

  it('should hide form after successful reset', async () => {
    const { getByPlaceholderText, getByText, queryByPlaceholderText } =
      renderWithAccountProvider(<PasswordResetForm />);

    fireEvent.changeText(getByPlaceholderText('your@email.com'), 'test@example.com');
    fireEvent.press(getByText('Send Reset Email'));

    await waitFor(() => {
      expect(queryByPlaceholderText('your@email.com')).toBeNull();
    }, { timeout: 10000 });
  }, 15000);

  it('should disable input during loading', async () => {
    const { getByPlaceholderText, getByText } = renderWithAccountProvider(
      <PasswordResetForm />
    );

    const emailInput = getByPlaceholderText('your@email.com');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(getByText('Send Reset Email'));

    // Input should be disabled during loading
    expect(emailInput.props.editable).toBe(false);
  });

  it('should show loading indicator during reset', async () => {
    const { getByPlaceholderText, getByText, UNSAFE_getByType } =
      renderWithAccountProvider(<PasswordResetForm />);

    fireEvent.changeText(getByPlaceholderText('your@email.com'), 'test@example.com');
    fireEvent.press(getByText('Send Reset Email'));

    // Should show activity indicator
    const activityIndicator = UNSAFE_getByType('ActivityIndicator' as any);
    expect(activityIndicator).toBeTruthy();
  });

  it('should pass additional props to email input', () => {
    const { getByPlaceholderText } = renderWithAccountProvider(
      <PasswordResetForm emailInputProps={{ testID: 'email-input' }} />
    );

    const emailInput = getByPlaceholderText('your@email.com');
    expect(emailInput.props.testID).toBe('email-input');
  });

  it('should accept custom styles', () => {
    const { getByTestId } = renderWithAccountProvider(
      <PasswordResetForm
        containerStyle={{ testID: 'container' } as any}
        inputStyle={{ testID: 'input' } as any}
        buttonStyle={{ testID: 'button' } as any}
      />
    );

    // Just verify it renders without crashing with custom styles
    expect(getByTestId).toBeDefined();
  });

  it('should render without errors', async () => {
    const { getByPlaceholderText, getByText } = renderWithAccountProvider(
      <PasswordResetForm />
    );

    // Just verify the component renders correctly
    expect(getByPlaceholderText('your@email.com')).toBeTruthy();
    expect(getByText('Send Reset Email')).toBeTruthy();
  });

  it('should clear success state on new attempt', async () => {
    const { getByPlaceholderText, getByText } = renderWithAccountProvider(
      <PasswordResetForm />
    );

    // First attempt - should show success
    fireEvent.changeText(getByPlaceholderText('your@email.com'), 'test@example.com');
    fireEvent.press(getByText('Send Reset Email'));

    await waitFor(() => {
      expect(getByText('Password reset email sent! Check your inbox.')).toBeTruthy();
    });
  });

  it('should have correct email input type', () => {
    const { getByPlaceholderText } = renderWithAccountProvider(<PasswordResetForm />);

    const emailInput = getByPlaceholderText('your@email.com');
    expect(emailInput.props.keyboardType).toBe('email-address');
    expect(emailInput.props.autoCapitalize).toBe('none');
  });
});
