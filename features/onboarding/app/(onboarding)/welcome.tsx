import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

export default function WelcomeScreen() {
  const buttonBackground = useThemeColor({}, 'buttonBackground');
  const buttonText = useThemeColor({}, 'buttonText');

  const features: { icon: IconSymbolName; title: string; description: string }[] = [
    {
      icon: 'heart.fill',
      title: 'Track Your Vibes',
      description: 'Monitor your mood and wellness journey every day',
    },
    {
      icon: 'chart.line.uptrend.xyaxis',
      title: 'Insights & Analytics',
      description: 'Gain meaningful insights from your personal data',
    },
    {
      icon: 'bell.badge.fill',
      title: 'Stay Connected',
      description: 'Get timely reminders and stay engaged with your goals',
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/rocket-logo.png')}
            style={styles.logo}
            contentFit="fill"
          />
        </View>

        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Welcome!
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Your personal wellness companion for a healthier, happier you
          </ThemedText>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={[styles.iconContainer, { backgroundColor: buttonBackground }]}>
                <IconSymbol name={feature.icon} size={28} color={buttonText} />
              </View>
              <View style={styles.featureText}>
                <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
                  {feature.title}
                </ThemedText>
                <ThemedText style={styles.featureDescription}>
                  {feature.description}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: buttonBackground, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={() => router.push('/(onboarding)/features')}
          accessibilityRole="button"
          accessibilityLabel="Continue to learn about features">
          <ThemedText style={[styles.buttonText, { color: buttonText }]}>
            Continue
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
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  header: {
    marginBottom: 48,
    width: '100%',
  },
  title: {
    fontSize: 34,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
  },
  featuresContainer: {
    gap: 24,
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    paddingTop: 4,
  },
  featureTitle: {
    fontSize: 17,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 15,
    opacity: 0.7,
    lineHeight: 21,
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
