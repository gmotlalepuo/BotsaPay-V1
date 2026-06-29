import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFonts } from 'expo-font';
import { Redirect, Stack, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { SessionTimeoutGuard } from '@/components/session-timeout-guard';
import { ThemedText } from '@/components/themed-text';
import { initializeAuth } from '@/services/auth';
import { useAuthStore } from '@/stores/auth-store';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const initialized = useAuthStore((state) => state.initialized);
  const session = useAuthStore((state) => state.session);
  const segments = useSegments();
  const [queryClient] = useState(() => new QueryClient());
  const [fontsLoaded] = useFonts(MaterialIcons.font);

  useEffect(() => {
    initializeAuth().catch(() => {
      useAuthStore.getState().setInitialized(true);
    });
  }, []);

  if (!initialized || !fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <ActivityIndicator />
        <ThemedText type="small">Starting BotsaPay</ThemedText>
      </View>
    );
  }

  const isAuthRoute = segments[0] === '(auth)';

  if (!session && !isAuthRoute) {
    return <Redirect href="/(auth)/login" />;
  }

  if (session && isAuthRoute) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <SessionTimeoutGuard active={Boolean(session)}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="wallet/create" />
            <Stack.Screen name="wallet/[id]" />
            <Stack.Screen name="transfer/index" />
            <Stack.Screen name="qr/index" />
            <Stack.Screen name="topup/index" />
            <Stack.Screen name="complaints/index" />
            <Stack.Screen name="settings/index" />
            <Stack.Screen name="checkout/return" />
          </Stack>
          <StatusBar style="auto" />
        </SessionTimeoutGuard>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
