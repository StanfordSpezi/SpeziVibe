import { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Alert from '@blazejkustra/react-native-alert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccount } from '@spezivibe/account';
import { Ionicons } from '@expo/vector-icons';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, resetPassword } = useAccount();

  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleClose = () => router.back();

  const handleSendResetEmail = async () => {
    if (!user?.email) {
      Alert.alert('Error', 'No email address found for your account.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(user.email);
      setEmailSent(true);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to send reset email. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const primaryColor = isDark ? '#B83A4B' : '#8C1515';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#000' : '#f2f2f7' }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Change Password
        </ThemedText>
        <Pressable
          onPress={handleClose}
          style={({ pressed }) => [
            styles.closeButton,
            { opacity: pressed ? 0.5 : 1 },
          ]}
          accessibilityLabel="Close"
          accessibilityRole="button"
        >
          <Ionicons
            name="close"
            size={28}
            color={isDark ? '#fff' : '#000'}
          />
        </Pressable>
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={styles.container}>
          {emailSent ? (
            // Success State
            <>
              <View
                style={[
                  styles.successCard,
                  {
                    backgroundColor: isDark ? 'rgba(52, 199, 89, 0.15)' : 'rgba(52, 199, 89, 0.1)',
                    borderColor: isDark ? 'rgba(52, 199, 89, 0.3)' : 'rgba(52, 199, 89, 0.2)',
                  },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={48}
                  color="#34C759"
                  style={styles.successIcon}
                />
                <ThemedText style={styles.successTitle}>
                  Reset Email Sent
                </ThemedText>
                <ThemedText style={styles.successText}>
                  We've sent a password reset link to:
                </ThemedText>
                <ThemedText style={[styles.emailText, { color: primaryColor }]}>
                  {user?.email}
                </ThemedText>
                <ThemedText style={styles.successInstructions}>
                  Check your email and click the link to set a new password. The link will expire in 1 hour.
                </ThemedText>
              </View>

              <Pressable
                onPress={handleClose}
                style={({ pressed }) => [
                  styles.doneButton,
                  { backgroundColor: primaryColor, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <ThemedText style={styles.doneButtonText}>Done</ThemedText>
              </Pressable>
            </>
          ) : (
            // Initial State
            <>
              {/* Information Card */}
              <View
                style={[
                  styles.infoCard,
                  {
                    backgroundColor: isDark ? 'rgba(184, 58, 75, 0.15)' : 'rgba(140, 21, 21, 0.1)',
                    borderColor: isDark ? 'rgba(184, 58, 75, 0.3)' : 'rgba(140, 21, 21, 0.2)',
                  },
                ]}
              >
                <Ionicons
                  name="mail"
                  size={24}
                  color={primaryColor}
                  style={styles.infoIcon}
                />
                <View style={styles.infoContent}>
                  <ThemedText style={styles.infoTitle}>
                    Email-Based Password Reset
                  </ThemedText>
                  <ThemedText style={styles.infoText}>
                    For security, password changes require email verification. We'll send a reset link to your registered email address.
                  </ThemedText>
                </View>
              </View>

              {/* Email Display */}
              <View style={styles.emailSection}>
                <ThemedText style={styles.emailLabel}>
                  Reset link will be sent to:
                </ThemedText>
                <View
                  style={[
                    styles.emailCard,
                    {
                      backgroundColor: isDark ? '#1c1c1e' : '#fff',
                      borderColor: isDark ? '#333' : '#e0e0e0',
                    },
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={isDark ? '#999' : '#666'}
                  />
                  <ThemedText style={styles.emailValue}>
                    {user?.email || 'No email found'}
                  </ThemedText>
                </View>
              </View>

              {/* How it works */}
              <View style={styles.stepsSection}>
                <ThemedText style={styles.stepsTitle}>How it works:</ThemedText>
                <View style={styles.step}>
                  <View style={[styles.stepNumber, { backgroundColor: primaryColor }]}>
                    <ThemedText style={styles.stepNumberText}>1</ThemedText>
                  </View>
                  <ThemedText style={styles.stepText}>
                    Click "Send Reset Email" below
                  </ThemedText>
                </View>
                <View style={styles.step}>
                  <View style={[styles.stepNumber, { backgroundColor: primaryColor }]}>
                    <ThemedText style={styles.stepNumberText}>2</ThemedText>
                  </View>
                  <ThemedText style={styles.stepText}>
                    Check your email for the reset link
                  </ThemedText>
                </View>
                <View style={styles.step}>
                  <View style={[styles.stepNumber, { backgroundColor: primaryColor }]}>
                    <ThemedText style={styles.stepNumberText}>3</ThemedText>
                  </View>
                  <ThemedText style={styles.stepText}>
                    Click the link and set your new password
                  </ThemedText>
                </View>
              </View>

              {/* Send Button */}
              <Pressable
                onPress={handleSendResetEmail}
                disabled={isLoading || !user?.email}
                style={({ pressed }) => [
                  styles.sendButton,
                  {
                    backgroundColor: primaryColor,
                    opacity: isLoading || !user?.email ? 0.5 : pressed ? 0.8 : 1,
                  },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color={isDark ? '#000' : '#fff'} />
                ) : (
                  <>
                    <Ionicons
                      name="send"
                      size={20}
                      color={isDark ? '#000' : '#fff'}
                    />
                    <ThemedText style={[styles.sendButtonText, { color: isDark ? '#000' : '#fff' }]}>
                      Send Reset Email
                    </ThemedText>
                  </>
                )}
              </Pressable>
            </>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  emailSection: {
    marginBottom: 24,
  },
  emailLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    opacity: 0.7,
  },
  emailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  emailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  stepsSection: {
    marginBottom: 32,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  stepText: {
    fontSize: 15,
    flex: 1,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  sendButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  // Success state styles
  successCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  successText: {
    fontSize: 15,
    opacity: 0.8,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  successInstructions: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
