import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/themed-text';
import { initializeAuth } from '@/services/auth';
import { useAuthStore } from '@/stores/auth-store';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const initialized = useAuthStore((state) => state.initialized);
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    initializeAuth().catch(() => {
      useAuthStore.getState().setInitialized(true);
    });
  }, []);

  if (!initialized) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <ActivityIndicator />
        <ThemedText type="small">Starting BotsaPay</ThemedText>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="wallet/create" />
          <Stack.Screen name="wallet/[id]" />
          <Stack.Screen name="transfer" />
          <Stack.Screen name="qr" />
          <Stack.Screen name="topup" />
          <Stack.Screen name="complaints" />
          <Stack.Screen name="settings" />
        </Stack>
        <StatusBar style="auto" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
