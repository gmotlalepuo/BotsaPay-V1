import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';

import { signIn } from '@/services/auth';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';
import { getErrorMessage } from '@/utils/errors';

export default function LoginScreen() {
  const theme = useTheme();
  const loading = useAuthStore((state) => state.loading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const emailError = email.length > 0 && !email.includes('@') ? 'Enter a valid email address.' : undefined;
  const passwordError = password.length > 0 && password.length < 8 ? 'Password must be at least 8 characters.' : undefined;

  async function handleLogin() {
    if (!email.trim() || !password || emailError || passwordError) {
      Alert.alert('Check login details', 'Enter your email and password to continue.');
      return;
    }

    try {
      await signIn(email.trim(), password);
    } catch (error) {
      Alert.alert('Login failed', getErrorMessage(error));
    }
  }

  return (
    <Screen
      showBackButton={false}
      style={styles.screen}>
      <View style={styles.brand}>
        <Image source={require('../../../assets/images/botsapay-logo.png')} style={styles.logo} resizeMode="contain" />
        <ThemedText type="subtitle" style={styles.title}>
          Welcome back
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Sign in securely to manage wallets, transfers, QR payments, and activity.
        </ThemedText>
      </View>
      <Card style={styles.card}>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          error={emailError}
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible}
          textContentType="password"
          autoComplete="password"
          error={passwordError}
        />
        <AppButton
          label={passwordVisible ? 'Hide password' : 'Show password'}
          variant="ghost"
          onPress={() => setPasswordVisible((value) => !value)}
          style={styles.passwordToggle}
        />
        <AppButton
          label="Login"
          loading={loading}
          disabled={!email.trim() || !password || Boolean(emailError || passwordError)}
          onPress={handleLogin}
        />
        <View style={styles.links}>
          <Link href="/(auth)/forgot-password">
            <ThemedText type="linkPrimary">Forgot password?</ThemedText>
          </Link>
          <Link href="/(auth)/signup">
            <ThemedText type="linkPrimary">Create account</ThemedText>
          </Link>
        </View>
      </Card>
      <View style={[styles.securityNote, { backgroundColor: theme.primarySoft }]}>
        <ThemedText type="smallBold" style={{ color: theme.primary }}>
          Protected by secure session storage and device confirmation for payments.
        </ThemedText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
  },
  brand: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.four,
  },
  logo: {
    width: '86%',
    maxWidth: 340,
    height: 136,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 360,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    gap: Spacing.three,
  },
  passwordToggle: {
    alignSelf: 'flex-end',
    minHeight: 32,
    paddingHorizontal: 0,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  securityNote: {
    borderRadius: 14,
    padding: Spacing.three,
  },
});
