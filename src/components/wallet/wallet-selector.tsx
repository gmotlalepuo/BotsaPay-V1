import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { Card } from '@/components/ui/card';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Wallet } from '@/types/wallet';
import { formatMoney } from '@/utils/format';

type WalletSelectorProps = {
  wallets: Wallet[];
  selectedWalletId?: string;
  onSelect: (walletId: string) => void;
  label?: string;
};

export function WalletSelector({
  wallets,
  selectedWalletId,
  onSelect,
  label = 'Choose wallet',
}: WalletSelectorProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <View style={styles.list}>
        {wallets.map((wallet) => {
          const selected = wallet.id === selectedWalletId;
          return (
            <Pressable
              key={wallet.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onSelect(wallet.id)}>
              <Card
                style={[
                  styles.option,
                  selected && {
                    borderColor: theme.primary,
                    backgroundColor: theme.primarySoft,
                  },
                ]}>
                <View style={[styles.icon, { backgroundColor: selected ? theme.primary : theme.backgroundSelected }]}>
                  <AppIcon
                    name={{ ios: 'wallet.bifold.fill', android: 'account_balance_wallet' }}
                    size={20}
                    tintColor={selected ? theme.primaryText : theme.primary}
                  />
                </View>
                <View style={styles.copy}>
                  <ThemedText type="smallBold">{wallet.name || 'BotsaPay Wallet'}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {wallet.wallet_number} · {wallet.status}
                  </ThemedText>
                  <ThemedText type="smallBold">{formatMoney(wallet.balance, wallet.currency)}</ThemedText>
                </View>
                {selected && (
                  <AppIcon name={{ ios: 'checkmark.circle.fill', android: 'check_circle' }} size={22} tintColor={theme.primary} />
                )}
              </Card>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.two,
  },
  list: {
    gap: Spacing.two,
  },
  option: {
    borderRadius: Radius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: Spacing.half,
  },
});
