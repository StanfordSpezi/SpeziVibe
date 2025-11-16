import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { RegisterForm } from '@spezivibe/account';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAutoSkipIfAuthenticated } from '@/hooks/use-auto-skip-if-authenticated';
import { ONBOARDING_COMPLETED_KEY } from '@/lib/constants';

export default function RegisterScreen() {
  const isSkipping = useAutoSkipIfAuthenticated();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#ddd', dark: '#444' }, 'border');

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
            Create Account
          </ThemedText>
          <ThemedText style={styles.subtitle}>Sign up to get started</ThemedText>
        </View>

        <RegisterForm
          onSuccess={handleSuccess}
          onSignInPress={() => router.push('/(onboarding)/sign-in')}
          containerStyle={styles.form}
          inputStyle={[
            styles.input,
            { color: textColor, borderColor, backgroundColor },
          ]}
          buttonStyle={[styles.button, { backgroundColor: tintColor }]}
          buttonTextStyle={styles.buttonText}
          buttonText="Create Account"
          minPasswordLength={6}
        />
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
