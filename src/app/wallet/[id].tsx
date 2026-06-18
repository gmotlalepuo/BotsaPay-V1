import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';

import { useRenameWallet, useWalletDetail } from '@/api/hooks';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { TextField } from '@/components/ui/text-field';
import { TransactionRow } from '@/components/wallet/transaction-row';
import { formatMoney } from '@/utils/format';
import { getErrorMessage } from '@/utils/errors';
import { ThemedText } from '@/components/themed-text';

export default function WalletDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const walletDetail = useWalletDetail(id);
  const renameWallet = useRenameWallet(id);
  const [name, setName] = useState('');
  const wallet = walletDetail.data?.wallet;

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
