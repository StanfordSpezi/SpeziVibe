import React, { useEffect, useRef } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useSegments, useRouter, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';
import '@/assets/styles/global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';
import { ErrorBoundary } from '@/components/error-boundary';
import { StandardProvider, useStandard } from '@/lib/services/standard-context';
import { AccountProvider, useAccount, InMemoryAccountService } from '@spezivibe/account';
import { ACCOUNT_CONFIGURATION, ONBOARDING_COMPLETED_KEY } from '@/lib/constants';

// Keep splash screen visible while we check auth
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(onboarding)',
};

function useProtectedRoute() {
  const { signedIn, isLoading: authLoading } = useAccount();
  const onboardingComplete = useOnboardingStatus();
  const segments = useSegments();
  const router = useRouter();
  const hasNavigated = useRef(false);

  useEffect(() => {
    // Wait for auth and onboarding status
    if (authLoading || onboardingComplete === null) {
      return;
    }

    // Only navigate once per auth state change
    const inAuthFlow = segments[0] === '(onboarding)';

    if (signedIn && inAuthFlow && !hasNavigated.current) {
      hasNavigated.current = true;
      router.replace('/(tabs)');
    } else if (!signedIn && !inAuthFlow && !hasNavigated.current) {
      hasNavigated.current = true;
      const target = onboardingComplete ? '/(onboarding)/sign-in' : '/(onboarding)/welcome';
      router.replace(target);
    }

    SplashScreen.hideAsync();
  }, [signedIn, authLoading, onboardingComplete, segments, router]);

  // Reset navigation flag when auth state changes
  useEffect(() => {
    hasNavigated.current = false;
  }, [signedIn]);
}

function RootLayoutNav() {
  useProtectedRoute();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(account)" />
      {/* __INJECT_STACK_SCREENS__ */}
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
    </Stack>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  const { accountService, isLoading } = useStandard();

  if (isLoading) {
    return null; // Keep showing splash screen
  }

  return (
    <AccountProvider
      accountService={accountService}
      configuration={ACCOUNT_CONFIGURATION}
      onLogin={async () => {
        await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      }}
    >
      {children}
    </AccountProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const accountService = React.useMemo(() => new InMemoryAccountService({ startUnauthenticated: true }), []);

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StandardProvider accountService={accountService}>
          <AppProviders>
            <RootLayoutNav />
            <StatusBar style="auto" />
          </AppProviders>
        </StandardProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
