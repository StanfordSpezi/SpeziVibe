import React, { useState, useRef, useEffect } from 'react';
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

export interface SignInFormProps {
  /** Callback when sign in is successful */
  onSuccess?: () => void;

  /** Callback when an error occurs */
  onError?: (error: Error) => void;

  /** Custom styles for the container */
  containerStyle?: ViewStyle;

  /** Custom styles for input fields */
  inputStyle?: TextStyle;

  /** Custom styles for the button */
  buttonStyle?: ViewStyle;

  /** Custom styles for button text */
  buttonTextStyle?: TextStyle;

  /** Custom styles for error text */
  errorStyle?: TextStyle;

  /** Button text (default: "Sign In") */
  buttonText?: string;

  /** Show link to register (default: true) */
  showRegisterLink?: boolean;

  /** Callback when register link is pressed */
  onRegisterPress?: () => void;

  /** Additional props for email input */
  emailInputProps?: Partial<TextInputProps>;

  /** Additional props for password input */
  passwordInputProps?: Partial<TextInputProps>;
}

/**
 * SignInForm - A customizable sign-in form component
 *
 * This component provides a ready-to-use sign-in form with email/password inputs.
 * It integrates with the AccountProvider to handle authentication.
 *
 * The component is highly customizable through style props, or you can build
 * your own form using the useAccount hook directly.
 *
 * @example
 * ```tsx
 * import { SignInForm } from '@spezivibe/account';
 *
 * function LoginScreen() {
 *   return (
 *     <SignInForm
 *       onSuccess={() => navigation.navigate('Home')}
 *       onError={(error) => alert(error.message)}
 *       buttonStyle={{ backgroundColor: '#007AFF' }}
 *     />
 *   );
 * }
 * ```
 */
export function SignInForm({
  onSuccess,
  onError,
  containerStyle,
  inputStyle,
  buttonStyle,
  buttonTextStyle,
  errorStyle,
  buttonText = 'Sign In',
  showRegisterLink = true,
  onRegisterPress,
  emailInputProps,
  passwordInputProps,
}: SignInFormProps) {
  const { login, isLoading, error, clearError } = useAccount();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  // Clear any errors from previous screens on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSignIn = async () => {
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

    // Validate password
    if (!password) {
      const error = new Error('Please enter your password');
      setValidationError(error.message);
      onError?.(error);
      passwordInputRef.current?.focus();
      return;
    }

    try {
      clearError();
      setValidationError(null);
      const normalizedEmail = normalizeEmail(email);
      await login(normalizedEmail, password);
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

  const handlePasswordChange = (text: string) => {
    setPassword(text); // Don't sanitize passwords
    if (validationError) {
      setValidationError(null);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
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
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          editable={!isLoading}
          accessibilityLabel="Email address"
          accessibilityHint="Enter your email address to sign in"
          accessibilityRole="none"
          {...emailInputProps}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            ref={passwordInputRef}
            style={[styles.input, styles.passwordInput, inputStyle]}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry={!showPassword}
            textContentType="password"
            autoComplete="password"
            returnKeyType="go"
            onSubmitEditing={handleSignIn}
            editable={!isLoading}
            accessibilityLabel="Password"
            accessibilityHint="Enter your password to sign in"
            accessibilityRole="none"
            {...passwordInputProps}
          />
          <TouchableOpacity
            style={styles.visibilityToggle}
            onPress={() => setShowPassword(!showPassword)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            accessibilityHint="Double tap to toggle password visibility"
          >
            <Text style={styles.visibilityToggleText}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>
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
        onPress={handleSignIn}
        disabled={isLoading}
        accessibilityRole="button"
        accessibilityLabel={buttonText}
        accessibilityHint="Double tap to sign in"
        accessibilityState={{ disabled: isLoading, busy: isLoading }}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" accessibilityLabel="Signing in" />
        ) : (
          <Text style={[styles.buttonText, buttonTextStyle]}>{buttonText}</Text>
        )}
      </TouchableOpacity>

      {showRegisterLink && onRegisterPress && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <TouchableOpacity
            onPress={onRegisterPress}
            accessibilityRole="button"
            accessibilityLabel="Register"
            accessibilityHint="Double tap to create a new account"
          >
            <Text style={styles.link}>Register</Text>
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
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 70,
  },
  visibilityToggle: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  visibilityToggleText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
});
