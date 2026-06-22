import { Link } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { useProfile, useWallets } from '@/api/hooks';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { WalletCard } from '@/components/wallet/wallet-card';
import { Spacing } from '@/constants/theme';
import { getMissingConfig } from '@/utils/env';
import { getErrorMessage } from '@/utils/errors';
import { getDisplayName } from '@/utils/format';
import { useTheme } from '@/hooks/use-theme';

type QuickActionProps = {
  href: '/wallet/create' | '/qr/create' | '/topup' | '/complaints';
  icon: AppIconName;
  label: string;
  description: string;
};

function QuickAction({ href, icon, label, description }: QuickActionProps) {
  const theme = useTheme();

  return (
    <Link href={href} asChild>
      <Pressable
        style={StyleSheet.flatten([
          styles.quickAction,
          { backgroundColor: theme.surfaceMuted, borderColor: theme.border },
        ])}>
        <View style={[styles.quickIcon, { backgroundColor: theme.primarySoft }]}>
          <AppIcon name={icon} size={23} tintColor={theme.primary} />
        </View>
        <View style={styles.quickCopy}>
          <ThemedText type="smallBold">{label}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.quickDescription}>
            {description}
          </ThemedText>
        </View>
        <AppIcon name={{ ios: 'chevron.right', android: 'chevron_right' }} size={18} tintColor={theme.textSecondary} />
      </Pressable>
    </Link>
  );
}

export default function HomeTab() {
  const theme = useTheme();
  const profile = useProfile();
  const wallets = useWallets();
  const missingConfig = getMissingConfig();
  const primaryWallet = wallets.data?.[0];

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <ThemedText type="smallBold" style={{ color: theme.primary }}>WELCOME BACK</ThemedText>
          <ThemedText type="subtitle" style={styles.greeting}>
            Hello, {getDisplayName(profile.data?.first_name, profile.data?.last_name, profile.data?.email)}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.heroSubtitle}>
            Here is your money at a glance.
          </ThemedText>
        </View>
        <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
          <AppIcon name={{ ios: 'person.fill', android: 'person' }} size={26} tintColor={theme.primary} />
        </View>
      </View>
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
          <AppButton
            label="Send money"
            icon={{ ios: 'paperplane.fill', android: 'send' }}
            style={styles.primaryAction}
          />
        </Link>
        <Link href="/qr/scan" asChild>
          <AppButton
            label="Scan QR"
            icon={{ ios: 'qrcode.viewfinder', android: 'qr_code_scanner' }}
            variant="secondary"
            style={styles.primaryAction}
          />
        </Link>
      </View>

      <Card style={styles.quickCard}>
        <View style={styles.sectionHeading}>
          <View>
            <ThemedText type="smallBold" style={styles.sectionTitle}>Quick actions</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">Your most-used BotsaPay tools</ThemedText>
          </View>
        </View>
        <View style={styles.grid}>
          <QuickAction
            href="/wallet/create"
            icon={{ ios: 'wallet.bifold.fill', android: 'add_card' }}
            label="Create wallet"
            description="Add another account"
          />
          <QuickAction
            href="/qr/create"
            icon={{ ios: 'qrcode', android: 'qr_code_2' }}
            label="Create QR"
            description="Request a payment"
          />
          <QuickAction
            href="/topup"
            icon={{ ios: 'plus.circle.fill', android: 'add_circle' }}
            label="Top up"
            description="Add money securely"
          />
          <QuickAction
            href="/complaints"
            icon={{ ios: 'headphones', android: 'support_agent' }}
            label="Support"
            description="We are here to help"
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingTop: Spacing.three,
  },
  heroCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  greeting: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.7,
  },
  heroSubtitle: {
    lineHeight: 21,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  primaryAction: {
    flex: 1,
  },
  quickCard: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  grid: {
    gap: Spacing.two,
  },
  quickAction: {
    width: '100%',
    minHeight: 70,
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCopy: {
    flex: 1,
  },
  quickDescription: {
    fontSize: 12,
    lineHeight: 17,
  },
});
