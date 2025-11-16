import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
  Pressable,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAccount } from '../hooks/useAccount';
import { Sex } from '../types';

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
    options: Array<{ label: string; value: string }>;
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

  // Check which fields are required based on configuration
  const isNameRequired = configuration?.required?.includes('name') ?? false;
  const isDateOfBirthRequired = configuration?.required?.includes('dateOfBirth') ?? false;
  const isSexRequired = configuration?.required?.includes('sex') ?? false;

  // Split existing name into first and last if it exists
  const nameParts = user?.name?.split(' ') || ['', ''];
  const existingFirstName = nameParts[0] || '';
  const existingLastName = nameParts.slice(1).join(' ') || '';

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
      // Combine first and last name
      const fullName = showFirstName && showLastName
        ? `${firstName.trim()} ${lastName.trim()}`
        : showFirstName
        ? firstName.trim()
        : lastName.trim();

      await updateProfile({
        name: fullName,
        dateOfBirth: showDateOfBirth ? dateOfBirth : undefined,
        sex: showSex ? sex.trim() : undefined,
      });

      onSuccess?.();
    } catch (err: any) {
      onError?.(err);
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
            style={[styles.input, styles.pickerButton, inputStyle]}
            onPress={() => setShowDatePicker(true)}
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
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setDateOfBirth(selectedDate);
                }
              }}
              maximumDate={new Date()}
            />
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
              style={[styles.input, styles.pickerButton, inputStyle]}
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
