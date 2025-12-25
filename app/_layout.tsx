import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';
import { StandardProvider, useStandard } from '@/lib/services/standard-context';
import { SchedulerProvider, createSampleTasks, useScheduler } from '@spezivibe/scheduler';
import { AccountProvider, useAccount, InMemoryAccountService } from '@spezivibe/account';
import { FirebaseAccountService } from '@spezivibe/firebase';
import { ACCOUNT_CONFIGURATION, ONBOARDING_COMPLETED_KEY } from '@/lib/constants';
import { getBackendConfig } from '@/lib/services/config';

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

/**
 * Initialize scheduler with data from backend or sample tasks
 *
 * Following the Spezi pattern:
 * - Scheduler package is backend-agnostic (uses AsyncStorage only)
 * - App-level orchestration syncs from backend to local scheduler on auth
 * - Sample tasks are loaded for new users or local development
 */
function SchedulerInitializer({ children }: { children: React.ReactNode }) {
  const { scheduler, isLoading: schedulerLoading } = useScheduler();
  const { backend, backendType, isLoading: backendLoading } = useStandard();
  const { signedIn, user } = useAccount();
  const [initializedForUserId, setInitializedForUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function initializeTasks() {
      const currentUserId = user?.uid || null;

      // Skip if already initialized for this user
      if (initializedForUserId === currentUserId && currentUserId !== null) {
        return;
      }

      if (!scheduler || schedulerLoading || backendLoading || !backend) {
        return;
      }

      try {
        // For Firebase backend with authenticated user
        // IMPORTANT: Wait for user.uid to be available before loading from Firebase
        if (backendType === 'firebase' && signedIn && user?.uid) {
          // Sync from backend to local scheduler
          const remoteState = await backend.loadSchedulerState();

          if (remoteState && remoteState.tasks.length > 0) {
            console.log('[SchedulerInit] Syncing', remoteState.tasks.length, 'tasks from Firebase');
            for (const task of remoteState.tasks) {
              await scheduler.createOrUpdateTask(task);
            }
          } else {
            // New user with no tasks - load sample tasks
            console.log('[SchedulerInit] No remote tasks, loading sample tasks for new user');
            const predefinedTasks = createSampleTasks();
            for (const task of predefinedTasks) {
              await scheduler.createOrUpdateTask(task);
            }
            // Save to backend so they persist
            await backend.saveSchedulerState({
              tasks: scheduler.getTasks(),
              outcomes: []
            });
          }
        } else if (backendType === 'local') {
          // Local development - load sample tasks if empty
          const existingTasks = scheduler.getTasks();
          if (existingTasks.length === 0) {
            const predefinedTasks = createSampleTasks();
            for (const task of predefinedTasks) {
              await scheduler.createOrUpdateTask(task);
            }
          }
        }
      } catch (error) {
        console.error('[SchedulerInit] Failed to initialize:', error);
      } finally {
        setInitializedForUserId(user?.uid || null);
      }
    }

    initializeTasks();
  }, [scheduler, schedulerLoading, backend, backendType, backendLoading, signedIn, user, initializedForUserId]);

  return <>{children}</>;
}

function AppProviders({ children }: { children: React.ReactNode }) {
  const { accountService, backend, isLoading } = useStandard();

  if (isLoading || !backend) {
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
      <SchedulerInitializer>
        {children}
      </SchedulerInitializer>
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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StandardProvider accountService={accountService}>
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
