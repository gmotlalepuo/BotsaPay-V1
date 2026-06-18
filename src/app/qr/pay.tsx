import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';

import { useCreateGuestCardCheckout, useResolveQrCode, useSendTransfer, useWallets } from '@/api/hooks';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/themed-text';
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

  async function handleWalletPayment() {
    try {
      const result = await transfer.mutateAsync({
        from_wallet_id: selectedWallet?.id ?? '',
        qr_code_id: qr.data?.qr.id,
        idempotency_key: createIdempotencyKey('qr'),
      });
      Alert.alert('Payment complete', `Reference: ${result.reference_id}`);
    } catch (error) {
      Alert.alert('Payment failed', getErrorMessage(error));
    }
  }

  async function handleCardPayment() {
    try {
      const url = await cardCheckout.mutateAsync(qr.data?.qr.id ?? '');
      await WebBrowser.openBrowserAsync(url);
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
            {qr.data.qr.is_active ? 'Active payment request' : 'Inactive payment request'}
          </ThemedText>
          <TextField
            label="Source wallet ID"
            value={walletId || selectedWallet?.id || ''}
            onChangeText={setWalletId}
            placeholder={selectedWallet?.wallet_number}
          />
          <AppButton
            label="Pay from wallet"
            loading={transfer.isPending}
            disabled={!selectedWallet || !qr.data.qr.is_active}
            onPress={handleWalletPayment}
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
