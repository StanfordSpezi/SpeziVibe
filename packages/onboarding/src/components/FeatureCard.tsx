import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { FeatureCardProps } from '../types';
import { DEFAULT_COLORS } from '../constants';

/**
 * Card component for displaying a feature during onboarding.
 *
 * @example
 * ```tsx
 * <FeatureCard
 *   icon="sparkles"
 *   title="Personalized Experience"
 *   description="SpeziVibe adapts to your unique wellness journey."
 *   isDark={colorScheme === 'dark'}
 *   renderIcon={(name, size, color) => (
 *     <IconSymbol name={name} size={size} color={color} />
 *   )}
 * />
 * ```
 */
export function FeatureCard({
  icon,
  title,
  description,
  isDark = false,
  colors = DEFAULT_COLORS,
  renderIcon,
  style,
  titleStyle,
  descriptionStyle,
}: FeatureCardProps) {
  const { width } = useWindowDimensions();
  const iconColor = isDark ? '#000' : '#fff';
  const iconBgColor = isDark ? colors.primaryDark : colors.primaryLight;
  const textColor = isDark ? '#fff' : '#000';

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
        {renderIcon ? (
          renderIcon(icon, 64, iconColor)
        ) : (
          <Text style={[styles.iconPlaceholder, { color: iconColor }]}>{icon}</Text>
        )}
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: textColor }, titleStyle]}>{title}</Text>
        <Text style={[styles.description, { color: textColor, maxWidth: width - 64 }, descriptionStyle]}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  iconPlaceholder: {
    fontSize: 32,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 17,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
  },
});
