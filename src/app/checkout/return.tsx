import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';

import { queryKeys, useReconcileTopUpSession } from '@/api/hooks';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { getErrorMessage } from '@/utils/errors';
import { useQueryClient } from '@tanstack/react-query';

type CheckoutReturnParams = {
  status?: string;
  flow?: string;
  referenceId?: string;
  sessionId?: string;
  session_id?: string;
};

export default function CheckoutReturnScreen() {
  const queryClient = useQueryClient();
  const reconcileTopUp = useReconcileTopUpSession();
  const {
    status = 'pending',
    flow = 'checkout',
    referenceId,
    sessionId,
    session_id,
  } = useLocalSearchParams<CheckoutReturnParams>();
  const checkoutSessionId = sessionId ?? session_id;
  const isSuccess = status === 'success' || status === 'completed' || status === 'paid';
  const isCancelled = status === 'cancelled' || status === 'canceled';
  const shouldReconcileTopUp = isSuccess && flow === 'topup' && Boolean(checkoutSessionId);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.wallets });
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
  }, [queryClient]);

  useEffect(() => {
    if (
      !shouldReconcileTopUp ||
      !checkoutSessionId ||
      reconcileTopUp.isPending ||
      reconcileTopUp.isError ||
      reconcileTopUp.data
    ) {
      return;
    }

    reconcileTopUp.mutate(checkoutSessionId);
  }, [checkoutSessionId, reconcileTopUp, shouldReconcileTopUp]);

  const verifiedTopUp = reconcileTopUp.data?.credited || reconcileTopUp.data?.already_credited;
  const title = shouldReconcileTopUp
    ? verifiedTopUp
      ? 'Top-up verified'
      : reconcileTopUp.isError
        ? 'Top-up needs review'
        : 'Verifying top-up'
    : isSuccess
      ? 'Checkout complete'
      : isCancelled
        ? 'Checkout cancelled'
        : 'Checkout returned';
  const message = shouldReconcileTopUp
    ? verifiedTopUp
      ? 'Your payment was verified and your wallet, activity, and alerts have been refreshed.'
      : reconcileTopUp.isError
        ? getErrorMessage(reconcileTopUp.error)
        : 'We are confirming the payment with BotsaPay before updating your wallet.'
    : isSuccess
      ? flow === 'topup'
        ? 'We could not find the checkout session reference. Please check Activity before trying again.'
        : 'We are refreshing your wallet and activity. If the balance has not updated yet, check Activity in a moment.'
    : isCancelled
      ? 'No payment was completed. You can safely try again when you are ready.'
      : 'We are checking the final checkout result. Confirm the payment status from Activity before taking action.';

  return (
    <Screen title={title} subtitle="You are back in BotsaPay.">
      <StateMessage title={title} message={message} />
      {reconcileTopUp.isPending ? <ActivityIndicator /> : null}
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
        {checkoutSessionId ? (
          <ThemedText type="small" themeColor="textSecondary">
            Session: {checkoutSessionId}
          </ThemedText>
        ) : null}
        {reconcileTopUp.data?.reference_id ? (
          <ThemedText type="small" themeColor="textSecondary">
            Top-up reference: {reconcileTopUp.data.reference_id}
          </ThemedText>
        ) : null}
        <AppButton label="View activity" onPress={() => router.replace('/(tabs)/transactions')} />
        <AppButton label="Back to home" variant="secondary" onPress={() => router.replace('/(tabs)/home')} />
      </Card>
    </Screen>
  );
}
