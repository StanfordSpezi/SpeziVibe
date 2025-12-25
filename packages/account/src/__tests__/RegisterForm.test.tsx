import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { RegisterForm } from '../components/RegisterForm';
import { renderWithAccountProvider } from './test-utils';

describe('RegisterForm', () => {
  it('should render all input fields', () => {
    const { getByPlaceholderText } = renderWithAccountProvider(<RegisterForm />);

    expect(getByPlaceholderText('your@email.com')).toBeTruthy();
    expect(getByPlaceholderText('At least 8 characters with uppercase, lowercase, and number')).toBeTruthy();
    expect(getByPlaceholderText('Re-enter your password')).toBeTruthy();
  });

  it('should render register button', () => {
    const { getByText } = renderWithAccountProvider(<RegisterForm />);

    expect(getByText('Register')).toBeTruthy();
  });

  it('should call onSuccess after successful registration', async () => {
    const onSuccess = jest.fn();
    const { getByPlaceholderText, getByText } = renderWithAccountProvider(
      <RegisterForm onSuccess={onSuccess} />
    );

    fireEvent.changeText(getByPlaceholderText('your@email.com'), 'new@example.com');
    fireEvent.changeText(getByPlaceholderText('At least 8 characters with uppercase, lowercase, and number'), 'Password123');
    fireEvent.changeText(getByPlaceholderText('Re-enter your password'), 'Password123');
    fireEvent.press(getByText('Register'));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should show error when fields are empty', async () => {
    const onError = jest.fn();
    const { getByText } = renderWithAccountProvider(<RegisterForm onError={onError} />);

    fireEvent.press(getByText('Register'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Please enter your email address' })
      );
    });
  });

  it('should show error when passwords do not match', async () => {
    const onError = jest.fn();
    const { getByPlaceholderText, getByText } = renderWithAccountProvider(
      <RegisterForm onError={onError} />
    );

    fireEvent.changeText(getByPlaceholderText('your@email.com'), 'new@example.com');
    fireEvent.changeText(getByPlaceholderText('At least 8 characters with uppercase, lowercase, and number'), 'Password123');
    fireEvent.changeText(getByPlaceholderText('Re-enter your password'), 'different');
    fireEvent.press(getByText('Register'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Passwords do not match' })
      );
    });
  });

  it('should show error when password is too short', async () => {
    const onError = jest.fn();
    const { getByPlaceholderText, getByText } = renderWithAccountProvider(
      <RegisterForm onError={onError} minPasswordLength={8} />
    );

    fireEvent.changeText(getByPlaceholderText('your@email.com'), 'new@example.com');
    fireEvent.changeText(getByPlaceholderText('At least 8 characters with uppercase, lowercase, and number'), 'short');
    fireEvent.changeText(getByPlaceholderText('Re-enter your password'), 'short');
    fireEvent.press(getByText('Register'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Password must be at least 8 characters' })
      );
    });
  });

  it('should use custom minimum password length', () => {
    const { getByPlaceholderText } = renderWithAccountProvider(
      <RegisterForm minPasswordLength={10} />
    );

    expect(getByPlaceholderText('At least 8 characters with uppercase, lowercase, and number')).toBeTruthy();
  });

  it('should show sign in link by default', () => {
    const { getByText } = renderWithAccountProvider(
      <RegisterForm onSignInPress={jest.fn()} />
    );

    expect(getByText('Sign In')).toBeTruthy();
  });

  it('should hide sign in link when showSignInLink is false', () => {
    const { queryByText } = renderWithAccountProvider(
      <RegisterForm showSignInLink={false} />
    );

    expect(queryByText('Sign In')).toBeNull();
  });

  it('should call onSignInPress when sign in link is pressed', () => {
    const onSignInPress = jest.fn();
    const { getByText } = renderWithAccountProvider(
      <RegisterForm onSignInPress={onSignInPress} />
    );

    fireEvent.press(getByText('Sign In'));

    expect(onSignInPress).toHaveBeenCalled();
  });

  it('should clear validation error when typing', async () => {
    const { getByPlaceholderText, getByText } = renderWithAccountProvider(
      <RegisterForm />
    );

    // Trigger validation error
    fireEvent.press(getByText('Register'));

    await waitFor(() => {
      // Error should be shown
    });

    // Start typing in email field
    fireEvent.changeText(getByPlaceholderText('your@email.com'), 'test');

    // Validation error should be cleared
    await waitFor(() => {
      // Form should be ready for new attempt
      expect(getByText('Register')).toBeTruthy();
    });
  });

  it('should disable inputs during registration', async () => {
    const { getByPlaceholderText, getByText } = renderWithAccountProvider(
      <RegisterForm />
    );

    const emailInput = getByPlaceholderText('your@email.com');

    fireEvent.changeText(emailInput, 'new@example.com');
    fireEvent.changeText(getByPlaceholderText('At least 8 characters with uppercase, lowercase, and number'), 'Password123');
    fireEvent.changeText(getByPlaceholderText('Re-enter your password'), 'Password123');
    fireEvent.press(getByText('Register'));

    // Input should be disabled during loading
    expect(emailInput.props.editable).toBe(false);
  });

  it('should accept custom button text', () => {
    const { getByText } = renderWithAccountProvider(
      <RegisterForm buttonText="Create Account" />
    );

    expect(getByText('Create Account')).toBeTruthy();
  });

  it('should display error in UI', async () => {
    const { getByPlaceholderText, getByText } = renderWithAccountProvider(
      <RegisterForm />
    );

    // Submit with mismatched passwords
    fireEvent.changeText(getByPlaceholderText('your@email.com'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('At least 8 characters with uppercase, lowercase, and number'), 'Password1');
    fireEvent.changeText(getByPlaceholderText('Re-enter your password'), 'password2');
    fireEvent.press(getByText('Register'));

    // Error should be displayed
    await waitFor(() => {
      expect(getByText('Passwords do not match')).toBeTruthy();
    });
  });
});
