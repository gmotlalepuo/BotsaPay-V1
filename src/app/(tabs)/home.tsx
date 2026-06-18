import { Link } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useProfile, useWallets } from '@/api/hooks';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { WalletCard } from '@/components/wallet/wallet-card';
import { Spacing } from '@/constants/theme';
import { getMissingConfig } from '@/utils/env';
import { getErrorMessage } from '@/utils/errors';
import { getDisplayName } from '@/utils/format';

export default function HomeTab() {
  const profile = useProfile();
  const wallets = useWallets();
  const missingConfig = getMissingConfig();
  const primaryWallet = wallets.data?.[0];

  return (
    <Screen
      title={`Hello, ${getDisplayName(profile.data?.first_name, profile.data?.last_name, profile.data?.email)}`}
      subtitle="Your wallet command center for balances, transfers, QR payments, and alerts.">
      {missingConfig.length > 0 && (
        <StateMessage
          title="Backend configuration needed"
          message={`Add ${missingConfig.join(', ')} to enable live authentication and API requests.`}
        />
      )}

      {wallets.isLoading && <ActivityIndicator />}
      {wallets.error && (
        <StateMessage title="Wallets unavailable" message={getErrorMessage(wallets.error)} />
      )}
      {primaryWallet && <WalletCard wallet={primaryWallet} />}

      <View style={styles.actions}>
        <Link href="/transfer" asChild>
          <AppButton label="Send money" />
        </Link>
        <Link href="/qr/scan" asChild>
          <AppButton label="Scan QR" variant="secondary" />
        </Link>
      </View>

      <Card>
        <ThemedText type="smallBold">Quick actions</ThemedText>
        <View style={styles.grid}>
          <Link href="/wallet/create" asChild>
            <AppButton label="Create wallet" variant="secondary" />
          </Link>
          <Link href="/qr/create" asChild>
            <AppButton label="Create QR" variant="secondary" />
          </Link>
          <Link href="/topup" asChild>
            <AppButton label="Top up" variant="secondary" />
          </Link>
          <Link href="/complaints" asChild>
            <AppButton label="Support" variant="secondary" />
          </Link>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  grid: {
    gap: Spacing.two,
  },
});
