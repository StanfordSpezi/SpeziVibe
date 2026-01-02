/**
 * Stub onboarding status hook for base template
 * When onboarding feature is added, this file is replaced
 */
import { useState, useEffect } from 'react';

/**
 * Hook that returns onboarding completion status
 * Base implementation always returns true (onboarding complete)
 */
export function useOnboardingStatus(): boolean | null {
  const [status, setStatus] = useState<boolean | null>(null);

  useEffect(() => {
    // In the base template, onboarding is considered complete
    setStatus(true);
  }, []);

  return status;
}

/**
 * Mark onboarding as completed (no-op in base template)
 */
export async function markOnboardingCompleted(): Promise<void> {
  // No-op in base template
}

/**
 * Reset onboarding status (no-op in base template)
 */
export async function resetOnboardingStatus(): Promise<void> {
  // No-op in base template
}
