import React from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Alert from '@blazejkustra/react-native-alert';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing } from '@/constants/theme';
import { PasswordResetForm } from '@spezivibe/account';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const buttonBackground = useThemeColor({}, 'buttonBackground');
  const buttonText = useThemeColor({}, 'buttonText');

  const handleSuccess = () => {
    Alert.alert(
      'Email Sent',
      'Password reset instructions have been sent to your email address. Please check your inbox.',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleError = (error: Error) => {
    Alert.alert('Error', error.message || 'Failed to send password reset email');
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with back button */}
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={24} color={tintColor} />
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Forgot Password
            </ThemedText>
          </View>

          <View style={styles.formContainer}>
            <PasswordResetForm
              onSuccess={handleSuccess}
              onError={handleError}
              buttonStyle={{ backgroundColor: buttonBackground }}
              buttonTextStyle={{ color: buttonText }}
              buttonText="Send Reset Email"
              showBackToLogin={false}
              inputStyle={{
                color: textColor,
                borderColor: borderColor,
                backgroundColor: backgroundColor,
              }}
            />

            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>Remember your password? </ThemedText>
              <TouchableOpacity onPress={() => router.back()}>
                <ThemedText style={[styles.link, { color: tintColor }]}>Sign In</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.screenHorizontal,
    paddingTop: Spacing.screenTop,
  },
  headerContainer: {
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
  },
});
