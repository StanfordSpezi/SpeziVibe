import { useState } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

const FEATURES = [
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
        <Pressable onPress={handleSkip} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
          <ThemedText style={styles.skipText}>Skip</ThemedText>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: isDark ? '#B83A4B' : '#8C1515' }]}>
          <IconSymbol name={feature.icon} size={64} color={isDark ? '#000' : '#fff'} />
        </View>

        <View style={styles.textContainer}>
          <ThemedText type="title" style={styles.title}>
            {feature.title}
          </ThemedText>
          <ThemedText style={styles.description}>{feature.description}</ThemedText>
        </View>

        <View style={styles.pagination}>
          {FEATURES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                {
                  backgroundColor: index === currentStep
                    ? (isDark ? '#B83A4B' : '#8C1515')
                    : (isDark ? '#333' : '#ddd'),
                  width: index === currentStep ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: isDark ? '#B83A4B' : '#8C1515', opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={handleNext}>
          <ThemedText style={[styles.buttonText, { color: isDark ? '#000' : '#fff' }]}>
            {isLastStep ? 'Get Started' : 'Continue'}
          </ThemedText>
        </Pressable>
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
    paddingHorizontal: 24,
    paddingTop: 60,
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
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 17,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
    maxWidth: width - 64,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
  footer: {
    padding: 24,
    paddingBottom: 48,
  },
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
