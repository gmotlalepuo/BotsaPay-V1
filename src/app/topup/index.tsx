import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { useCreateTopUpCheckout, useWallets } from '@/api/hooks';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { TextField } from '@/components/ui/text-field';
import { WalletSelector } from '@/components/wallet/wallet-selector';
import { createCheckoutReturnUrls, openCheckoutSession, parseCheckoutReturnUrl } from '@/services/checkout';
import { confirmSensitiveAction } from '@/services/security';
import { getErrorMessage } from '@/utils/errors';
import { formatMoney } from '@/utils/format';

export default function TopUpScreen() {
  const wallets = useWallets();
  const checkout = useCreateTopUpCheckout();
  const [walletId, setWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const selectedWallet = wallets.data?.find((wallet) => wallet.id === walletId) ?? wallets.data?.[0];
  const amountValue = Number(amount);

  useEffect(() => {
    if (!walletId && wallets.data?.[0]) {
      setWalletId(wallets.data[0].id);
    }
  }, [walletId, wallets.data]);

  async function handleTopUp() {
    if (!selectedWallet || !Number.isFinite(amountValue) || amountValue <= 0) {
      Alert.alert('Check top-up', 'Choose a wallet and enter a valid top-up amount.');
      return;
    }

    try {
      const returnUrls = createCheckoutReturnUrls({
        flow: 'topup',
        referenceId: selectedWallet.id,
      });
      const url = await checkout.mutateAsync({
        wallet_id: selectedWallet?.id ?? '',
        amount: amountValue,
        success_url: returnUrls.successUrl,
        cancel_url: returnUrls.cancelUrl,
        return_url: returnUrls.successUrl,
        mobile_return_url: returnUrls.successUrl,
      });
      const result = await openCheckoutSession(url, returnUrls.redirectUrl);
      if (result.type === 'success') {
        router.replace({ pathname: '/checkout/return', params: parseCheckoutReturnUrl(result.url) });
      }
    } catch (error) {
      Alert.alert('Top-up failed', getErrorMessage(error));
    }
  }

  function reviewTopUp() {
    if (!selectedWallet) {
      Alert.alert('Choose wallet', 'Select the wallet you want to top up.');
      return;
    }

    Alert.alert(
      'Review top-up',
      `Add ${formatMoney(amountValue, selectedWallet.currency)} to ${selectedWallet.name || selectedWallet.wallet_number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            const confirmed = await confirmSensitiveAction('Confirm BotsaPay top-up');
            if (confirmed) {
              await handleTopUp();
            }
          },
        },
      ],
    );
  }

  return (
    <Screen title="Top up" subtitle="Start a Stripe Checkout session to add funds to a wallet.">
      {wallets.error && <StateMessage title="Wallets unavailable" message={getErrorMessage(wallets.error)} />}
      <Card>
        {wallets.data && wallets.data.length > 0 && (
          <WalletSelector
            wallets={wallets.data}
            selectedWalletId={selectedWallet?.id}
            onSelect={setWalletId}
            label="Top up wallet"
          />
        )}
        <TextField label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
        <AppButton
          label="Review top-up"
          loading={checkout.isPending}
          disabled={!selectedWallet || amountValue <= 0}
          onPress={reviewTopUp}
        />
      </Card>
    </Screen>
  );
}
