import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import DateTimePicker, { DateType } from 'react-native-ui-datepicker';
import { useAccount } from '../hooks/useAccount';
import { Sex, PersonName } from '../types';
import { toError } from '../utils/errors';

export interface EditProfileFormProps {
  /** Callback when profile update is successful */
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

  /** Button text (default: "Save Changes") */
  buttonText?: string;

  /** Show first name field (default: true) */
  showFirstName?: boolean;

  /** Show last name field (default: true) */
  showLastName?: boolean;

  /** Show date of birth field (default: true) */
  showDateOfBirth?: boolean;

  /** Show sex field (default: true) */
  showSex?: boolean;

  /** Render custom picker button */
  renderPickerButton?: (props: {
    label: string;
    value: string;
    onPress: () => void;
    isOpen: boolean;
  }) => React.ReactNode;

  /** Render custom dropdown */
  renderDropdown?: (props: {
    options: { label: string; value: string }[];
    selectedValue: string;
    onSelect: (value: string) => void;
  }) => React.ReactNode;
}

/**
 * EditProfileForm - A customizable profile editing form component
 *
 * This component provides a ready-to-use form for editing user profile
 * information. It integrates with the AccountProvider to handle profile updates.
 *
 * @example
 * ```tsx
 * import { EditProfileForm } from '@spezivibe/account';
 *
 * function EditProfileScreen() {
 *   return (
 *     <EditProfileForm
 *       onSuccess={() => navigation.goBack()}
 *       onError={(error) => alert(error.message)}
 *       buttonStyle={{ backgroundColor: '#007AFF' }}
 *     />
 *   );
 * }
 * ```
 */
export function EditProfileForm({
  onSuccess,
  onError,
  containerStyle,
  inputStyle,
  labelStyle,
  buttonStyle,
  buttonTextStyle,
  buttonText = 'Save Changes',
  showFirstName = true,
  showLastName = true,
  showDateOfBirth = true,
  showSex = true,
  renderPickerButton,
  renderDropdown,
}: EditProfileFormProps) {
  const { user, updateProfile, isLoading, configuration } = useAccount();

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

  // Check which fields are required based on configuration
  const isNameRequired = configuration?.required?.includes('name') ?? false;
  const isDateOfBirthRequired = configuration?.required?.includes('dateOfBirth') ?? false;
  const isSexRequired = configuration?.required?.includes('sex') ?? false;

  // Load existing PersonName components
  const existingFirstName = user?.name?.givenName || '';
  const existingLastName = user?.name?.familyName || '';

  const [firstName, setFirstName] = useState(existingFirstName);
  const [lastName, setLastName] = useState(existingLastName);
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sex, setSex] = useState(user?.sex || '');
  const [showSexPicker, setShowSexPicker] = useState(false);

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

  const handleSave = async () => {
    // Validation based on configuration
    if (isNameRequired && showFirstName && !firstName.trim()) {
      const error = new Error('First name is required');
      onError?.(error);
      return;
    }

    if (isNameRequired && showLastName && !lastName.trim()) {
      const error = new Error('Last name is required');
      onError?.(error);
      return;
    }

    if (isDateOfBirthRequired && showDateOfBirth && !dateOfBirth) {
      const error = new Error('Date of birth is required');
      onError?.(error);
      return;
    }

    if (isSexRequired && showSex && !sex.trim()) {
      const error = new Error('Sex is required');
      onError?.(error);
      return;
    }

    try {
      // Build PersonName object from first and last name
      const name: PersonName = {};
      if (showFirstName && firstName.trim()) {
        name.givenName = firstName.trim();
      }
      if (showLastName && lastName.trim()) {
        name.familyName = lastName.trim();
      }

      await updateProfile({
        name: (name.givenName || name.familyName) ? name : undefined,
        dateOfBirth: showDateOfBirth ? dateOfBirth : undefined,
        sex: showSex ? sex.trim() : undefined,
      });

      onSuccess?.();
    } catch (err: unknown) {
      onError?.(toError(err));
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {showFirstName && (
        <View style={styles.inputContainer}>
          <Text style={[styles.label, labelStyle]}>
            First Name{isNameRequired && ' *'}
          </Text>
          <TextInput
            style={[styles.input, inputStyle]}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            editable={!isLoading}
            accessibilityLabel="First Name"
            accessibilityRole="none"
          />
        </View>
      )}

      {showLastName && (
        <View style={styles.inputContainer}>
          <Text style={[styles.label, labelStyle]}>
            Last Name{isNameRequired && ' *'}
          </Text>
          <TextInput
            style={[styles.input, inputStyle]}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
            editable={!isLoading}
            accessibilityLabel="Last Name"
            accessibilityRole="none"
          />
        </View>
      )}

      {showDateOfBirth && (
        <View style={styles.inputContainer}>
          <Text style={[styles.label, labelStyle]}>
            Date of Birth{isDateOfBirthRequired && ' *'}
          </Text>
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

      {showSex && (
        <View style={styles.inputContainer}>
          <Text style={[styles.label, labelStyle]}>
            Sex{isSexRequired && ' *'}
          </Text>
          {renderPickerButton ? (
            renderPickerButton({
              label: getSexLabel(sex),
              value: sex,
              onPress: () => setShowSexPicker(!showSexPicker),
              isOpen: showSexPicker,
            })
          ) : (
            <Pressable
              style={[styles.input, styles.pickerButton, pickerButtonInputStyle]}
              onPress={() => setShowSexPicker(!showSexPicker)}
              accessibilityLabel="Sex"
              accessibilityRole="button"
            >
              <Text style={styles.pickerButtonText}>{getSexLabel(sex)}</Text>
              <Text style={styles.chevron}>{showSexPicker ? '▲' : '▼'}</Text>
            </Pressable>
          )}

          {showSexPicker && (
            renderDropdown ? (
              renderDropdown({
                options: sexOptions,
                selectedValue: sex,
                onSelect: handleSelectSex,
              })
            ) : (
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
            )
          )}
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, buttonStyle, isLoading && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={isLoading}
        accessibilityRole="button"
        accessibilityLabel={buttonText}
        accessibilityState={{ disabled: isLoading, busy: isLoading }}
      >
        <Text style={[styles.buttonText, buttonTextStyle]}>
          {isLoading ? 'Saving...' : buttonText}
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
});
