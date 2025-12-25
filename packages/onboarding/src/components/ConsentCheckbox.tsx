import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ConsentCheckboxProps } from '../types';
import { DEFAULT_COLORS } from '../constants';

/**
 * Checkbox component for consent agreements.
 *
 * @example
 * ```tsx
 * <ConsentCheckbox
 *   checked={agreed}
 *   onToggle={() => setAgreed(!agreed)}
 *   label="I agree to the terms and conditions"
 *   isDark={colorScheme === 'dark'}
 * />
 * ```
 */
export function ConsentCheckbox({
  checked,
  onToggle,
  label,
  isDark = false,
  colors = DEFAULT_COLORS,
  style,
  labelStyle,
  renderCheckmark,
}: ConsentCheckboxProps) {
  const checkboxBgColor = checked
    ? isDark
      ? colors.primaryDark
      : colors.primaryLight
    : 'transparent';
  const checkmarkColor = isDark ? '#000' : '#fff';
  const borderColor = isDark ? '#666' : '#999';
  const textColor = isDark ? '#fff' : '#000';

  return (
    <Pressable style={[styles.container, style]} onPress={onToggle}>
      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: checkboxBgColor,
            borderColor: borderColor,
          },
        ]}>
        {checked &&
          (renderCheckmark ? (
            renderCheckmark(checkmarkColor)
          ) : (
            <Text style={[styles.checkmark, { color: checkmarkColor }]}>✓</Text>
          ))}
      </View>
      <Text style={[styles.label, { color: textColor }, labelStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  label: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});
