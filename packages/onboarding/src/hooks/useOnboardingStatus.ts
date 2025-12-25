import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { ONBOARDING_COMPLETED_KEY } from '../constants';

/**
 * Hook to check if onboarding has been completed.
 * Re-checks when the app comes to foreground.
 *
 * @param storageKey - Optional custom storage key (defaults to ONBOARDING_COMPLETED_KEY)
 * @returns `true` if completed, `false` if not, `null` while loading
 *
 * @example
 * ```tsx
 * function App() {
 *   const isOnboardingCompleted = useOnboardingStatus();
 *
 *   if (isOnboardingCompleted === null) {
 *     return <LoadingScreen />;
 *   }
 *
 *   return isOnboardingCompleted ? <MainApp /> : <OnboardingFlow />;
 * }
 * ```
 */
export function useOnboardingStatus(storageKey: string = ONBOARDING_COMPLETED_KEY) {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);

  const checkOnboardingStatus = useCallback(async () => {
    try {
      const value = await AsyncStorage.getItem(storageKey);
      setIsOnboardingCompleted(value === 'true');
    } catch {
      setIsOnboardingCompleted(false);
    }
  }, [storageKey]);

  useEffect(() => {
    checkOnboardingStatus();

    // Re-check when app comes to foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkOnboardingStatus();
      }
    });

    return () => subscription.remove();
  }, [checkOnboardingStatus]);

  return isOnboardingCompleted;
}

/**
 * Mark onboarding as completed in AsyncStorage.
 *
 * @param storageKey - Optional custom storage key
 */
export async function markOnboardingCompleted(
  storageKey: string = ONBOARDING_COMPLETED_KEY
): Promise<void> {
  await AsyncStorage.setItem(storageKey, 'true');
}

/**
 * Reset onboarding status (mark as not completed).
 *
 * @param storageKey - Optional custom storage key
 */
export async function resetOnboardingStatus(
  storageKey: string = ONBOARDING_COMPLETED_KEY
): Promise<void> {
  await AsyncStorage.removeItem(storageKey);
}
