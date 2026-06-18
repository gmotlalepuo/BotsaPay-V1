import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { signIn } from '@/services/auth';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth-store';
import { getErrorMessage } from '@/utils/errors';

export default function LoginScreen() {
  const loading = useAuthStore((state) => state.loading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      Alert.alert('Login failed', getErrorMessage(error));
    }
  }

  return (
    <Screen
      title="BotsaPay"
      subtitle="Sign in to manage wallets, transfers, QR payments, and transaction history.">
      <Card>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
        />
        <AppButton label="Login" loading={loading} onPress={handleLogin} />
        <View style={styles.links}>
          <Link href="/(auth)/forgot-password">
            <ThemedText type="linkPrimary">Forgot password?</ThemedText>
          </Link>
          <Link href="/(auth)/signup">
            <ThemedText type="linkPrimary">Create account</ThemedText>
          </Link>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
});
