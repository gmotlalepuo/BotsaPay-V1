import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { useSendTransfer, useWallets } from '@/api/hooks';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { TextField } from '@/components/ui/text-field';
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

  async function handleSend() {
    try {
      const result = await sendTransfer.mutateAsync({
        from_wallet_id: selectedWallet?.id ?? '',
        to_wallet_number: toWalletNumber.trim(),
        amount: Number(amount),
        description: description.trim(),
        idempotency_key: createIdempotencyKey('transfer'),
      });
      Alert.alert('Transfer complete', `Reference: ${result.reference_id}`);
      router.back();
    } catch (error) {
      Alert.alert('Transfer failed', getErrorMessage(error));
    }
  }

  return (
    <Screen title="Send money" subtitle="Transfer funds instantly to another BotsaPay wallet number.">
      {wallets.error && <StateMessage title="Wallets unavailable" message={getErrorMessage(wallets.error)} />}
      {selectedWallet && (
        <Card>
          <TextField
            label="Source wallet ID"
            value={fromWalletId || selectedWallet.id}
            onChangeText={setFromWalletId}
            placeholder={selectedWallet.id}
          />
          <StateMessage
            title={selectedWallet.name || 'Selected wallet'}
            message={`${selectedWallet.wallet_number} - ${formatMoney(selectedWallet.balance, selectedWallet.currency)}`}
          />
          <TextField label="Recipient wallet number" value={toWalletNumber} onChangeText={setToWalletNumber} />
          <TextField label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
          <TextField label="Description" value={description} onChangeText={setDescription} />
          <AppButton
            label="Send money"
            loading={sendTransfer.isPending}
            disabled={!selectedWallet || !toWalletNumber.trim() || Number(amount) <= 0}
            onPress={handleSend}
          />
        </Card>
      )}
      {wallets.data?.length === 0 && (
        <StateMessage title="Create a wallet first" message="You need an active source wallet before sending money." />
      )}
    </Screen>
  );
}
