import { useEffect, useState, useCallback } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { SchedulerProvider } from '@/lib/scheduler';

const ONBOARDING_COMPLETED_KEY = '@onboarding_completed';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();

  const checkOnboardingStatus = useCallback(async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      const completed = value === 'true';
      setIsOnboardingCompleted(completed);
    } catch (error) {
      setIsOnboardingCompleted(false);
    }
  }, []);

  useEffect(() => {
    checkOnboardingStatus();

    // Re-check when app comes to foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkOnboardingStatus();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkOnboardingStatus]);

  useEffect(() => {
    if (isOnboardingCompleted === null) {
      return;
    }

    const inOnboarding = segments[0] === '(onboarding)';
    const inTabs = segments[0] === '(tabs)';

    // If navigating to onboarding while completed, re-check storage
    // This handles the case where the user manually cleared storage
    if (isOnboardingCompleted && inOnboarding) {
      checkOnboardingStatus();
      return;
    }

    // If navigating to tabs while onboarding is not complete, re-check storage
    // This handles the case where get-started just saved the value
    if (!isOnboardingCompleted && inTabs) {
      checkOnboardingStatus();
      return;
    }

    if (!isOnboardingCompleted && !inOnboarding) {
      router.replace('/(onboarding)/welcome');
    }
  }, [isOnboardingCompleted, segments, checkOnboardingStatus]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SchedulerProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="questionnaire" options={{ presentation: 'modal' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
        </Stack>
        <StatusBar style="auto" />
      </SchedulerProvider>
    </ThemeProvider>
  );
}
