import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { OnboardingButtonProps } from '../types';
import { DEFAULT_COLORS } from '../constants';

/**
 * Primary button component for onboarding flows.
 *
 * @example
 * ```tsx
 * <OnboardingButton
 *   label="Continue"
 *   onPress={handleNext}
 *   isDark={colorScheme === 'dark'}
 * />
 * ```
 */
export function OnboardingButton({
  label,
  onPress,
  isDark = false,
  colors = DEFAULT_COLORS,
  disabled = false,
  style,
  labelStyle,
}: OnboardingButtonProps) {
  const bgColor = isDark ? colors.primaryDark : colors.primaryLight;
  const textColor = isDark ? '#000' : '#fff';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bgColor,
          opacity: pressed ? 0.8 : disabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}>
      <Text style={[styles.buttonText, { color: textColor }, labelStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
