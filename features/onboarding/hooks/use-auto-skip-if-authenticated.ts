import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAccount } from '@spezivibe/account';
import { useStandard } from '@/lib/services/standard-context';
import { ONBOARDING_COMPLETED_KEY } from '@/lib/constants';

/**
 * Hook that automatically skips authentication screens if the user is already authenticated
 * or if using local storage backend
 */
export function useAutoSkipIfAuthenticated() {
  const [isSkipping, setIsSkipping] = useState(false);
  const { isLoading, signedIn } = useAccount();
  const { backendType } = useStandard();
  const hasAttemptedSkip = useRef(false);

  useEffect(() => {
    if (hasAttemptedSkip.current || isSkipping) return;

    async function checkAuthAndSkip() {
      if (signedIn || backendType === 'local') {
        hasAttemptedSkip.current = true;
        setIsSkipping(true);
        try {
          await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
          router.replace('/(tabs)');
        } catch (error) {
          setIsSkipping(false);
          hasAttemptedSkip.current = false;
          console.error('Failed to skip:', error);
        }
      }
    }

    if (!isLoading && backendType) {
      checkAuthAndSkip();
    }
  }, [signedIn, isLoading, backendType, isSkipping]);

  return isSkipping;
}
