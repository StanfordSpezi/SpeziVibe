import { useEffect, useState, useCallback, useRef } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { StandardProvider } from '@/lib/services/standard-context';
import { SchedulerProvider } from '@/lib/scheduler';
import { AuthProvider } from '@/lib/services/auth-context';

const ONBOARDING_COMPLETED_KEY = '@onboarding_completed';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();
  const hasRedirected = useRef(false);

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
    if (isOnboardingCompleted === null || hasRedirected.current) {
      return;
    }

    const inOnboarding = segments[0] === '(onboarding)';

    // Redirect to onboarding if not completed and not in onboarding
    if (!isOnboardingCompleted && !inOnboarding) {
      hasRedirected.current = true;
      router.replace('/(onboarding)/welcome');
    }
  }, [isOnboardingCompleted, segments, router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StandardProvider>
        <SchedulerProvider>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="questionnaire" options={{ presentation: 'modal' }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
            </Stack>
            <StatusBar style="auto" />
          </AuthProvider>
        </SchedulerProvider>
      </StandardProvider>
    </ThemeProvider>
  );
}
