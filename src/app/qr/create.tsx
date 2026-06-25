import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { useCreateQrCode, useWallets } from '@/api/hooks';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { TextField } from '@/components/ui/text-field';
import { WalletSelector } from '@/components/wallet/wallet-selector';
import { getErrorMessage } from '@/utils/errors';
import { formatMoney } from '@/utils/format';

export default function CreateQrScreen() {
  const wallets = useWallets();
  const createQr = useCreateQrCode();
  const [walletId, setWalletId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const selectedWallet = wallets.data?.find((wallet) => wallet.id === walletId) ?? wallets.data?.[0];
  const amountValue = Number(amount);

  useEffect(() => {
    if (!walletId && wallets.data?.[0]) {
      setWalletId(wallets.data[0].id);
    }
  }, [walletId, wallets.data]);

  async function handleCreate() {
    if (!selectedWallet || !description.trim() || !Number.isFinite(amountValue) || amountValue <= 0) {
      Alert.alert('Check QR request', 'Choose a wallet, add a description, and enter a valid amount.');
      return;
    }

    try {
      await createQr.mutateAsync({
        wallet_id: selectedWallet?.id ?? '',
        description: description.trim(),
        amount: amountValue,
        single_use: true,
        expiry_at: null,
      });
      router.back();
    } catch (error) {
      Alert.alert('QR creation failed', getErrorMessage(error));
    }
  }

  function reviewCreate() {
    if (!selectedWallet) {
      Alert.alert('Choose wallet', 'Select the wallet that should receive this QR payment.');
      return;
    }

    Alert.alert(
      'Review QR request',
      `Request ${formatMoney(amountValue, selectedWallet.currency)} into ${selectedWallet.name || selectedWallet.wallet_number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create QR', onPress: handleCreate },
      ],
    );
  }

  return (
    <Screen title="Create QR" subtitle="Generate a single-use payment request for one of your wallets.">
      {wallets.error && <StateMessage title="Wallets unavailable" message={getErrorMessage(wallets.error)} />}
      <Card>
        {wallets.data && wallets.data.length > 0 && (
          <WalletSelector
            wallets={wallets.data}
            selectedWalletId={selectedWallet?.id}
            onSelect={setWalletId}
            label="Receive into"
          />
        )}
        <TextField label="Description" value={description} onChangeText={setDescription} />
        <TextField label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
        <AppButton
          label="Review QR"
          loading={createQr.isPending}
          disabled={!selectedWallet || !description.trim() || amountValue <= 0}
          onPress={reviewCreate}
        />
      </Card>
    </Screen>
  );
}
