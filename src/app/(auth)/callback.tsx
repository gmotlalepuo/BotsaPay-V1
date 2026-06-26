import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { getErrorMessage } from '@/utils/errors';

type CallbackParams = {
  code?: string;
  token_hash?: string;
  type?: string;
  error?: string;
  error_description?: string;
};

export default function AuthCallbackScreen() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Finishing sign-in...');
  const { code, token_hash, type, error, error_description } = useLocalSearchParams<CallbackParams>();

  useEffect(() => {
    let active = true;

    async function completeAuth() {
      if (error || error_description) {
        throw new Error(error_description ?? error ?? 'Authentication failed');
      }

      if (code) {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;
        if (active) {
          useAuthStore.getState().setSession(data.session);
        }
        return;
      }

      if (token_hash && type) {
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as 'signup' | 'email' | 'recovery' | 'invite' | 'magiclink',
        });
        if (verifyError) throw verifyError;
        if (active) {
          useAuthStore.getState().setSession(data.session);
        }
        return;
      }

      throw new Error('Missing authentication token.');
    }

    completeAuth()
      .then(() => {
        if (!active) return;
        setStatus('success');
        setMessage('Your email is confirmed. Redirecting to your account...');
        setTimeout(() => {
          router.replace('/(tabs)/home');
        }, 500);
      })
      .catch((authError) => {
        if (!active) return;
        setStatus('error');
        setMessage(getErrorMessage(authError));
        Alert.alert('Confirmation failed', getErrorMessage(authError));
      });

    return () => {
      active = false;
    };
  }, [code, error, error_description, token_hash, type]);

  return (
    <Screen title="Confirming email" subtitle="We are opening your BotsaPay account." showBackButton={false}>
      <View style={{ alignItems: 'center', gap: 12, paddingVertical: 24 }}>
        {status === 'loading' && <ActivityIndicator />}
        <ThemedText type="small" themeColor="textSecondary">
          {message}
        </ThemedText>
      </View>
    </Screen>
  );
}
