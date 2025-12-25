import { renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useOnboardingStatus,
  markOnboardingCompleted,
  resetOnboardingStatus,
} from '../hooks/useOnboardingStatus';
import { ONBOARDING_COMPLETED_KEY } from '../constants';

describe('useOnboardingStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null initially while loading', () => {
    const { result } = renderHook(() => useOnboardingStatus());
    expect(result.current).toBeNull();
  });

  it('should return false if onboarding is not completed', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const { result } = renderHook(() => useOnboardingStatus());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should return true if onboarding is completed', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('true');

    const { result } = renderHook(() => useOnboardingStatus());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should use custom storage key', async () => {
    const customKey = '@custom_onboarding';
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('true');

    const { result } = renderHook(() => useOnboardingStatus(customKey));

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    expect(AsyncStorage.getItem).toHaveBeenCalledWith(customKey);
  });
});

describe('markOnboardingCompleted', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set onboarding completed in AsyncStorage', async () => {
    await markOnboardingCompleted();

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(ONBOARDING_COMPLETED_KEY, 'true');
  });

  it('should use custom storage key', async () => {
    const customKey = '@custom_onboarding';
    await markOnboardingCompleted(customKey);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(customKey, 'true');
  });
});

describe('resetOnboardingStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should remove onboarding completed from AsyncStorage', async () => {
    await resetOnboardingStatus();

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(ONBOARDING_COMPLETED_KEY);
  });

  it('should use custom storage key', async () => {
    const customKey = '@custom_onboarding';
    await resetOnboardingStatus(customKey);

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(customKey);
  });
});
