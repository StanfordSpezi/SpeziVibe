import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';
// Global CSS for web (theming for alert dialogs, etc.) - only processed on web
import '@/assets/styles/global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ErrorBoundary } from '@/components/error-boundary';
import { createLogger } from '@/lib/utils/logger';
import { StandardProvider, useStandard } from '@/lib/services/standard-context';
import { AccountProvider, useAccount, InMemoryAccountService } from '@spezivibe/account';
import { FirebaseAccountService } from '@spezivibe/firebase';
import { ACCOUNT_CONFIGURATION, ONBOARDING_COMPLETED_KEY } from '@/lib/constants';
import { getBackendConfig } from '@/lib/services/config';

const logger = createLogger('App');

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { signedIn, isLoading: authLoading } = useAccount();
  const onboardingComplete = useOnboardingStatus();
  const segments = useSegments();

  // Wait for auth and onboarding status to load
  if (onboardingComplete === null || authLoading) {
    return <LoadingScreen />;
  }

  const inAuthFlow = segments[0] === '(onboarding)';

  // Authenticated users stay in main app
  if (signedIn && inAuthFlow) {
    return <Redirect href="/(tabs)" />;
  }

  // Unauthenticated users need to complete auth flow
  if (!signedIn && !inAuthFlow) {
    return <Redirect href={onboardingComplete ? '/(onboarding)/sign-in' : '/(onboarding)/welcome'} />;
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

  if (isLoading || !backend) {
    return <LoadingScreen />;
  }

  return (
    <AccountProvider
      accountService={accountService}
      configuration={ACCOUNT_CONFIGURATION}
      onLogin={async () => {
        // Mark onboarding complete after successful login
        await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');

        // Sync scheduler data from backend
        try {
          await backend.syncFromRemote();
        } catch (error) {
          logger.warn('Background sync failed after login:', error);
        }
      }}
    >
      {children}
    </AccountProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  /**
   * Create the AccountService based on backend configuration
   *
   * This is where you choose your authentication backend:
   * - FirebaseAccountService for Firebase Authentication
   * - InMemoryAccountService for local/development
   */
  const accountService = React.useMemo(() => {
    const config = getBackendConfig();

    if (config.type === 'firebase' && config.firebase) {
      return new FirebaseAccountService(config.firebase);
    }

    return new InMemoryAccountService();
  }, []);

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
