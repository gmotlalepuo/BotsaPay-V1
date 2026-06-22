import { Pressable, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import type { Wallet } from '@/types/wallet';
import { formatMoney } from '@/utils/format';

export function WalletCard({ wallet }: { wallet: Wallet }) {
  const statusLabel = wallet.status.charAt(0).toUpperCase() + wallet.status.slice(1);

  return (
    <Link href={`/wallet/${wallet.id}`} asChild>
      <Pressable>
        <Card style={styles.card}>
          <View style={styles.accent} />
          <View style={styles.row}>
            <View style={styles.walletHeading}>
              <View style={styles.iconWrap}>
                <AppIcon
                  name={{ ios: 'wallet.bifold.fill', android: 'account_balance_wallet' }}
                  size={22}
                  tintColor="#FFFFFF"
                />
              </View>
              <View style={styles.info}>
              <ThemedText type="smallBold">{wallet.name || 'BotsaPay Wallet'}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {wallet.wallet_number}
              </ThemedText>
              </View>
            </View>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <ThemedText type="smallBold" style={styles.statusText}>{statusLabel}</ThemedText>
            </View>
          </View>
          <ThemedText type="small" themeColor="textSecondary">Available balance</ThemedText>
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
  card: {
    overflow: 'hidden',
    paddingTop: Spacing.four,
  },
  accent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: '#D99A13',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  info: {
    flex: 1,
    gap: Spacing.half,
  },
  walletHeading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D7045',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: '#E8F3EC',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16834D',
  },
  statusText: {
    color: '#0D7045',
    fontSize: 12,
  },
  balance: {
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.7,
  },
});
