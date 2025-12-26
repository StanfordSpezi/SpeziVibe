import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { useAccount } from '../hooks/useAccount';
import { validateEmail, normalizeEmail, sanitizeInput } from '../utils/validation';
import { toError } from '../utils/errors';

export interface PasswordResetFormProps {
  /** Callback when password reset email is sent successfully */
  onSuccess?: () => void;

  /** Callback when an error occurs */
  onError?: (error: Error) => void;

  /** Custom styles for the container */
  containerStyle?: ViewStyle;

  /** Custom styles for input field */
  inputStyle?: TextStyle;

  /** Custom styles for the button */
  buttonStyle?: ViewStyle;

  /** Custom styles for button text */
  buttonTextStyle?: TextStyle;

  /** Custom styles for error text */
  errorStyle?: TextStyle;

  /** Custom styles for success message */
  successStyle?: TextStyle;

  /** Button text (default: "Send Reset Email") */
  buttonText?: string;

  /** Success message (default: "Password reset email sent! Check your inbox.") */
  successMessage?: string;

  /** Show back to login link (default: true) */
  showBackToLogin?: boolean;

  /** Callback when back to login is pressed */
  onBackToLogin?: () => void;

  /** Additional props for email input */
  emailInputProps?: Partial<TextInputProps>;
}

/**
 * PasswordResetForm - A password reset form component
 *
 * Provides a ready-to-use form for requesting password reset emails.
 *
 * @example
 * ```tsx
 * import { PasswordResetForm } from '@spezivibe/account';
 *
 * function ResetPasswordScreen() {
 *   return (
 *     <PasswordResetForm
 *       onSuccess={() => navigation.navigate('Login')}
 *       onError={(error) => alert(error.message)}
 *     />
 *   );
 * }
 * ```
 */
export function PasswordResetForm({
  onSuccess,
  onError,
  containerStyle,
  inputStyle,
  buttonStyle,
  buttonTextStyle,
  errorStyle,
  successStyle,
  buttonText = 'Send Reset Email',
  successMessage = 'Password reset email sent! Check your inbox.',
  showBackToLogin = true,
  onBackToLogin,
  emailInputProps,
}: PasswordResetFormProps) {
  const { resetPassword, isLoading, error, clearError } = useAccount();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const emailInputRef = useRef<TextInput>(null);

  const handleResetPassword = async () => {
    // Clear previous errors
    setValidationError(null);

    // Validate email
    if (!email) {
      const error = new Error('Please enter your email address');
      setValidationError(error.message);
      onError?.(error);
      emailInputRef.current?.focus();
      return;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      const error = new Error(emailValidation.message);
      setValidationError(emailValidation.message || 'Invalid email');
      onError?.(error);
      emailInputRef.current?.focus();
      return;
    }

    try {
      clearError();
      setValidationError(null);
      setSuccess(false);
      const normalizedEmail = normalizeEmail(email);
      await resetPassword(normalizedEmail);
      setSuccess(true);
      onSuccess?.();
    } catch (err: unknown) {
      onError?.(toError(err));
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(sanitizeInput(text));
    if (validationError) {
      setValidationError(null);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {!success ? (
        <>
          <Text style={styles.description}>
            Enter your email address and we&apos;ll send you a link to reset your password.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              ref={emailInputRef}
              style={[styles.input, inputStyle]}
              placeholder="your@email.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={handleEmailChange}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              returnKeyType="send"
              onSubmitEditing={handleResetPassword}
              editable={!isLoading}
              accessibilityLabel="Email address"
              accessibilityHint="Enter your email to receive a password reset link"
              accessibilityRole="none"
              {...emailInputProps}
            />
          </View>

          {(error || validationError) && (
            <Text
              style={[styles.error, errorStyle]}
              accessibilityRole="alert"
            >
              {validationError || error}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.button, buttonStyle, isLoading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel={buttonText}
            accessibilityHint="Double tap to send password reset email"
            accessibilityState={{ disabled: isLoading, busy: isLoading }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" accessibilityLabel="Sending reset email" />
            ) : (
              <Text style={[styles.buttonText, buttonTextStyle]}>{buttonText}</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.successContainer}>
          <Text
            style={[styles.success, successStyle]}
            accessibilityRole="alert"
          >
            {successMessage}
          </Text>
        </View>
      )}

      {showBackToLogin && onBackToLogin && (
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={onBackToLogin}
            accessibilityRole="button"
            accessibilityLabel="Back to Login"
            accessibilityHint="Double tap to return to login screen"
          >
            <Text style={styles.link}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 10,
  },
  successContainer: {
    padding: 20,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    marginBottom: 20,
  },
  success: {
    color: '#2E7D32',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
});
