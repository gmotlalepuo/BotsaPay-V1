import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { signUp } from '@/services/auth';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useAuthStore } from '@/stores/auth-store';
import { getErrorMessage } from '@/utils/errors';

export default function SignupScreen() {
  const loading = useAuthStore((state) => state.loading);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  async function handleSignup() {
    if (password.length < 8) {
      Alert.alert('Check password', 'Password must be at least 8 characters.');
      return;
    }
    if (passwordMismatch) {
      Alert.alert('Check password', 'Passwords do not match.');
      return;
    }

    try {
      const result = await signUp({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
      });
      if (!result.session) {
        Alert.alert(
          'Account created',
          'Check your email to confirm your account, then sign in to continue.',
          [
            {
              text: 'Go to sign in',
              onPress: () => router.replace('/(auth)/login'),
            },
          ],
          { cancelable: false },
        );
        return;
      }
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Signup failed', getErrorMessage(error));
    }
  }

  return (
    <Screen title="Create account" subtitle="Open your BotsaPay customer profile and first wallet.">
      <Card>
        <TextField label="First name" value={firstName} onChangeText={setFirstName} textContentType="givenName" />
        <TextField label="Last name" value={lastName} onChangeText={setLastName} textContentType="familyName" />
        <TextField
          label="Phone number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
        />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <TextField
          label="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoComplete="password-new"
          textContentType="newPassword"
          error={passwordMismatch ? 'Passwords do not match.' : undefined}
        />
        <AppButton label="Register" loading={loading} onPress={handleSignup} />
        <Link href="/(auth)/login">
          <ThemedText type="linkPrimary">Already have an account?</ThemedText>
        </Link>
      </Card>
    </Screen>
  );
}
