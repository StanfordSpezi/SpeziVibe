import { Platform } from 'react-native';

/**
 * Haptic feedback utilities for mobile interactions
 * Provides consistent tactile feedback across iOS and Android
 *
 * Note: This is a no-op implementation. To enable haptics:
 *
 * Option 1: Using Expo (recommended for Expo projects)
 * - Install: expo install expo-haptics
 * - Import: import * as Haptics from 'expo-haptics';
 * - Use: Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
 *
 * Option 2: Using react-native-haptic-feedback
 * - Install: npm install react-native-haptic-feedback
 * - Import: import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
 * - Use: ReactNativeHapticFeedback.trigger('impactLight')
 */

export const triggerHaptic = {
  /**
   * Light impact feedback
   * Use for: Scale/Boolean/Multiple Choice selection
   */
  light: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // TODO: Implement with expo-haptics or react-native-haptic-feedback
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  /**
   * Medium impact feedback
   * Use for: Submit button press
   */
  medium: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // TODO: Implement with expo-haptics or react-native-haptic-feedback
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  /**
   * Heavy impact feedback
   * Use for: Cancel with confirmation
   */
  heavy: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // TODO: Implement with expo-haptics or react-native-haptic-feedback
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  /**
   * Success notification feedback
   * Use for: Completion screen
   */
  success: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // TODO: Implement with expo-haptics or react-native-haptic-feedback
      // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },

  /**
   * Error notification feedback
   * Use for: Validation errors
   */
  error: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // TODO: Implement with expo-haptics or react-native-haptic-feedback
      // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },

  /**
   * Selection feedback
   * Use for: Toggle or selection change
   */
  selection: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // TODO: Implement with expo-haptics or react-native-haptic-feedback
      // Haptics.selectionAsync();
    }
  },
};
