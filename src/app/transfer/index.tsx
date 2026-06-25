import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { useSendTransfer, useWallets } from '@/api/hooks';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { TextField } from '@/components/ui/text-field';
import { WalletSelector } from '@/components/wallet/wallet-selector';
import { confirmSensitiveAction } from '@/services/security';
import { getErrorMessage } from '@/utils/errors';
import { createIdempotencyKey, formatMoney } from '@/utils/format';

export default function TransferScreen() {
  const wallets = useWallets();
  const sendTransfer = useSendTransfer();
  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletNumber, setToWalletNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const selectedWallet = wallets.data?.find((wallet) => wallet.id === fromWalletId) ?? wallets.data?.[0];
  const amountValue = Number(amount);

  useEffect(() => {
    if (!fromWalletId && wallets.data?.[0]) {
      setFromWalletId(wallets.data[0].id);
    }
  }, [fromWalletId, wallets.data]);

  async function handleSend() {
    if (!selectedWallet) {
      Alert.alert('Choose wallet', 'Select an active wallet before sending money.');
      return;
    }
    if (selectedWallet.status !== 'active') {
      Alert.alert('Wallet unavailable', 'This wallet is not active and cannot be used for transfers.');
      return;
    }
    if (!toWalletNumber.trim()) {
      Alert.alert('Recipient needed', 'Enter the recipient wallet number.');
      return;
    }
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      Alert.alert('Check amount', 'Enter a valid transfer amount.');
      return;
    }
    if (amountValue > Number(selectedWallet.balance)) {
      Alert.alert('Insufficient balance', 'The transfer amount is higher than your available balance.');
      return;
    }

    try {
      const result = await sendTransfer.mutateAsync({
        from_wallet_id: selectedWallet?.id ?? '',
        to_wallet_number: toWalletNumber.trim(),
        amount: amountValue,
        description: description.trim(),
        idempotency_key: createIdempotencyKey('transfer'),
      });
      Alert.alert('Transfer complete', `Reference: ${result.reference_id}`);
      router.back();
    } catch (error) {
      Alert.alert('Transfer failed', getErrorMessage(error));
    }
  }

  function reviewTransfer() {
    if (!selectedWallet) {
      Alert.alert('Choose wallet', 'Select an active wallet before sending money.');
      return;
    }

    Alert.alert(
      'Review transfer',
      [
        `From: ${selectedWallet.name || selectedWallet.wallet_number}`,
        `To: ${toWalletNumber.trim()}`,
        `Amount: ${formatMoney(amountValue, selectedWallet.currency)}`,
      ].join('\n'),
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'default',
          onPress: async () => {
            const confirmed = await confirmSensitiveAction('Confirm BotsaPay transfer');
            if (confirmed) {
              await handleSend();
            }
          },
        },
      ],
    );
  }

  return (
    <Screen title="Send money" subtitle="Transfer funds instantly to another BotsaPay wallet number.">
      {wallets.error && <StateMessage title="Wallets unavailable" message={getErrorMessage(wallets.error)} />}
      {wallets.data && wallets.data.length > 0 && (
        <Card>
          <WalletSelector
            wallets={wallets.data}
            selectedWalletId={selectedWallet?.id}
            onSelect={setFromWalletId}
            label="Send from"
          />
          <TextField label="Recipient wallet number" value={toWalletNumber} onChangeText={setToWalletNumber} />
          <TextField label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
          <TextField label="Description" value={description} onChangeText={setDescription} />
          {selectedWallet && (
            <StateMessage
              title="Available to send"
              message={`${formatMoney(selectedWallet.balance, selectedWallet.currency)} · Daily spend ${formatMoney(
                selectedWallet.daily_spent,
                selectedWallet.currency,
              )} of ${formatMoney(selectedWallet.daily_limit, selectedWallet.currency)}`}
            />
          )}
          <AppButton
            label="Review transfer"
            loading={sendTransfer.isPending}
            disabled={!selectedWallet || !toWalletNumber.trim() || amountValue <= 0}
            onPress={reviewTransfer}
          />
        </Card>
      )}
      {wallets.data?.length === 0 && (
        <StateMessage title="Create a wallet first" message="You need an active source wallet before sending money." />
      )}
    </Screen>
  );
}
