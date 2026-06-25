import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';

import { useCreateGuestCardCheckout, useResolveQrCode, useSendTransfer, useWallets } from '@/api/hooks';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { WalletSelector } from '@/components/wallet/wallet-selector';
import { ThemedText } from '@/components/themed-text';
import { createCheckoutReturnUrls, openCheckoutSession, parseCheckoutReturnUrl } from '@/services/checkout';
import { confirmSensitiveAction } from '@/services/security';
import { getErrorMessage } from '@/utils/errors';
import { createIdempotencyKey, formatMoney } from '@/utils/format';

export default function PayQrScreen() {
  const { token = '' } = useLocalSearchParams<{ token: string }>();
  const qr = useResolveQrCode(token);
  const wallets = useWallets();
  const transfer = useSendTransfer();
  const cardCheckout = useCreateGuestCardCheckout();
  const [walletId, setWalletId] = useState('');
  const selectedWallet = wallets.data?.find((wallet) => wallet.id === walletId) ?? wallets.data?.[0];

  useEffect(() => {
    if (!walletId && wallets.data?.[0]) {
      setWalletId(wallets.data[0].id);
    }
  }, [walletId, wallets.data]);

  async function handleWalletPayment() {
    if (!selectedWallet || !qr.data?.qr.is_active) {
      Alert.alert('Payment unavailable', 'Choose a wallet and make sure the QR request is active.');
      return;
    }
    if (selectedWallet.status !== 'active') {
      Alert.alert('Wallet unavailable', 'This wallet is not active and cannot be used for payments.');
      return;
    }
    if (Number(qr.data.qr.amount) > Number(selectedWallet.balance)) {
      Alert.alert('Insufficient balance', 'The QR payment amount is higher than your available balance.');
      return;
    }

    try {
      const result = await transfer.mutateAsync({
        from_wallet_id: selectedWallet?.id ?? '',
        qr_code_id: qr.data?.qr.id,
        idempotency_key: createIdempotencyKey('qr'),
      });
      Alert.alert('Payment complete', `Reference: ${result.reference_id}`, [
        { text: 'Done', onPress: () => router.replace('/(tabs)/home') },
      ]);
    } catch (error) {
      Alert.alert('Payment failed', getErrorMessage(error));
    }
  }

  function reviewWalletPayment() {
    if (!selectedWallet || !qr.data) {
      Alert.alert('Payment unavailable', 'Choose a wallet and wait for the QR request to load.');
      return;
    }

    Alert.alert(
      'Review QR payment',
      [
        `To: ${qr.data.receiver?.display_name || qr.data.receiver?.wallet_number || 'BotsaPay merchant'}`,
        `From: ${selectedWallet.name || selectedWallet.wallet_number}`,
        `Amount: ${formatMoney(qr.data.qr.amount, qr.data.qr.currency)}`,
      ].join('\n'),
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay',
          onPress: async () => {
            const confirmed = await confirmSensitiveAction('Confirm BotsaPay QR payment');
            if (confirmed) {
              await handleWalletPayment();
            }
          },
        },
      ],
    );
  }

  async function handleCardPayment() {
    try {
      const qrCodeId = qr.data?.qr.id ?? '';
      const returnUrls = createCheckoutReturnUrls({
        flow: 'qr-card',
        referenceId: qrCodeId,
      });
      const url = await cardCheckout.mutateAsync({
        qrCodeId,
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
      Alert.alert('Card checkout failed', getErrorMessage(error));
    }
  }

  return (
    <Screen title="Pay QR" subtitle="Review the payment request before paying from a wallet or card checkout.">
      {qr.isLoading && <ActivityIndicator />}
      {qr.error && <StateMessage title="QR unavailable" message={getErrorMessage(qr.error)} />}
      {qr.data && (
        <Card>
          <ThemedText type="smallBold">{qr.data.qr.description}</ThemedText>
          <ThemedText type="subtitle">{formatMoney(qr.data.qr.amount, qr.data.qr.currency)}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Payee: {qr.data.receiver?.display_name || qr.data.receiver?.wallet_number || 'BotsaPay wallet'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {qr.data.qr.is_active ? 'Active payment request' : 'Inactive payment request'}
          </ThemedText>
          {wallets.data && wallets.data.length > 0 && (
            <WalletSelector
              wallets={wallets.data}
              selectedWalletId={selectedWallet?.id}
              onSelect={setWalletId}
              label="Pay from"
            />
          )}
          <AppButton
            label="Review wallet payment"
            loading={transfer.isPending}
            disabled={!selectedWallet || !qr.data.qr.is_active}
            onPress={reviewWalletPayment}
          />
          <AppButton
            label="Pay by card"
            variant="secondary"
            loading={cardCheckout.isPending}
            disabled={!qr.data.qr.is_active}
            onPress={handleCardPayment}
          />
        </Card>
      )}
    </Screen>
  );
}
