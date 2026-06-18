import { ActivityIndicator } from 'react-native';

import { useTransactions } from '@/api/hooks';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { TransactionRow } from '@/components/wallet/transaction-row';
import { getErrorMessage } from '@/utils/errors';

export default function TransactionsTab() {
  const transactions = useTransactions();

  return (
    <Screen title="Activity" subtitle="Transfers, top-ups, QR payments, refunds, and adjustments.">
      {transactions.isLoading && <ActivityIndicator />}
      {transactions.error && (
        <StateMessage title="Transactions unavailable" message={getErrorMessage(transactions.error)} />
      )}
      {transactions.data?.length === 0 && (
        <StateMessage title="No activity yet" message="Transactions will appear here after wallet activity." />
      )}
      {transactions.data?.map((transaction) => (
        <TransactionRow key={transaction.id} transaction={transaction} />
      ))}
    </Screen>
  );
}
