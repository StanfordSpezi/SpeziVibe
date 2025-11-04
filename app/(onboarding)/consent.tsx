import { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

const CONSENT_KEY = '@consent_data';

interface ConsentData {
  givenName: string;
  familyName: string;
  consentedAt: string;
  accepted: boolean;
}

export default function ConsentScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
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
      const consentData: ConsentData = {
        givenName: givenName.trim(),
        familyName: familyName.trim(),
        consentedAt: new Date().toISOString(),
        accepted: true,
      };

      await AsyncStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));
      router.push('/(onboarding)/get-started');
    } catch (error) {
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
            What You'll Do
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

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>First Name *</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#1D1D1D' : '#F5F5F5',
                  color: isDark ? '#fff' : '#000',
                  borderColor: isDark ? '#333' : '#E0E0E0',
                },
              ]}
              placeholder="Enter your first name"
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={givenName}
              onChangeText={setGivenName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Last Name *</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#1D1D1D' : '#F5F5F5',
                  color: isDark ? '#fff' : '#000',
                  borderColor: isDark ? '#333' : '#E0E0E0',
                },
              ]}
              placeholder="Enter your last name"
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={familyName}
              onChangeText={setFamilyName}
              autoCapitalize="words"
            />
          </View>

          <Pressable
            style={styles.checkboxContainer}
            onPress={() => setAgreed(!agreed)}>
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: agreed
                    ? isDark
                      ? '#B83A4B'
                      : '#8C1515'
                    : 'transparent',
                  borderColor: isDark ? '#666' : '#999',
                },
              ]}>
              {agreed && (
                <IconSymbol
                  name="checkmark"
                  size={16}
                  color={isDark ? '#000' : '#fff'}
                />
              )}
            </View>
            <ThemedText style={styles.checkboxLabel}>
              I have read and agree to the terms described above. I consent to participate in this
              wellness study.
            </ThemedText>
          </Pressable>

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
        <Pressable
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: isDark ? '#B83A4B' : '#8C1515',
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={handleAgree}>
          <ThemedText style={[styles.buttonText, { color: isDark ? '#000' : '#fff' }]}>
            Agree & Continue
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    opacity: 0.8,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 16,
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
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
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
