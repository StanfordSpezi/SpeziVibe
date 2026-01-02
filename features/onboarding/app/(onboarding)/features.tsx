import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import {
  PaginationDots,
  FeatureCard,
  OnboardingButton,
} from '@spezivibe/onboarding';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing } from '@/constants/theme';

interface FeatureItem {
  icon: IconSymbolName;
  title: string;
  description: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: 'sparkles',
    title: 'Personalized Experience',
    description:
      'SpeziVibe adapts to your unique wellness journey. Track what matters most to you with customizable metrics and goals.',
  },
  {
    icon: 'lock.shield.fill',
    title: 'Privacy First',
    description:
      'Your data stays yours. We use industry-leading encryption and never share your personal information with third parties.',
  },
  {
    icon: 'star.fill',
    title: 'Evidence-Based',
    description:
      'Built on scientific research and best practices in digital health. Trust the insights that help you make informed decisions.',
  },
];

export default function FeaturesScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const buttonBackground = useThemeColor({}, 'buttonBackground');
  const buttonText = useThemeColor({}, 'buttonText');

  const isLastStep = currentStep === FEATURES.length - 1;
  const feature = FEATURES[currentStep];

  const handleNext = () => {
    if (isLastStep) {
      router.push('/(onboarding)/consent');
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    router.push('/(onboarding)/consent');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.skipContainer}>
        <Pressable
          onPress={handleSkip}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          accessibilityRole="button"
          accessibilityLabel="Skip feature overview">
          <ThemedText style={styles.skipText}>Skip</ThemedText>
        </Pressable>
      </View>

      <View style={styles.content}>
        <FeatureCard
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          colors={{ primaryLight: buttonBackground, primaryDark: buttonBackground, inactiveLight: '#ccc', inactiveDark: '#666' }}
          renderIcon={(name, size, color) => (
            <IconSymbol name={name as IconSymbolName} size={size} color={color} />
          )}
        />

        <PaginationDots
          total={FEATURES.length}
          current={currentStep}
          colors={{ primaryLight: buttonBackground, primaryDark: buttonBackground, inactiveLight: '#ccc', inactiveDark: '#666' }}
        />
      </View>

      <View style={styles.footer}>
        <OnboardingButton
          label={isLastStep ? 'Get Started' : 'Continue'}
          onPress={handleNext}
          style={{ backgroundColor: buttonBackground }}
          labelStyle={{ color: buttonText }}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: Spacing.screenTop,
  },
  skipText: {
    fontSize: 17,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  footer: {
    padding: 24,
    paddingBottom: 48,
  },
});
