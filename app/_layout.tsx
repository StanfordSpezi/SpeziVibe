import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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

  // Wait for auth and onboarding status to load
  if (onboardingComplete === null || authLoading) {
    return null;
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

  if (isLoading || !accountService || !backend) {
    return null; // Or a loading screen
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
