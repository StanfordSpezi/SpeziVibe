import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Alert from '@blazejkustra/react-native-alert';
import { router } from 'expo-router';
import {
  NameInputSection,
  ConsentCheckbox,
  OnboardingButton,
  ConsentService,
} from '@spezivibe/onboarding';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing } from '@/constants/theme';

export default function ConsentScreen() {
  const buttonBackground = useThemeColor({}, 'buttonBackground');
  const buttonText = useThemeColor({}, 'buttonText');
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleAgree = async () => {
    if (!givenName.trim() || !familyName.trim()) {
      Alert.alert('Required Fields', 'Please enter your first and last name.');
      return;
    }

    if (!agreed) {
      Alert.alert('Consent Required', 'Please check the box to agree to the terms.');
      return;
    }

    try {
      const consentData = ConsentService.createConsentData(givenName, familyName, true);
      await ConsentService.saveConsent(consentData);
      router.push('/(onboarding)/get-started');
    } catch {
      Alert.alert('Error', 'Failed to save consent. Please try again.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Informed Consent
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Please review the following information and provide your consent
          </ThemedText>
        </View>

        <View style={styles.consentDocument}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Study Overview
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            You are being asked to participate in a wellness study using the SpeziVibe application.
            This study aims to help you track and improve your overall well-being through daily
            activities and reflections.
          </ThemedText>

          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            What You&apos;ll Do
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            • Complete daily wellness check-ins and mood assessments{'\n'}
            • Track your exercise and mindfulness activities{'\n'}
            • Reflect on your progress weekly{'\n'}
            • Receive personalized insights based on your data
          </ThemedText>

          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Your Privacy
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            Your data will be stored securely on your device. We do not share your personal
            information with third parties. You can withdraw from the study at any time by
            uninstalling the application.
          </ThemedText>

          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Time Commitment
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            Participation requires approximately 10-15 minutes per day for completing scheduled
            tasks and activities.
          </ThemedText>

          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Contact Information
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            If you have questions about this study, please contact the research team through the
            Contacts section of the app.
          </ThemedText>
        </View>

        <View style={styles.signatureSection}>
          <ThemedText type="defaultSemiBold" style={styles.signatureTitle}>
            Your Information
          </ThemedText>

          <NameInputSection
            givenName={givenName}
            familyName={familyName}
            onGivenNameChange={setGivenName}
            onFamilyNameChange={setFamilyName}
          />

          <ConsentCheckbox
            checked={agreed}
            onToggle={() => setAgreed(!agreed)}
            label="I have read and agree to the terms described above. I consent to participate in this wellness study."
            colors={{ primaryLight: buttonBackground, primaryDark: buttonBackground, inactiveLight: '#ccc', inactiveDark: '#666' }}
            renderCheckmark={(color) => (
              <IconSymbol name="checkmark" size={16} color={color} />
            )}
          />

          <ThemedText style={styles.dateText}>
            Date: {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </ThemedText>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <OnboardingButton
          label="Agree & Continue"
          onPress={handleAgree}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: Spacing.screenTop,
    paddingBottom: Spacing.screenHorizontal,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.7,
    lineHeight: 21,
  },
  consentDocument: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  signatureSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  signatureTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 13,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  footer: {
    padding: 24,
    paddingBottom: 48,
  },
});
