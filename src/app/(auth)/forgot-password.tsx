import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { resetPassword } from '@/services/auth';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { getErrorMessage } from '@/utils/errors';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    setLoading(true);
    try {
      await resetPassword(email.trim());
      Alert.alert('Email sent', 'Check your inbox for password reset instructions.');
    } catch (error) {
      Alert.alert('Reset failed', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="Reset password" subtitle="Enter your email address to receive a reset link.">
      <Card>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <AppButton label="Send reset link" loading={loading} onPress={handleReset} />
        <Link href="/(auth)/login">
          <ThemedText type="linkPrimary">Back to login</ThemedText>
        </Link>
      </Card>
    </Screen>
  );
}
