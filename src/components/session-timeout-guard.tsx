import { ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import { Alert, AppState, PanResponder, Platform, StyleSheet, View } from 'react-native';

import { signOut } from '@/services/auth';

const IDLE_WARNING_MS = 5 * 60 * 1000;
const WARNING_RESPONSE_MS = 60 * 1000;

type SessionTimeoutGuardProps = {
  active: boolean;
  children: ReactNode;
};

export function SessionTimeoutGuard({ active, children }: SessionTimeoutGuardProps) {
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signOutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningVisible = useRef(false);
  const backgroundedAt = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (warningTimer.current) {
      clearTimeout(warningTimer.current);
      warningTimer.current = null;
    }
    if (signOutTimer.current) {
      clearTimeout(signOutTimer.current);
      signOutTimer.current = null;
    }
  }, []);

  const endSession = useCallback(async () => {
    clearTimers();
    warningVisible.current = false;

    try {
      await signOut();
    } catch {
      // The auth listener may already have cleared the session.
    }
  }, [clearTimers]);

  const scheduleWarning = useCallback(() => {
    if (!active) {
      clearTimers();
      return;
    }

    clearTimers();
    warningTimer.current = setTimeout(() => {
      warningVisible.current = true;
      signOutTimer.current = setTimeout(endSession, WARNING_RESPONSE_MS);

      Alert.alert(
        'Still using BotsaPay?',
        'For your security, you will be signed out soon if there is no response.',
        [
          {
            text: 'Stay signed in',
            onPress: () => {
              warningVisible.current = false;
              scheduleWarning();
            },
          },
          {
            text: 'Sign out',
            style: 'destructive',
            onPress: endSession,
          },
        ],
        { cancelable: false },
      );
    }, IDLE_WARNING_MS);
  }, [active, clearTimers, endSession]);

  const registerActivity = useCallback(() => {
    if (!active || warningVisible.current) {
      return;
    }

    scheduleWarning();
  }, [active, scheduleWarning]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponderCapture: () => {
          registerActivity();
          return false;
        },
        onMoveShouldSetPanResponderCapture: () => {
          registerActivity();
          return false;
        },
      }),
    [registerActivity],
  );

  useEffect(() => {
    scheduleWarning();
    return clearTimers;
  }, [clearTimers, scheduleWarning]);

  useEffect(() => {
    if (!active) {
      backgroundedAt.current = null;
      return undefined;
    }

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        const inactiveFor = backgroundedAt.current ? Date.now() - backgroundedAt.current : 0;
        backgroundedAt.current = null;

        if (inactiveFor >= IDLE_WARNING_MS + WARNING_RESPONSE_MS) {
          void endSession();
          return;
        }

        if (inactiveFor >= IDLE_WARNING_MS && !warningVisible.current) {
          warningVisible.current = true;
          Alert.alert(
            'Still using BotsaPay?',
            'For your security, confirm to keep this session active.',
            [
              {
                text: 'Stay signed in',
                onPress: () => {
                  warningVisible.current = false;
                  scheduleWarning();
                },
              },
              {
                text: 'Sign out',
                style: 'destructive',
                onPress: endSession,
              },
            ],
            { cancelable: false },
          );
          return;
        }

        registerActivity();
      } else {
        backgroundedAt.current = Date.now();
        clearTimers();
      }
    });

    return () => subscription.remove();
  }, [active, clearTimers, endSession, registerActivity, scheduleWarning]);

  useEffect(() => {
    if (!active || Platform.OS !== 'web' || typeof window === 'undefined') {
      return undefined;
    }

    window.addEventListener('keydown', registerActivity);
    window.addEventListener('mousemove', registerActivity);

    return () => {
      window.removeEventListener('keydown', registerActivity);
      window.removeEventListener('mousemove', registerActivity);
    };
  }, [active, registerActivity]);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
