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
import { AuthProvider, useAuth } from '@/lib/services/auth-context';

const ONBOARDING_COMPLETED_KEY = '@onboarding_completed';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
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

  // Reset redirect flag when auth state changes
  useEffect(() => {
    hasRedirected.current = false;
  }, [isAuthenticated]);

  useEffect(() => {
    // Wait for both onboarding status and auth status to load
    if (isOnboardingCompleted === null || authLoading) {
      return;
    }

    // Prevent redirect loops
    if (hasRedirected.current) {
      return;
    }

    const inOnboarding = segments[0] === '(onboarding)';
    const inTabs = segments[0] === '(tabs)';
    const inQuestionnaire = segments[0] === 'questionnaire';

    // Priority 1: Redirect to onboarding if not completed
    if (!isOnboardingCompleted && !inOnboarding) {
      hasRedirected.current = true;
      // Use setTimeout to avoid navigation during render
      const timeoutId = setTimeout(() => router.replace('/(onboarding)/welcome'), 0);
      return () => clearTimeout(timeoutId);
    }

    // Priority 2: Redirect to sign-in if onboarding completed but not authenticated
    // Allow access to onboarding screens without authentication
    if (isOnboardingCompleted && !isAuthenticated && (inTabs || inQuestionnaire)) {
      hasRedirected.current = true;
      const timeoutId = setTimeout(() => router.replace('/(onboarding)/sign-in'), 0);
      return () => clearTimeout(timeoutId);
    }

    // Priority 3: Redirect to tabs if authenticated and in onboarding (except when actively signing in/registering)
    if (isAuthenticated && inOnboarding && segments[1] !== 'sign-in' && segments[1] !== 'register') {
      hasRedirected.current = true;
      const timeoutId = setTimeout(() => router.replace('/(tabs)'), 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isOnboardingCompleted, isAuthenticated, authLoading, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="questionnaire" options={{ presentation: 'modal' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StandardProvider>
        <SchedulerProvider>
          <AuthProvider>
            <RootLayoutNav />
            <StatusBar style="auto" />
          </AuthProvider>
        </SchedulerProvider>
      </StandardProvider>
    </ThemeProvider>
  );
}
