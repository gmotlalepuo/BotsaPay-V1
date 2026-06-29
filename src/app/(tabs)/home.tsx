import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';

import { useProfile, useWallets } from '@/api/hooks';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { Spacing } from '@/constants/theme';
import { getMissingConfig } from '@/utils/env';
import { getErrorMessage } from '@/utils/errors';
import { formatMoney, getDisplayName } from '@/utils/format';
import { useTheme } from '@/hooks/use-theme';

type QuickActionProps = {
  href: '/qr/create' | '/topup' | '/complaints' | '/(tabs)/transactions';
  icon: AppIconName;
  label: string;
  description: string;
};

const quickTips = [
  'Scan QR codes only from merchants and people you trust.',
  'Review your activity often to catch unusual wallet movement early.',
  'Use top-up before busy payment moments so checkout stays quick.',
  'Keep your profile details current for smoother support checks.',
];

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
          <ThemedText type="smallBold" numberOfLines={1}>{label}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.quickDescription} numberOfLines={2}>
            {description}
          </ThemedText>
        </View>
      </Pressable>
    </Link>
  );
}

export default function HomeTab() {
  const theme = useTheme();
  const profile = useProfile();
  const wallets = useWallets();
  const [tipIndex, setTipIndex] = useState(0);
  const missingConfig = getMissingConfig();
  const walletCount = wallets.data?.length ?? 0;
  const totalCurrency = wallets.data?.[0]?.currency ?? 'BWP';
  const totalBalance =
    wallets.data?.reduce((sum, wallet) => sum + (wallet.currency === totalCurrency ? Number(wallet.balance) : 0), 0) ?? 0;
  const displayName = getDisplayName(profile.data?.first_name, profile.data?.last_name, profile.data?.email);
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((current) => (current + 1) % quickTips.length);
    }, 20000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <ThemedText type="smallBold" style={{ color: theme.primary }}>WELCOME BACK</ThemedText>
          <ThemedText type="subtitle" style={styles.greeting}>
            Hello, {displayName}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.heroSubtitle}>
            Here is your money at a glance.
          </ThemedText>
        </View>
        <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
          {profile.data?.avatar_url ? (
            <Image source={{ uri: profile.data.avatar_url }} style={styles.avatarImage} />
          ) : (
            <ThemedText type="smallBold" style={{ color: theme.primary }}>
              {initials || 'BP'}
            </ThemedText>
          )}
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
      {wallets.data && (
        <Card style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View>
              <ThemedText type="small" themeColor="textSecondary">Total balance</ThemedText>
              <ThemedText type="subtitle" style={styles.totalBalance} numberOfLines={1} adjustsFontSizeToFit>
                {formatMoney(totalBalance, totalCurrency)}
              </ThemedText>
            </View>
            <View style={[styles.walletCountBadge, { backgroundColor: theme.primarySoft }]}>
              <ThemedText type="smallBold" style={{ color: theme.primary }}>
                {walletCount} {walletCount === 1 ? 'wallet' : 'wallets'}
              </ThemedText>
            </View>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            Available across your active BotsaPay wallets
          </ThemedText>
        </Card>
      )}

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

      <Card style={styles.tipCard}>
        <View style={[styles.tipIcon, { backgroundColor: theme.accentSoft }]}>
          <AppIcon name={{ ios: 'lightbulb.fill', android: 'lightbulb' }} size={20} tintColor={theme.accent} />
        </View>
        <View style={styles.tipCopy}>
          <ThemedText type="smallBold">Quick tip</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.tipText}>
            {quickTips[tipIndex]}
          </ThemedText>
        </View>
      </Card>

      <Card style={styles.quickCard}>
        <View style={styles.sectionHeading}>
          <View>
            <ThemedText type="smallBold" style={styles.sectionTitle}>Quick actions</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">Your most-used BotsaPay tools</ThemedText>
          </View>
        </View>
        <View style={styles.grid}>
          <QuickAction
            href="/qr/create"
            icon={{ ios: 'qrcode', android: 'qr_code_2' }}
            label="Create QR"
            description="Request a payment"
          />
          <QuickAction
            href="/(tabs)/transactions"
            icon={{ ios: 'list.bullet.rectangle.fill', android: 'receipt_long' }}
            label="Activity"
            description="Review money movement"
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  primaryAction: {
    flex: 1,
  },
  tipCard: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipCopy: {
    flex: 1,
    gap: Spacing.half,
  },
  tipText: {
    lineHeight: 22,
  },
  balanceCard: {
    gap: Spacing.two,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  totalBalance: {
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: 0,
  },
  walletCountBadge: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  quickCard: {
    padding: Spacing.three,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  quickAction: {
    width: '48.5%',
    minHeight: 126,
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.three,
    justifyContent: 'space-between',
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
    gap: Spacing.half,
  },
  quickDescription: {
    fontSize: 12,
    lineHeight: 17,
  },
});
