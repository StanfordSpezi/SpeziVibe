import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';
import { StandardProvider, useStandard } from '@/lib/services/standard-context';
import { SchedulerProvider } from '@/lib/scheduler';
import { AccountProvider, useAccount } from '@spezivibe/account';
import { ACCOUNT_CONFIGURATION } from '@/lib/constants';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { signedIn, isLoading: authLoading } = useAccount();
  const onboardingComplete = useOnboardingStatus();
  const segments = useSegments();

  // LOADING: Wait for auth and onboarding status to load
  if (onboardingComplete === null || authLoading) {
    return null; // Show nothing while loading (splash screen visible)
  }

  // Determine current location
  const inAuthFlow = segments[0] === '(onboarding)';

  // GUARD 1: Redirect to onboarding if not completed
  if (!onboardingComplete && !inAuthFlow) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  // GUARD 2: Redirect to sign-in if onboarding done but not authenticated
  if (onboardingComplete && !signedIn && !inAuthFlow) {
    return <Redirect href="/(onboarding)/sign-in" />;
  }

  // GUARD 3: Redirect authenticated users away from auth screens
  if (signedIn && inAuthFlow) {
    return <Redirect href="/(tabs)" />;
  }

  // RENDER: All guards passed, render the navigation stack
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="questionnaire" options={{ presentation: 'modal' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
      <Stack.Screen
        name="edit-profile"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="change-password"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
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
