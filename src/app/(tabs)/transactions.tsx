import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useTransactions } from '@/api/hooks';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { TextField } from '@/components/ui/text-field';
import { TransactionRow } from '@/components/wallet/transaction-row';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getErrorMessage } from '@/utils/errors';

const PAGE_SIZE = 10;
const typeOptions = ['all', 'transfer', 'topup', 'payment', 'refund', 'adjustment'] as const;
const statusOptions = ['all', 'completed', 'pending', 'processing', 'failed', 'cancelled', 'reversed'] as const;
const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Amount high', value: 'amount_desc' },
  { label: 'Amount low', value: 'amount_asc' },
] as const;

export default function TransactionsTab() {
  const theme = useTheme();
  const transactions = useTransactions();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState<(typeof sortOptions)[number]['value']>('newest');
  const [page, setPage] = useState(1);
  const filteredTransactions = useMemo(() => {
    const term = search.trim().toLowerCase();
    const items = (transactions.data ?? []).filter((transaction) => {
      const matchesSearch =
        !term ||
        [
          transaction.description,
          transaction.reference_id,
          transaction.type,
          transaction.status,
          transaction.currency,
          String(transaction.amount),
          transaction.sender_display_name,
          transaction.receiver_display_name,
          transaction.sender_wallet_number,
          transaction.receiver_wallet_number,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));

      return (
        matchesSearch &&
        (typeFilter === 'all' || transaction.type === typeFilter) &&
        (statusFilter === 'all' || transaction.status === statusFilter)
      );
    });

    return [...items].sort((a, b) => {
      if (sort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === 'amount_desc') return Number(b.amount) - Number(a.amount);
      if (sort === 'amount_asc') return Number(a.amount) - Number(b.amount);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [search, sort, statusFilter, transactions.data, typeFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedTransactions = filteredTransactions.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <Screen title="Activity" subtitle="Transfers, top-ups, QR payments, refunds, and adjustments.">
      {transactions.isLoading && <ActivityIndicator />}
      {transactions.error && (
        <StateMessage title="Transactions unavailable" message={getErrorMessage(transactions.error)} />
      )}
      <Card style={styles.controls}>
        <TextField label="Search activity" value={search} onChangeText={(value) => { setSearch(value); setPage(1); }} />
        <FilterRow
          label="Type"
          options={typeOptions.map((value) => ({ label: value === 'all' ? 'All' : value, value }))}
          value={typeFilter}
          onChange={(value) => { setTypeFilter(value); setPage(1); }}
        />
        <FilterRow
          label="Status"
          options={statusOptions.map((value) => ({ label: value === 'all' ? 'All' : value, value }))}
          value={statusFilter}
          onChange={(value) => { setStatusFilter(value); setPage(1); }}
        />
        <FilterRow
          label="Sort"
          options={sortOptions}
          value={sort}
          onChange={(value) => { setSort(value as typeof sort); setPage(1); }}
        />
      </Card>
      {transactions.data?.length === 0 && (
        <StateMessage title="No activity yet" message="Transactions will appear here after wallet activity." />
      )}
      {transactions.data && transactions.data.length > 0 && filteredTransactions.length === 0 && (
        <StateMessage title="No matching activity" message="Try a different search or filter." />
      )}
      {pagedTransactions.map((transaction) => (
        <TransactionRow key={transaction.id} transaction={transaction} />
      ))}
      {filteredTransactions.length > 0 && (
        <View style={styles.pagination}>
          <ThemedText type="small" themeColor="textSecondary">
            Showing {(safePage - 1) * PAGE_SIZE + 1}-{Math.min(safePage * PAGE_SIZE, filteredTransactions.length)} of{' '}
            {filteredTransactions.length}
          </ThemedText>
          <View style={styles.pageActions}>
            <Pressable
              accessibilityRole="button"
              disabled={safePage <= 1}
              onPress={() => setPage((current) => Math.max(1, current - 1))}
              style={[styles.pageButton, { borderColor: theme.border }, safePage <= 1 && styles.disabled]}>
              <ThemedText type="smallBold">Previous</ThemedText>
            </Pressable>
            <ThemedText type="small" themeColor="textSecondary">
              Page {safePage} of {totalPages}
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              disabled={safePage >= totalPages}
              onPress={() => setPage((current) => Math.min(totalPages, current + 1))}
              style={[styles.pageButton, { borderColor: theme.border }, safePage >= totalPages && styles.disabled]}>
              <ThemedText type="smallBold">Next</ThemedText>
            </Pressable>
          </View>
        </View>
      )}
    </Screen>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.filterGroup}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              style={[
                styles.chip,
                { borderColor: theme.border, backgroundColor: theme.backgroundElement },
                selected && { borderColor: theme.primary, backgroundColor: theme.primarySoft },
              ]}>
              <ThemedText type="smallBold" style={selected ? { color: theme.primary } : undefined}>
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    gap: Spacing.three,
  },
  filterGroup: {
    gap: Spacing.one,
  },
  filterList: {
    gap: Spacing.one,
    paddingRight: Spacing.two,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  pagination: {
    gap: Spacing.two,
    alignItems: 'center',
  },
  pageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pageButton: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  disabled: {
    opacity: 0.45,
  },
});
