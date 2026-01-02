import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
// Global CSS for web (theming for alert dialogs, etc.) - only processed on web
import '@/assets/styles/global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ErrorBoundary } from '@/components/error-boundary';
import { StandardProvider, useStandard } from '@/lib/services/standard-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      {/* __INJECT_STACK_SCREENS__ */}
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
    </Stack>
  );
}

function AppContent({ children }: { children: React.ReactNode }) {
  const { isLoading } = useStandard();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

/**
 * Root Layout - Local Mode
 *
 * This is the simplified layout for local storage mode.
 * No authentication is required - the app launches directly.
 *
 * For cloud authentication with Firebase, select the Firebase backend
 * when generating your app:
 *   npx create-spezivibe-app my-app
 *   # Select "Firebase" when prompted for backend
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StandardProvider>
          <AppContent>
            <RootLayoutNav />
            <StatusBar style="auto" />
          </AppContent>
        </StandardProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
