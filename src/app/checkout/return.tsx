import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

import { queryKeys } from '@/api/hooks';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { useQueryClient } from '@tanstack/react-query';

type CheckoutReturnParams = {
  status?: string;
  flow?: string;
  referenceId?: string;
};

export default function CheckoutReturnScreen() {
  const queryClient = useQueryClient();
  const { status = 'pending', flow = 'checkout', referenceId } = useLocalSearchParams<CheckoutReturnParams>();
  const isSuccess = status === 'success' || status === 'completed' || status === 'paid';
  const isCancelled = status === 'cancelled' || status === 'canceled';

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.wallets });
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
  }, [queryClient]);

  const title = isSuccess ? 'Checkout complete' : isCancelled ? 'Checkout cancelled' : 'Checkout returned';
  const message = isSuccess
    ? 'We are refreshing your wallet and activity. If the balance has not updated yet, check Activity in a moment.'
    : isCancelled
      ? 'No payment was completed. You can safely try again when you are ready.'
      : 'We are checking the final checkout result. Confirm the payment status from Activity before taking action.';

  return (
    <Screen title={title} subtitle="You are back in BotsaPay.">
      <StateMessage title={title} message={message} />
      <Card>
        <ThemedText type="smallBold">Checkout details</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Flow: {flow}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Status: {status}
        </ThemedText>
        {referenceId ? (
          <ThemedText type="small" themeColor="textSecondary">
            Reference: {referenceId}
          </ThemedText>
        ) : null}
        <AppButton label="View activity" onPress={() => router.replace('/(tabs)/transactions')} />
        <AppButton label="Back to home" variant="secondary" onPress={() => router.replace('/(tabs)/home')} />
      </Card>
    </Screen>
  );
}
