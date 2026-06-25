import { Link } from 'expo-router';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useQrCodes, useUpdateQrCode, useWallets } from '@/api/hooks';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Wallet } from '@/types/wallet';
import { getErrorMessage } from '@/utils/errors';
import { formatDate, formatMoney } from '@/utils/format';
import { useMemo, useState } from 'react';

function walletDisplayName(wallet?: Wallet) {
  if (!wallet) return 'Unknown wallet';
  return wallet.name || wallet.wallet_number || 'BotsaPay Wallet';
}

export default function QrListScreen() {
  const theme = useTheme();
  const qrCodes = useQrCodes();
  const wallets = useWallets();
  const update = useUpdateQrCode();
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const walletById = useMemo(
    () => new Map((wallets.data ?? []).map((wallet) => [wallet.id, wallet])),
    [wallets.data],
  );
  const filteredQrCodes = useMemo(() => {
    if (!selectedWalletId) return qrCodes.data ?? [];
    return (qrCodes.data ?? []).filter((qr) => qr.wallet_id === selectedWalletId);
  }, [qrCodes.data, selectedWalletId]);

  return (
    <Screen title="QR payments" subtitle="Create, view, activate, and deactivate wallet payment requests.">
      <Link href="/qr/create" asChild>
        <AppButton label="Create QR request" />
      </Link>
      <Link href="/qr/scan" asChild>
        <AppButton label="Scan QR" variant="secondary" />
      </Link>
      {qrCodes.isLoading && <ActivityIndicator />}
      {wallets.isLoading && <ActivityIndicator />}
      {qrCodes.error && <StateMessage title="QR codes unavailable" message={getErrorMessage(qrCodes.error)} />}
      {wallets.error && <StateMessage title="Wallet filter unavailable" message={getErrorMessage(wallets.error)} />}
      {wallets.data && wallets.data.length > 0 ? (
        <Card style={styles.filterCard}>
          <ThemedText type="smallBold">Filter by wallet</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: selectedWalletId === null }}
              onPress={() => setSelectedWalletId(null)}
              style={[
                styles.filterChip,
                { borderColor: theme.border, backgroundColor: theme.backgroundElement },
                selectedWalletId === null && { borderColor: theme.primary, backgroundColor: theme.primarySoft },
              ]}>
              <ThemedText type="smallBold" style={selectedWalletId === null ? { color: theme.primary } : undefined}>
                All wallets
              </ThemedText>
            </Pressable>
            {wallets.data.map((wallet) => {
              const selected = selectedWalletId === wallet.id;
              return (
                <Pressable
                  key={wallet.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setSelectedWalletId(wallet.id)}
                  style={[
                    styles.filterChip,
                    { borderColor: theme.border, backgroundColor: theme.backgroundElement },
                    selected && { borderColor: theme.primary, backgroundColor: theme.primarySoft },
                  ]}>
                  <ThemedText type="smallBold" style={selected ? { color: theme.primary } : undefined}>
                    {walletDisplayName(wallet)}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {wallet.wallet_number}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        </Card>
      ) : null}
      {qrCodes.data?.length === 0 && (
        <StateMessage title="No QR codes yet" message="Create a QR payment request for one of your wallets." />
      )}
      {qrCodes.data && qrCodes.data.length > 0 && filteredQrCodes.length === 0 && (
        <StateMessage title="No QR codes for this wallet" message="Choose another wallet or create a new QR request." />
      )}
      {filteredQrCodes.map((qr) => {
        const wallet = walletById.get(qr.wallet_id);
        return (
        <Card key={qr.id}>
          <View style={{ gap: 4 }}>
            <ThemedText type="smallBold">{qr.description}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Wallet: {walletDisplayName(wallet)}
              {wallet?.wallet_number ? ` - ${wallet.wallet_number}` : ''}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {formatMoney(qr.amount, qr.currency)} - {qr.is_active ? 'Active' : 'Inactive'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Expires {formatDate(qr.expiry_at)}
            </ThemedText>
          </View>
          {qr.qr_image_url ? (
            <Image source={{ uri: qr.qr_image_url }} style={{ width: 160, height: 160, alignSelf: 'center' }} />
          ) : null}
          <AppButton
            label={qr.is_active ? 'Deactivate' : 'Activate'}
            variant="secondary"
            loading={update.isPending}
            onPress={() => update.mutate({ qrCodeId: qr.id, isActive: !qr.is_active })}
          />
        </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterCard: {
    gap: Spacing.two,
  },
  filterList: {
    gap: Spacing.one,
    paddingRight: Spacing.two,
  },
  filterChip: {
    minWidth: 128,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    gap: 2,
  },
});
