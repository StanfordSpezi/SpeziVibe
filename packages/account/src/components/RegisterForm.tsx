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
  Pressable,
} from 'react-native';
import DateTimePicker, { DateType } from 'react-native-ui-datepicker';
import { useAccount } from '../hooks/useAccount';
import { validateEmail, validatePasswordStrength, normalizeEmail, sanitizeInput } from '../utils/validation';
import { Sex, PersonName } from '../types';
import { toError } from '../utils/errors';

export interface RegisterFormProps {
  /** Callback when registration is successful */
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

  /** Button text (default: "Register") */
  buttonText?: string;

  /** Minimum password length (default: 6) */
  minPasswordLength?: number;

  /** Show link to sign in (default: true) */
  showSignInLink?: boolean;

  /** Callback when sign in link is pressed */
  onSignInPress?: () => void;

  /** Additional props for email input */
  emailInputProps?: Partial<TextInputProps>;

  /** Additional props for password input */
  passwordInputProps?: Partial<TextInputProps>;

  /** Additional props for confirm password input */
  confirmPasswordInputProps?: Partial<TextInputProps>;
}

/**
 * RegisterForm - A customizable registration form component
 *
 * This component provides a ready-to-use registration form with email/password inputs
 * and password confirmation. It integrates with the AccountProvider to handle account creation.
 *
 * The component includes built-in validation:
 * - All fields are required
 * - Password and confirm password must match
 * - Password must meet minimum length requirement (default: 6 characters)
 *
 * The component is highly customizable through style props, or you can build
 * your own form using the useAccount hook directly.
 *
 * @example
 * ```tsx
 * import { RegisterForm } from '@spezivibe/account';
 *
 * function RegisterScreen() {
 *   return (
 *     <RegisterForm
 *       onSuccess={() => navigation.navigate('Home')}
 *       onError={(error) => alert(error.message)}
 *       buttonStyle={{ backgroundColor: '#007AFF' }}
 *       minPasswordLength={8}
 *     />
 *   );
 * }
 * ```
 */
