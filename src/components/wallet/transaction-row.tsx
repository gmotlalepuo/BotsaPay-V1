import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import type { Transaction } from '@/types/wallet';
import { formatDate, formatMoney } from '@/utils/format';

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.info}>
          <ThemedText type="smallBold">{transaction.description || transaction.type}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {transaction.reference_id}
          </ThemedText>
        </View>
        <ThemedText type="smallBold">{formatMoney(transaction.amount, transaction.currency)}</ThemedText>
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {transaction.status} - {formatDate(transaction.created_at)}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  info: {
    flex: 1,
  },
});
