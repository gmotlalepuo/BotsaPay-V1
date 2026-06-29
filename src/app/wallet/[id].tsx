import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, View } from 'react-native';

import { useRenameWallet, useWalletDetail } from '@/api/hooks';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { TextField } from '@/components/ui/text-field';
import { TransactionRow } from '@/components/wallet/transaction-row';
import { Spacing } from '@/constants/theme';
import { formatDate, formatMoney } from '@/utils/format';
import { getErrorMessage } from '@/utils/errors';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export default function WalletDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const walletDetail = useWalletDetail(id);
  const renameWallet = useRenameWallet(id);
  const [name, setName] = useState('');
  const wallet = walletDetail.data?.wallet;
  const walletQrCodes = walletDetail.data?.qrCodes ?? [];

  async function handleRename() {
    try {
      await renameWallet.mutateAsync(name.trim());
      Alert.alert('Wallet renamed', 'Your wallet name has been updated.');
      setName('');
    } catch (error) {
      Alert.alert('Rename failed', getErrorMessage(error));
    }
  }

  return (
    <Screen title={wallet?.name || 'Wallet details'} subtitle={wallet?.wallet_number}>
      {walletDetail.isLoading && <ActivityIndicator />}
      {walletDetail.error && (
        <StateMessage title="Wallet unavailable" message={getErrorMessage(walletDetail.error)} />
      )}
      {wallet && (
        <>
          <Card>
            <ThemedText type="subtitle">{formatMoney(wallet.balance, wallet.currency)}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Status: {wallet.status}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Daily limit: {formatMoney(wallet.daily_limit, wallet.currency)}
            </ThemedText>
          </Card>
          <Card>
            <TextField label="Rename wallet" value={name} onChangeText={setName} placeholder={wallet.name ?? ''} />
            <AppButton
              label="Save name"
              variant="secondary"
              loading={renameWallet.isPending}
              disabled={!name.trim()}
              onPress={handleRename}
            />
          </Card>
          <Card style={styles.qrSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionCopy}>
                <ThemedText type="smallBold">Wallet QR codes</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Payment requests receiving into this wallet
                </ThemedText>
              </View>
              <View style={styles.sectionActions}>
                <Link href="/qr/create" asChild>
                  <AppButton label="Create QR" variant="secondary" />
                </Link>
                <Link href="/qr" asChild>
                  <AppButton label="Manage all" variant="ghost" />
                </Link>
              </View>
            </View>
            {walletQrCodes.length === 0 && (
              <StateMessage title="No QR codes" message="Create a QR request to receive payments into this wallet." />
            )}
            {walletQrCodes.map((qrCode) => (
              <View key={qrCode.id} style={[styles.qrItem, { borderTopColor: theme.border }]}>
                <View style={styles.qrInfo}>
                  <View>
                    <ThemedText type="smallBold">{qrCode.description}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {formatMoney(qrCode.amount, qrCode.currency)} - {qrCode.is_active ? 'Active' : 'Inactive'}
                    </ThemedText>
                  </View>
                  <ThemedText type="small" themeColor="textSecondary">
                    Paid {qrCode.paid_count} {qrCode.paid_count === 1 ? 'time' : 'times'}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Expires {formatDate(qrCode.expiry_at)}
                  </ThemedText>
                </View>
                {qrCode.qr_image_url ? (
                  <Image source={{ uri: qrCode.qr_image_url }} style={styles.qrImage} />
                ) : null}
              </View>
            ))}
          </Card>
          <ThemedText type="smallBold">Recent transactions</ThemedText>
          {walletDetail.data?.transactions.length === 0 && (
            <StateMessage title="No recent activity" message="Wallet activity will appear here." />
          )}
          {walletDetail.data?.transactions.map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} />
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  qrSection: {
    gap: Spacing.three,
  },
  sectionHeader: {
    gap: Spacing.two,
  },
  sectionCopy: {
    gap: Spacing.half,
  },
  sectionActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  qrItem: {
    borderTopWidth: 1,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  qrInfo: {
    gap: Spacing.one,
  },
  qrImage: {
    width: 132,
    height: 132,
    alignSelf: 'center',
    borderRadius: 12,
  },
});