export function RegisterForm({
  onSuccess,
  onError,
  containerStyle,
  inputStyle,
  buttonStyle,
  buttonTextStyle,
  errorStyle,
  buttonText = 'Register',
  minPasswordLength = 6,
  showSignInLink = true,
  onSignInPress,
  emailInputProps,
  passwordInputProps,
  confirmPasswordInputProps,
}: RegisterFormProps) {
  const { register, isLoading, error, clearError, configuration } = useAccount();

  // Extract ViewStyle-compatible properties from inputStyle for use on Pressable
  // (TextStyle extends ViewStyle, but Pressable only accepts ViewStyle)
  const pickerButtonInputStyle: ViewStyle | undefined = inputStyle
    ? {
        height: inputStyle.height,
        borderWidth: inputStyle.borderWidth,
        borderColor: inputStyle.borderColor,
        borderRadius: inputStyle.borderRadius,
        backgroundColor: inputStyle.backgroundColor,
        paddingHorizontal: inputStyle.paddingHorizontal,
        paddingVertical: inputStyle.paddingVertical,
      }
    : undefined;

  // Check which fields should be collected and which are required
  const collectsName = configuration?.collects?.includes('name') ?? false;
  const collectsDateOfBirth = configuration?.collects?.includes('dateOfBirth') ?? false;
  const collectsSex = configuration?.collects?.includes('sex') ?? false;

  const isNameRequired = configuration?.required?.includes('name') ?? false;
  const isDateOfBirthRequired = configuration?.required?.includes('dateOfBirth') ?? false;
  const isSexRequired = configuration?.required?.includes('sex') ?? false;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Profile fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sex, setSex] = useState('');
  const [showSexPicker, setShowSexPicker] = useState(false);

  // Clear any errors from previous screens on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const firstNameInputRef = useRef<TextInput>(null);
  const lastNameInputRef = useRef<TextInput>(null);

  const sexOptions = [
    { label: 'Male', value: Sex.Male },
    { label: 'Female', value: Sex.Female },
    { label: 'Other', value: Sex.Other },
    { label: 'Prefer not to state', value: Sex.PreferNotToState },
  ];

  const getSexLabel = (value: string) => {
    const option = sexOptions.find(opt => opt.value === value);
    return option ? option.label : 'Select sex';
  };

  const handleSelectSex = (value: string) => {
    setSex(value);
    setShowSexPicker(false);
  };

  const handleRegister = async () => {
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
      const error = new Error('Please enter a password');
      setValidationError(error.message);
      onError?.(error);
      passwordInputRef.current?.focus();
      return;
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      const error = new Error(passwordValidation.message);
      setValidationError(passwordValidation.message || 'Weak password');
      onError?.(error);
      passwordInputRef.current?.focus();
      return;
    }

    // Validate confirm password
    if (!confirmPassword) {
      const error = new Error('Please confirm your password');
      setValidationError(error.message);
      onError?.(error);
      confirmPasswordInputRef.current?.focus();
      return;
    }

    if (password !== confirmPassword) {
      const error = new Error('Passwords do not match');
      setValidationError(error.message);
      onError?.(error);
      confirmPasswordInputRef.current?.focus();
      return;
    }

    // Validate profile fields based on configuration
    if (collectsName && isNameRequired) {
      if (!firstName.trim()) {
        const error = new Error('First name is required');
        setValidationError(error.message);
        onError?.(error);
        firstNameInputRef.current?.focus();
        return;
      }
      if (!lastName.trim()) {
        const error = new Error('Last name is required');
        setValidationError(error.message);
        onError?.(error);
        lastNameInputRef.current?.focus();
        return;
      }
    }

    if (collectsDateOfBirth && isDateOfBirthRequired && !dateOfBirth) {
      const error = new Error('Date of birth is required');
      setValidationError(error.message);
      onError?.(error);
      return;
    }

    if (collectsSex && isSexRequired && !sex.trim()) {
      const error = new Error('Sex is required');
      setValidationError(error.message);
      onError?.(error);
      return;
    }

    try {
      clearError();
      setValidationError(null);
      const normalizedEmail = normalizeEmail(email);

      // Build profile details
      const details: any = {};
      if (collectsName && (firstName.trim() || lastName.trim())) {
        const name: PersonName = {};
        if (firstName.trim()) {
          name.givenName = firstName.trim();
        }
        if (lastName.trim()) {
          name.familyName = lastName.trim();
        }
        details.name = name;
      }
      if (collectsDateOfBirth && dateOfBirth) {
        details.dateOfBirth = dateOfBirth;
      }
      if (collectsSex && sex.trim()) {
        details.sex = sex;
      }

      await register(normalizedEmail, password, details);
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

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text); // Don't sanitize passwords
    if (validationError) {
      setValidationError(null);
    }
  };

  const displayError = validationError || error;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email *</Text>
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
          onSubmitEditing={() => {
            if (collectsName) {
              firstNameInputRef.current?.focus();
            } else {
              passwordInputRef.current?.focus();
            }
          }}
          editable={!isLoading}
          accessibilityLabel="Email address"
          accessibilityHint="Enter your email address to create an account"
          accessibilityRole="none"
          {...emailInputProps}
        />
      </View>

      {collectsName && (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>First Name{isNameRequired && ' *'}</Text>
            <TextInput
              ref={firstNameInputRef}
              style={[styles.input, inputStyle]}
              placeholder="Enter your first name"
              placeholderTextColor="#999"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(sanitizeInput(text));
                if (validationError) setValidationError(null);
              }}
              returnKeyType="next"
              onSubmitEditing={() => lastNameInputRef.current?.focus()}
              editable={!isLoading}
              accessibilityLabel="First Name"
              accessibilityRole="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Last Name{isNameRequired && ' *'}</Text>
            <TextInput
              ref={lastNameInputRef}
              style={[styles.input, inputStyle]}
              placeholder="Enter your last name"
              placeholderTextColor="#999"
              value={lastName}
              onChangeText={(text) => {
                setLastName(sanitizeInput(text));
                if (validationError) setValidationError(null);
              }}
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              editable={!isLoading}
              accessibilityLabel="Last Name"
              accessibilityRole="none"
            />
          </View>
        </>
      )}

      {collectsDateOfBirth && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date of Birth{isDateOfBirthRequired && ' *'}</Text>
          <Pressable
            style={[styles.input, styles.pickerButton, pickerButtonInputStyle]}
            onPress={() => setShowDatePicker(!showDatePicker)}
            accessibilityLabel="Date of Birth"
            accessibilityRole="button"
          >
            <Text style={styles.pickerButtonText}>
              {dateOfBirth.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.chevron}>{showDatePicker ? '▲' : '▼'}</Text>
          </Pressable>
          {showDatePicker && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                mode="single"
                date={dateOfBirth}
                onChange={(params: { date: DateType }) => {
                  if (params.date) {
                    setDateOfBirth(params.date as Date);
                  }
                }}
                maxDate={new Date()}
              />
            </View>
          )}
        </View>
      )}

      {collectsSex && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Sex{isSexRequired && ' *'}</Text>
          <Pressable
            style={[styles.input, styles.pickerButton, pickerButtonInputStyle]}
            onPress={() => setShowSexPicker(!showSexPicker)}
            accessibilityLabel="Sex"
            accessibilityRole="button"
          >
            <Text style={[styles.pickerButtonText, !sex && styles.placeholder]}>
              {getSexLabel(sex)}
            </Text>
            <Text style={styles.chevron}>{showSexPicker ? '▲' : '▼'}</Text>
          </Pressable>

          {showSexPicker && (
            <View style={styles.dropdown}>
              {sexOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={styles.dropdownItem}
                  onPress={() => handleSelectSex(option.value)}
                >
                  <Text style={styles.dropdownItemText}>{option.label}</Text>
                  {sex === option.value && <Text style={styles.checkmark}>✓</Text>}
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password *</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            ref={passwordInputRef}
            style={[styles.input, styles.passwordInput, inputStyle]}
            placeholder="At least 8 characters with uppercase, lowercase, and number"
            placeholderTextColor="#999"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            autoComplete="password-new"
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
            editable={!isLoading}
            accessibilityLabel="Password"
            accessibilityHint="Enter a strong password with at least 8 characters"
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

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password *</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            ref={confirmPasswordInputRef}
            style={[styles.input, styles.passwordInput, inputStyle]}
            placeholder="Re-enter your password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={handleConfirmPasswordChange}
            secureTextEntry={!showConfirmPassword}
            textContentType="newPassword"
            autoComplete="password-new"
            returnKeyType="go"
            onSubmitEditing={handleRegister}
            editable={!isLoading}
            accessibilityLabel="Confirm password"
            accessibilityHint="Re-enter your password to confirm"
            accessibilityRole="none"
            {...confirmPasswordInputProps}
          />
          <TouchableOpacity
            style={styles.visibilityToggle}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            accessibilityRole="button"
            accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
            accessibilityHint="Double tap to toggle password visibility"
          >
            <Text style={styles.visibilityToggleText}>
              {showConfirmPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {displayError && (
        <Text
          style={[styles.error, errorStyle]}
          accessibilityRole="alert"
        >
          {displayError}
        </Text>
      )}

      <TouchableOpacity
        style={[styles.button, buttonStyle, isLoading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={isLoading}
        accessibilityRole="button"
        accessibilityLabel={buttonText}
        accessibilityHint="Double tap to create your account"
        accessibilityState={{ disabled: isLoading, busy: isLoading }}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" accessibilityLabel="Creating account" />
        ) : (
          <Text style={[styles.buttonText, buttonTextStyle]}>{buttonText}</Text>
        )}
      </TouchableOpacity>

      {showSignInLink && onSignInPress && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={onSignInPress}
            accessibilityRole="button"
            accessibilityLabel="Sign In"
            accessibilityHint="Double tap to sign in to your existing account"
          >
            <Text style={styles.link}>Sign In</Text>
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
  pickerButton: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
  chevron: {
    fontSize: 12,
    color: '#666',
  },
  datePickerContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    padding: 8,
  },
  dropdown: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  checkmark: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
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
