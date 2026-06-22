import { Link } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { useWallets } from '@/api/hooks';
import { AppButton } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { WalletCard } from '@/components/wallet/wallet-card';
import { getErrorMessage } from '@/utils/errors';

export default function WalletsTab() {
  const wallets = useWallets();

  return (
    <Screen title="Wallets" subtitle="Create and manage your BotsaPay wallets.">
      <Link href="/wallet/create" asChild>
        <AppButton label="Create wallet" icon={{ ios: 'plus', android: 'add' }} />
      </Link>
      {wallets.isLoading && <ActivityIndicator />}
      {wallets.error && <StateMessage title="Wallets unavailable" message={getErrorMessage(wallets.error)} />}
      {wallets.data?.length === 0 && (
        <StateMessage title="No wallets yet" message="Create your first wallet to receive and send money." />
      )}
      {wallets.data?.map((wallet) => (
        <WalletCard key={wallet.id} wallet={wallet} />
      ))}
    </Screen>
  );
}
