import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert } from 'react-native';

import { useCreateTopUpCheckout, useWallets } from '@/api/hooks';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { TextField } from '@/components/ui/text-field';
import { getErrorMessage } from '@/utils/errors';

export default function TopUpScreen() {
  const wallets = useWallets();
  const checkout = useCreateTopUpCheckout();
  const [walletId, setWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const selectedWallet = wallets.data?.find((wallet) => wallet.id === walletId) ?? wallets.data?.[0];

  async function handleTopUp() {
    try {
      const url = await checkout.mutateAsync({
        wallet_id: selectedWallet?.id ?? '',
        amount: Number(amount),
      });
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      Alert.alert('Top-up failed', getErrorMessage(error));
    }
  }

  return (
    <Screen title="Top up" subtitle="Start a Stripe Checkout session to add funds to a wallet.">
      {wallets.error && <StateMessage title="Wallets unavailable" message={getErrorMessage(wallets.error)} />}
      <Card>
        <TextField
          label="Wallet ID"
          value={walletId || selectedWallet?.id || ''}
          onChangeText={setWalletId}
          placeholder={selectedWallet?.wallet_number}
        />
        <TextField label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
        <AppButton
          label="Open checkout"
          loading={checkout.isPending}
          disabled={!selectedWallet || Number(amount) <= 0}
          onPress={handleTopUp}
        />
      </Card>
    </Screen>
  );
}
