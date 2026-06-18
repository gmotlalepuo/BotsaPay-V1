import { Pressable, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import type { Wallet } from '@/types/wallet';
import { formatMoney } from '@/utils/format';

export function WalletCard({ wallet }: { wallet: Wallet }) {
  return (
    <Link href={`/wallet/${wallet.id}`} asChild>
      <Pressable>
        <Card>
          <View style={styles.row}>
            <View style={styles.info}>
              <ThemedText type="smallBold">{wallet.name || 'BotsaPay Wallet'}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {wallet.wallet_number}
              </ThemedText>
            </View>
            <ThemedText type="smallBold">{wallet.status}</ThemedText>
          </View>
          <ThemedText type="subtitle" style={styles.balance}>
            {formatMoney(wallet.balance, wallet.currency)}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Daily spend {formatMoney(wallet.daily_spent, wallet.currency)} of{' '}
            {formatMoney(wallet.daily_limit, wallet.currency)}
          </ThemedText>
        </Card>
      </Pressable>
    </Link>
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
    gap: Spacing.half,
  },
  balance: {
    fontSize: 26,
    lineHeight: 32,
  },
});
