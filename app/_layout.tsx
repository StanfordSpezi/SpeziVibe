import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';
import { StandardProvider, useStandard } from '@/lib/services/standard-context';
import { SchedulerProvider } from '@/lib/scheduler';
import { AccountProvider, useAccount } from '@spezivibe/account';
import { ACCOUNT_CONFIGURATION, ONBOARDING_COMPLETED_KEY } from '@/lib/constants';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { signedIn, isLoading: authLoading } = useAccount();
  const onboardingComplete = useOnboardingStatus();
  const segments = useSegments();

  // AUTO-COMPLETE: If user is signed in, ensure onboarding is marked as complete
  // This prevents auth loops when onboarding flag is reset but user is still authenticated
  useEffect(() => {
    if (!authLoading && signedIn && onboardingComplete === false) {
      AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true').catch((error) => {
        console.error('Failed to auto-complete onboarding:', error);
      });
    }
  }, [signedIn, authLoading, onboardingComplete]);

  // LOADING: Wait for auth and onboarding status to load
  if (onboardingComplete === null || authLoading) {
    return null; // Show nothing while loading (splash screen visible)
  }

  // Determine current location
  const inAuthFlow = segments[0] === '(onboarding)';

  // GUARD 1: Authenticated users should be at tabs, not auth screens
  if (signedIn && inAuthFlow) {
    return <Redirect href="/(tabs)" />;
  }

  // GUARD 2: Unauthenticated users should be in auth flow
  if (!signedIn && !inAuthFlow) {
    // If onboarding not complete, start from welcome
    if (!onboardingComplete) {
      return <Redirect href="/(onboarding)/welcome" />;
    }
    // If onboarding complete, go to sign-in
    return <Redirect href="/(onboarding)/sign-in" />;
  }

  // RENDER: All guards passed, render the navigation stack
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(account)" />
      <Stack.Screen name="questionnaire" options={{ presentation: 'modal' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
    </Stack>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  const { accountService, backend, isLoading } = useStandard();

  if (isLoading || !accountService || !backend) {
    return null; // Or a loading screen
  }

  return (
    <AccountProvider
      accountService={accountService}
      configuration={ACCOUNT_CONFIGURATION}
      onLogin={async () => {
        // Sync scheduler data from backend after login
        try {
          await backend.syncFromRemote();
        } catch (error) {
          console.warn('Background sync failed after login:', error);
        }
      }}
    >
      {children}
    </AccountProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StandardProvider>
        <SchedulerProvider>
          <AppProviders>
            <RootLayoutNav />
            <StatusBar style="auto" />
          </AppProviders>
        </SchedulerProvider>
      </StandardProvider>
    </ThemeProvider>
  );
}
