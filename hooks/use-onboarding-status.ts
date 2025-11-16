import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { ONBOARDING_COMPLETED_KEY } from '@/lib/constants';

/**
 * Hook to check if onboarding has been completed
 * Re-checks when app comes to foreground
 */
export function useOnboardingStatus() {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);

  const checkOnboardingStatus = useCallback(async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      setIsOnboardingCompleted(value === 'true');
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

    return () => subscription.remove();
  }, [checkOnboardingStatus]);

  return isOnboardingCompleted;
}
