import React, { useEffect, useRef } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useSegments, useRouter, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';
import '@/assets/styles/global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';
import { ErrorBoundary } from '@/components/error-boundary';
import { StandardProvider, useStandard } from '@/lib/services/standard-context';
import { AccountProvider, useAccount, InMemoryAccountService } from '@spezivibe/account';
import { FirebaseAccountService } from '@spezivibe/firebase';
import { ACCOUNT_CONFIGURATION, ONBOARDING_COMPLETED_KEY } from '@/lib/constants';
import { getBackendConfig } from '@/lib/services/config';

/**
 * Screen shown when Firebase configuration is missing
 */
function ConfigurationErrorScreen({ error }: { error: Error }) {
  return (
    <View style={configStyles.container}>
      <ScrollView contentContainerStyle={configStyles.content}>
        <Text style={configStyles.icon}>⚠️</Text>
        <Text style={configStyles.title}>Configuration Error</Text>
        <Text style={configStyles.message}>{error.message}</Text>
        <View style={configStyles.helpBox}>
          <Text style={configStyles.helpTitle}>How to fix:</Text>
          <Text style={configStyles.helpText}>
            1. Copy .env.example to .env{'\n'}
            2. Fill in your Firebase credentials{'\n'}
            3. Restart the development server
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const configStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#e0e0e0',
    textAlign: 'left',
    fontFamily: 'monospace',
    backgroundColor: '#2d2d44',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    lineHeight: 22,
  },
  helpBox: {
    backgroundColor: '#16213e',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4ecdc4',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ecdc4',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#a0a0a0',
    lineHeight: 24,
  },
});

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
  const hasHiddenSplash = useRef(false);

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

    // Only hide splash screen once
    if (!hasHiddenSplash.current) {
      hasHiddenSplash.current = true;
      SplashScreen.hideAsync().catch(() => {
        // Ignore errors - splash screen may already be hidden
      });
    }
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

function createAccountService(): { service: InstanceType<typeof FirebaseAccountService> | InstanceType<typeof InMemoryAccountService>; error: Error | null } {
  try {
    const config = getBackendConfig();
    if (config.type === 'firebase' && config.firebase) {
      return { service: new FirebaseAccountService(config.firebase), error: null };
    }
    return { service: new InMemoryAccountService({ startUnauthenticated: true }), error: null };
  } catch (error) {
    // Return InMemoryAccountService as fallback but preserve the error for display
    return {
      service: new InMemoryAccountService({ startUnauthenticated: true }),
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const { accountService, configError } = React.useMemo(() => {
    const { service, error } = createAccountService();
    return { accountService: service, configError: error };
  }, []);

  // Show configuration error screen if Firebase is misconfigured
  if (configError) {
    // Hide splash screen since we're showing error
    SplashScreen.hideAsync().catch(() => {});

    return (
      <ErrorBoundary>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <ConfigurationErrorScreen error={configError} />
          <StatusBar style="auto" />
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

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
