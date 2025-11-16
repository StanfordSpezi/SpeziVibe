import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function GetStartedScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleGetStarted = () => {
    // Don't mark onboarding complete yet - auth is part of onboarding
    router.push('/(onboarding)/register');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.successCircle, { backgroundColor: isDark ? '#B83A4B' : '#8C1515' }]}>
          <IconSymbol name="checkmark.circle.fill" size={80} color={isDark ? '#000' : '#fff'} />
        </View>

        <View style={styles.textContainer}>
          <ThemedText type="title" style={styles.title}>
            You're All Set!
          </ThemedText>
          <ThemedText style={styles.description}>
            Ready to begin your wellness journey? Let's make every day count together.
          </ThemedText>
        </View>

        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <IconSymbol name="checkmark.circle.fill" size={20} color={isDark ? '#B83A4B' : '#8C1515'} />
            <ThemedText style={styles.benefitText}>Track your daily progress</ThemedText>
          </View>
          <View style={styles.benefitItem}>
            <IconSymbol name="checkmark.circle.fill" size={20} color={isDark ? '#B83A4B' : '#8C1515'} />
            <ThemedText style={styles.benefitText}>Get personalized insights</ThemedText>
          </View>
          <View style={styles.benefitItem}>
            <IconSymbol name="checkmark.circle.fill" size={20} color={isDark ? '#B83A4B' : '#8C1515'} />
            <ThemedText style={styles.benefitText}>Achieve your wellness goals</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: isDark ? '#B83A4B' : '#8C1515', opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={handleGetStarted}>
          <ThemedText style={[styles.buttonText, { color: isDark ? '#000' : '#fff' }]}>
            Get Started
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  successCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 17,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
  },
  benefitsContainer: {
    gap: 16,
    width: '100%',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 16,
    opacity: 0.8,
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
