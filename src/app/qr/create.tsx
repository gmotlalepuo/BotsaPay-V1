import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { useCreateQrCode, useWallets } from '@/api/hooks';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { TextField } from '@/components/ui/text-field';
import { getErrorMessage } from '@/utils/errors';

export default function CreateQrScreen() {
  const wallets = useWallets();
  const createQr = useCreateQrCode();
  const [walletId, setWalletId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const selectedWallet = wallets.data?.find((wallet) => wallet.id === walletId) ?? wallets.data?.[0];

  async function handleCreate() {
    try {
      await createQr.mutateAsync({
        wallet_id: selectedWallet?.id ?? '',
        description: description.trim(),
        amount: Number(amount),
        single_use: true,
        expiry_at: null,
      });
      router.back();
    } catch (error) {
      Alert.alert('QR creation failed', getErrorMessage(error));
    }
  }

  return (
    <Screen title="Create QR" subtitle="Generate a single-use payment request for one of your wallets.">
      {wallets.error && <StateMessage title="Wallets unavailable" message={getErrorMessage(wallets.error)} />}
      <Card>
        <TextField
          label="Wallet ID"
          value={walletId || selectedWallet?.id || ''}
          onChangeText={setWalletId}
          placeholder={selectedWallet?.wallet_number}
        />
        <TextField label="Description" value={description} onChangeText={setDescription} />
        <TextField label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
        <AppButton
          label="Create QR"
          loading={createQr.isPending}
          disabled={!selectedWallet || !description.trim() || Number(amount) <= 0}
          onPress={handleCreate}
        />
      </Card>
    </Screen>
  );
}
