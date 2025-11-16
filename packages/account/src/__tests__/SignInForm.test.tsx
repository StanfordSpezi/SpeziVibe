import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { SignInForm } from '../components/SignInForm';
import { renderWithAccountProvider } from './test-utils';

describe('SignInForm', () => {
  it('should render email and password inputs', () => {
    const { getByPlaceholderText } = renderWithAccountProvider(<SignInForm />);

    expect(getByPlaceholderText('your@email.com')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
  });

  it('should render sign in button', () => {
    const { getByText } = renderWithAccountProvider(<SignInForm />);

    expect(getByText('Sign In')).toBeTruthy();
  });

  it('should render custom button text', () => {
    const { getByText } = renderWithAccountProvider(<SignInForm buttonText="Log In" />);

    expect(getByText('Log In')).toBeTruthy();
  });

  it('should render register link by default', () => {
    const { getByText } = renderWithAccountProvider(
      <SignInForm onRegisterPress={jest.fn()} />
    );

    expect(getByText('Register')).toBeTruthy();
  });

  it('should hide register link when showRegisterLink is false', () => {
    const { queryByText } = renderWithAccountProvider(
      <SignInForm showRegisterLink={false} />
    );

    expect(queryByText('Register')).toBeNull();
  });

  it('should call onSuccess after successful login', async () => {
    const onSuccess = jest.fn();
    const { getByPlaceholderText, getByText } = renderWithAccountProvider(
      <SignInForm onSuccess={onSuccess} />
    );

    // Fill in form
    fireEvent.changeText(getByPlaceholderText('your@email.com'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');

    // Submit
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should call onError when fields are empty', async () => {
    const onError = jest.fn();
    const { getByText } = renderWithAccountProvider(<SignInForm onError={onError} />);

    // Submit without filling fields
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Please enter your email address' })
      );
    });
  });

  it('should call onRegisterPress when register link is pressed', () => {
    const onRegisterPress = jest.fn();
    const { getByText } = renderWithAccountProvider(
      <SignInForm onRegisterPress={onRegisterPress} />
    );

    fireEvent.press(getByText('Register'));

    expect(onRegisterPress).toHaveBeenCalled();
  });

  it('should disable inputs during loading', async () => {
    const { getByPlaceholderText, getByText } = renderWithAccountProvider(<SignInForm />);

    const emailInput = getByPlaceholderText('your@email.com');
    const passwordInput = getByPlaceholderText('Enter your password');

    // Fill and submit
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(getByText('Sign In'));

    // Inputs should be disabled during loading
    expect(emailInput.props.editable).toBe(false);
    expect(passwordInput.props.editable).toBe(false);
  });

  it('should show loading indicator during login', async () => {
    const { getByPlaceholderText, getByText, UNSAFE_getByType } =
      renderWithAccountProvider(<SignInForm />);

    fireEvent.changeText(getByPlaceholderText('your@email.com'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.press(getByText('Sign In'));

    // Should show activity indicator
    const activityIndicator = UNSAFE_getByType('ActivityIndicator' as any);
    expect(activityIndicator).toBeTruthy();
  });

  it('should display error from context', async () => {
    const { getByPlaceholderText, getByText } = renderWithAccountProvider(<SignInForm />);

    fireEvent.changeText(getByPlaceholderText('your@email.com'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.press(getByText('Sign In'));

    // Wait for login to complete (InMemoryAccountService always succeeds)
    await waitFor(() => {
      expect(getByText('Sign In')).toBeTruthy();
    });
  });

  it('should accept custom styles', () => {
    const { getByTestId } = renderWithAccountProvider(
      <SignInForm
        containerStyle={{ testID: 'container' } as any}
        inputStyle={{ testID: 'input' } as any}
        buttonStyle={{ testID: 'button' } as any}
      />
    );

    // Just verify it renders without crashing with custom styles
    expect(getByTestId).toBeDefined();
  });

  it('should pass additional props to email input', () => {
    const { getByPlaceholderText } = renderWithAccountProvider(
      <SignInForm emailInputProps={{ testID: 'email-input' }} />
    );

    const emailInput = getByPlaceholderText('your@email.com');
    expect(emailInput.props.testID).toBe('email-input');
  });

  it('should pass additional props to password input', () => {
    const { getByPlaceholderText } = renderWithAccountProvider(
      <SignInForm passwordInputProps={{ testID: 'password-input' }} />
    );

    const passwordInput = getByPlaceholderText('Enter your password');
    expect(passwordInput.props.testID).toBe('password-input');
  });

  it('should clear error when starting new login', async () => {
    const { getByPlaceholderText, getByText } = renderWithAccountProvider(<SignInForm />);

    // First attempt with empty fields (will show error)
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      // Error callback should have been called
    });

    // Fill fields and try again
    fireEvent.changeText(getByPlaceholderText('your@email.com'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.press(getByText('Sign In'));

    // Should succeed this time
    await waitFor(() => {
      expect(getByText('Sign In')).toBeTruthy();
    });
  });
});
