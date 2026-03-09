/**
 * SessionMonitor - Auto-logout on inactivity
 *
 * Wraps children and monitors user activity (touches).
 * Calls onTimeout after the specified inactivity period.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import type { SessionMonitorProps } from './types';

const DEFAULT_TIMEOUT_MINUTES = 15;

export function SessionMonitor({
  timeoutMinutes = DEFAULT_TIMEOUT_MINUTES,
  onTimeout,
  children,
}: SessionMonitorProps): JSX.Element {
  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    const timeoutMs = timeoutMinutes * 60 * 1000;

    // Check for inactivity every 30 seconds
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= timeoutMs) {
        onTimeout();
      }
    }, 30_000);

    // Listen for app state changes to reset on foreground
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          // Check if timed out while backgrounded
          const elapsed = Date.now() - lastActivityRef.current;
          if (elapsed >= timeoutMs) {
            onTimeout();
          } else {
            resetTimer();
          }
        }
      }
    );

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      subscription.remove();
    };
  }, [timeoutMinutes, onTimeout, resetTimer]);

  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
}
