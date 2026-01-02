import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAutoSkipIfAuthenticated } from '@/hooks/use-auto-skip-if-authenticated';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ONBOARDING_COMPLETED_KEY } from '@/lib/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SignInForm } from '@spezivibe/account';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function SignInScreen() {
  const isSkipping = useAutoSkipIfAuthenticated();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const buttonBackground = useThemeColor({}, 'buttonBackground');
  const buttonText = useThemeColor({}, 'buttonText');

  async function handleSuccess() {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    router.replace('/(tabs)');
  }

  // Show loading overlay during auto-skip
  if (isSkipping) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Sign In
          </ThemedText>
        </View>

        <SignInForm
          onSuccess={handleSuccess}
          showRegisterLink={false}
          containerStyle={styles.form}
          inputStyle={{
            ...styles.input,
            color: textColor,
            borderColor,
            backgroundColor,
          }}
          buttonStyle={{ ...styles.button, backgroundColor: buttonBackground }}
          buttonTextStyle={{ ...styles.buttonText, color: buttonText }}
          buttonText="Sign In"
        />

        <View style={styles.secondaryButtons}>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor }]}
            onPress={() => router.push('/(onboarding)/register')}
            accessibilityRole="button"
            accessibilityLabel="Create Account"
          >
            <ThemedText style={styles.secondaryButtonText}>
              Create Account
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor }]}
            onPress={() => router.push('/(onboarding)/forgot-password')}
            accessibilityRole="button"
            accessibilityLabel="Forgot Password"
          >
            <ThemedText style={styles.secondaryButtonText}>
              Forgot Password
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  form: {
    width: '100%',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtons: {
    marginTop: 16,
    gap: 12,
  },
  secondaryButton: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
