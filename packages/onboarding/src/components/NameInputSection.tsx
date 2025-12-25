import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { NameInputSectionProps } from '../types';
import { INPUT_COLORS } from '../constants';

/**
 * Name input section with first and last name fields.
 *
 * @example
 * ```tsx
 * <NameInputSection
 *   givenName={givenName}
 *   familyName={familyName}
 *   onGivenNameChange={setGivenName}
 *   onFamilyNameChange={setFamilyName}
 *   isDark={colorScheme === 'dark'}
 * />
 * ```
 */
export function NameInputSection({
  givenName,
  familyName,
  onGivenNameChange,
  onFamilyNameChange,
  isDark = false,
  givenNameLabel = 'First Name *',
  familyNameLabel = 'Last Name *',
  givenNamePlaceholder = 'Enter your first name',
  familyNamePlaceholder = 'Enter your last name',
  style,
}: NameInputSectionProps) {
  const inputBgColor = isDark ? INPUT_COLORS.backgroundDark : INPUT_COLORS.backgroundLight;
  const inputTextColor = isDark ? '#fff' : '#000';
  const borderColor = isDark ? INPUT_COLORS.borderDark : INPUT_COLORS.borderLight;
  const placeholderColor = isDark ? INPUT_COLORS.placeholderDark : INPUT_COLORS.placeholderLight;
  const labelColor = isDark ? '#fff' : '#000';

  return (
    <View style={style}>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: labelColor }]}>{givenNameLabel}</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: inputBgColor,
              color: inputTextColor,
              borderColor: borderColor,
            },
          ]}
          placeholder={givenNamePlaceholder}
          placeholderTextColor={placeholderColor}
          value={givenName}
          onChangeText={onGivenNameChange}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: labelColor }]}>{familyNameLabel}</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: inputBgColor,
              color: inputTextColor,
              borderColor: borderColor,
            },
          ]}
          placeholder={familyNamePlaceholder}
          placeholderTextColor={placeholderColor}
          value={familyName}
          onChangeText={onFamilyNameChange}
          autoCapitalize="words"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    opacity: 0.8,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
});
