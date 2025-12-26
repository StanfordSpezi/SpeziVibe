import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { getErrorMessage, toError } from '../utils/errors';
import { useAccount } from '../hooks/useAccount';
import { validatePasswordStrength } from '../utils/validation';

export interface ChangePasswordFormProps {
  /** Callback when password change is successful */
  onSuccess?: () => void;

  /** Callback when an error occurs */
  onError?: (error: Error) => void;

  /** Custom styles for the container */
  containerStyle?: ViewStyle;

  /** Custom styles for input fields */
  inputStyle?: TextStyle;

  /** Custom styles for labels */
  labelStyle?: TextStyle;

  /** Custom styles for the button */
  buttonStyle?: ViewStyle;

  /** Custom styles for button text */
  buttonTextStyle?: TextStyle;

  /** Custom styles for error text */
  errorStyle?: TextStyle;

  /** Button text (default: "Change Password") */
  buttonText?: string;

  /** Show password requirements (default: true) */
  showRequirements?: boolean;

  /** Custom password validation function */
  validatePassword?: (password: string) => { valid: boolean; message?: string };
}

/**
 * ChangePasswordForm - A customizable password change form component
 *
 * This component provides a ready-to-use form for changing user passwords.
 * It integrates with the AccountProvider to handle password updates.
 *
 * @example
 * ```tsx
 * import { ChangePasswordForm } from '@spezivibe/account';
 *
 * function ChangePasswordScreen() {
 *   return (
 *     <ChangePasswordForm
 *       onSuccess={() => {
 *         alert('Password changed successfully');
 *         navigation.goBack();
 *       }}
 *       onError={(error) => alert(error.message)}
 *       buttonStyle={{ backgroundColor: '#007AFF' }}
 *     />
 *   );
 * }
 * ```
 */
export function ChangePasswordForm({
  onSuccess,
  onError,
  containerStyle,
  inputStyle,
  labelStyle,
  buttonStyle,
  buttonTextStyle,
  errorStyle,
  buttonText = 'Change Password',
  showRequirements = true,
  validatePassword: customValidatePassword,
}: ChangePasswordFormProps) {
  const { updatePassword, isLoading } = useAccount();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChangePassword = async () => {
    setValidationError(null);

    // Validation
    if (!currentPassword.trim()) {
      const error = new Error('Please enter your current password');
      setValidationError(error.message);
      onError?.(error);
      return;
    }

    if (!newPassword.trim()) {
      const error = new Error('Please enter a new password');
      setValidationError(error.message);
      onError?.(error);
      return;
    }

    if (newPassword !== confirmPassword) {
      const error = new Error('New passwords do not match');
      setValidationError(error.message);
      onError?.(error);
      return;
    }

    if (currentPassword === newPassword) {
      const error = new Error('New password must be different from current password');
      setValidationError(error.message);
      onError?.(error);
      return;
    }

    // Password strength validation
    const validation = customValidatePassword
      ? customValidatePassword(newPassword)
      : validatePasswordStrength(newPassword);

    if (!validation.valid) {
      const error = new Error(validation.message || 'Password does not meet requirements');
      setValidationError(validation.message || 'Password does not meet requirements');
      onError?.(error);
      return;
    }

    // Check if updatePassword is available
    if (!updatePassword) {
      const error = new Error('Password change is not supported with the current authentication method');
      setValidationError(error.message);
      onError?.(error);
      return;
    }

    try {
      await updatePassword(currentPassword, newPassword);

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      setValidationError(errorMessage);
      onError?.(toError(err));
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, labelStyle]}>Current Password *</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput, inputStyle]}
            value={currentPassword}
            onChangeText={(text) => {
              setCurrentPassword(text);
              if (validationError) setValidationError(null);
            }}
            placeholder="Enter current password"
            secureTextEntry={!showCurrentPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
            accessibilityLabel="Current Password"
            accessibilityRole="none"
          />
          <TouchableOpacity
            style={styles.visibilityToggle}
            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            accessibilityRole="button"
            accessibilityLabel={showCurrentPassword ? 'Hide password' : 'Show password'}
          >
            <Text style={styles.visibilityToggleText}>
              {showCurrentPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, labelStyle]}>New Password *</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput, inputStyle]}
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (validationError) setValidationError(null);
            }}
            placeholder="Enter new password"
            secureTextEntry={!showNewPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
            accessibilityLabel="New Password"
            accessibilityRole="none"
          />
          <TouchableOpacity
            style={styles.visibilityToggle}
            onPress={() => setShowNewPassword(!showNewPassword)}
            accessibilityRole="button"
            accessibilityLabel={showNewPassword ? 'Hide password' : 'Show password'}
          >
            <Text style={styles.visibilityToggleText}>
              {showNewPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, labelStyle]}>Confirm New Password *</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput, inputStyle]}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (validationError) setValidationError(null);
            }}
            placeholder="Re-enter new password"
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
            accessibilityLabel="Confirm New Password"
            accessibilityRole="none"
          />
          <TouchableOpacity
            style={styles.visibilityToggle}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            accessibilityRole="button"
            accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            <Text style={styles.visibilityToggleText}>
              {showConfirmPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {validationError && (
        <Text
          style={[styles.error, errorStyle]}
          accessibilityRole="alert"
        >
          {validationError}
        </Text>
      )}

      {showRequirements && (
        <View style={styles.requirements}>
          <Text style={[styles.requirementsTitle, labelStyle]}>Password Requirements:</Text>
          <Text style={styles.requirement}>• At least 8 characters</Text>
          <Text style={styles.requirement}>• One uppercase letter</Text>
          <Text style={styles.requirement}>• One lowercase letter</Text>
          <Text style={styles.requirement}>• One number</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, buttonStyle, isLoading && styles.buttonDisabled]}
        onPress={handleChangePassword}
        disabled={isLoading}
        accessibilityRole="button"
        accessibilityLabel={buttonText}
        accessibilityState={{ disabled: isLoading, busy: isLoading }}
      >
        <Text style={[styles.buttonText, buttonTextStyle]}>
          {isLoading ? 'Changing Password...' : buttonText}
        </Text>
      </TouchableOpacity>
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
  passwordContainer: {
    position: 'relative',
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
  error: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 10,
  },
  requirements: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  requirement: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
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
});
