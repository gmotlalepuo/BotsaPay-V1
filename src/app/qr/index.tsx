import { Link } from 'expo-router';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useDeleteQrCode, useQrCodes, useUpdateQrCode, useWallets } from '@/api/hooks';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownSelect } from '@/components/ui/dropdown-select';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { TextField } from '@/components/ui/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Wallet } from '@/types/wallet';
import { getErrorMessage } from '@/utils/errors';
import { formatDate, formatMoney } from '@/utils/format';
import { useMemo, useState } from 'react';

const qrStatusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
] as const;

const qrSortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Amount high', value: 'amount_desc' },
  { label: 'Amount low', value: 'amount_asc' },
  { label: 'Most paid', value: 'paid_desc' },
] as const;

function walletDisplayName(wallet?: Wallet) {
  if (!wallet) return 'Unknown wallet';
  return wallet.name || wallet.wallet_number || 'BotsaPay Wallet';
}

export default function QrListScreen() {
  const theme = useTheme();
  const qrCodes = useQrCodes();
  const wallets = useWallets();
  const update = useUpdateQrCode();
  const remove = useDeleteQrCode();
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState<(typeof qrSortOptions)[number]['value']>('newest');
  const walletById = useMemo(
    () => new Map((wallets.data ?? []).map((wallet) => [wallet.id, wallet])),
    [wallets.data],
  );
  const filteredQrCodes = useMemo(() => {
    const term = search.trim().toLowerCase();
    const items = (qrCodes.data ?? []).filter((qr) => {
      const wallet = walletById.get(qr.wallet_id);
      const matchesWallet = !selectedWalletId || qr.wallet_id === selectedWalletId;
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? qr.is_active : !qr.is_active);
      const matchesSearch =
        !term ||
        [
          qr.description,
          qr.token,
          qr.currency,
          String(qr.amount),
          String(qr.paid_count),
          qr.is_active ? 'active' : 'inactive',
          walletDisplayName(wallet),
          wallet?.wallet_number,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));

      return matchesWallet && matchesStatus && matchesSearch;
    });

    return [...items].sort((a, b) => {
      if (sort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === 'amount_desc') return Number(b.amount) - Number(a.amount);
      if (sort === 'amount_asc') return Number(a.amount) - Number(b.amount);
      if (sort === 'paid_desc') return Number(b.paid_count) - Number(a.paid_count);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [qrCodes.data, search, selectedWalletId, sort, statusFilter, walletById]);

  function confirmDelete(qrId: string, description: string) {
    Alert.alert(
      'Delete QR code?',
      `Delete "${description}"? This cannot be undone. QR codes with completed payments should be deactivated instead.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => remove.mutate(qrId),
        },
      ],
    );
  }

  return (
    <Screen title="QR payments" subtitle="Create, view, activate, and deactivate wallet payment requests.">
      <Link href="/qr/create" asChild>
        <AppButton label="Create QR request" />
      </Link>
      <Link href="/qr/scan" asChild>
        <AppButton label="Scan QR" variant="secondary" />
      </Link>
      {qrCodes.isLoading && <ActivityIndicator />}
      {wallets.isLoading && <ActivityIndicator />}
      {qrCodes.error && <StateMessage title="QR codes unavailable" message={getErrorMessage(qrCodes.error)} />}
      {wallets.error && <StateMessage title="Wallet filter unavailable" message={getErrorMessage(wallets.error)} />}
      {qrCodes.data && qrCodes.data.length > 0 ? (
        <Card style={styles.toolsCard}>
          <TextField label="Search QR codes" value={search} onChangeText={setSearch} />
          <View style={styles.inlineFilters}>
            <DropdownSelect
              label="Status"
              value={statusFilter}
              options={qrStatusOptions}
              onChange={setStatusFilter}
            />
            <DropdownSelect
              label="Sort"
              value={sort}
              options={qrSortOptions}
              onChange={(value) => setSort(value as typeof sort)}
            />
          </View>
          {wallets.data && wallets.data.length > 0 ? (
          <>
          <ThemedText type="smallBold">Filter by wallet</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: selectedWalletId === null }}
              onPress={() => setSelectedWalletId(null)}
              style={[
                styles.filterChip,
                { borderColor: theme.border, backgroundColor: theme.backgroundElement },
                selectedWalletId === null && { borderColor: theme.primary, backgroundColor: theme.primarySoft },
              ]}>
              <ThemedText type="smallBold" style={selectedWalletId === null ? { color: theme.primary } : undefined}>
                All wallets
              </ThemedText>
            </Pressable>
            {wallets.data.map((wallet) => {
              const selected = selectedWalletId === wallet.id;
              return (
                <Pressable
                  key={wallet.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setSelectedWalletId(wallet.id)}
                  style={[
                    styles.filterChip,
                    { borderColor: theme.border, backgroundColor: theme.backgroundElement },
                    selected && { borderColor: theme.primary, backgroundColor: theme.primarySoft },
                  ]}>
                  <ThemedText type="smallBold" style={selected ? { color: theme.primary } : undefined}>
                    {walletDisplayName(wallet)}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {wallet.wallet_number}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
          </>
          ) : null}
          <ThemedText type="small" themeColor="textSecondary">
            Showing {filteredQrCodes.length} of {qrCodes.data.length} QR codes
          </ThemedText>
        </Card>
      ) : null}
      {qrCodes.data?.length === 0 && (
        <StateMessage title="No QR codes yet" message="Create a QR payment request for one of your wallets." />
      )}
      {qrCodes.data && qrCodes.data.length > 0 && filteredQrCodes.length === 0 && (
        <StateMessage title="No matching QR codes" message="Try another search, wallet, status, or sort option." />
      )}
      {filteredQrCodes.map((qr) => {
        const wallet = walletById.get(qr.wallet_id);
        return (
        <Card key={qr.id}>
          <View style={{ gap: 4 }}>
            <ThemedText type="smallBold">{qr.description}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Wallet: {walletDisplayName(wallet)}
              {wallet?.wallet_number ? ` - ${wallet.wallet_number}` : ''}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {formatMoney(qr.amount, qr.currency)} - {qr.is_active ? 'Active' : 'Inactive'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Expires {formatDate(qr.expiry_at)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Paid {qr.paid_count} {qr.paid_count === 1 ? 'time' : 'times'}
            </ThemedText>
          </View>
          {qr.qr_image_url ? (
            <Image source={{ uri: qr.qr_image_url }} style={{ width: 160, height: 160, alignSelf: 'center' }} />
          ) : null}
          <AppButton
            label={qr.is_active ? 'Deactivate' : 'Activate'}
            variant="secondary"
            loading={update.isPending}
            onPress={() => update.mutate({ qrCodeId: qr.id, isActive: !qr.is_active })}
          />
          <AppButton
            label="Delete QR code"
            variant="danger"
            loading={remove.isPending}
            onPress={() => confirmDelete(qr.id, qr.description)}
          />
        </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  toolsCard: {
    gap: Spacing.three,
  },
  inlineFilters: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  filterList: {
    gap: Spacing.one,
    paddingRight: Spacing.two,
  },
  filterChip: {
    minWidth: 128,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    gap: 2,
  },
});
