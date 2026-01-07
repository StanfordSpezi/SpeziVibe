import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AccountButtonProps {
  onPress: () => void;
}

/**
 * AccountButton - A toolbar button that opens the account modal
 */
export function AccountButton({ onPress }: AccountButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { opacity: pressed ? 0.5 : 1 },
      ]}
      accessibilityLabel="Your Account"
      accessibilityRole="button"
      accessibilityHint="Opens account settings and profile"
    >
      <Ionicons
        name="person-circle-outline"
        size={28}
        color={isDark ? '#fff' : '#8C1515'}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});
