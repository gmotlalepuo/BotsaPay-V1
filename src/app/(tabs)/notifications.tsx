import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useDeleteNotification, useNotifications, useUpdateNotifications } from '@/api/hooks';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { TextField } from '@/components/ui/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getErrorMessage } from '@/utils/errors';
import { formatDate } from '@/utils/format';

const PAGE_SIZE = 10;
const readOptions = [
  { label: 'All', value: 'all' },
  { label: 'Unread', value: 'unread' },
  { label: 'Read', value: 'read' },
] as const;
const typeOptions = ['all', 'transaction', 'security', 'wallet', 'complaint', 'system'] as const;
const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
] as const;

export default function NotificationsTab() {
  const theme = useTheme();
  const notifications = useNotifications();
  const update = useUpdateNotifications();
  const remove = useDeleteNotification();
  const [search, setSearch] = useState('');
  const [readFilter, setReadFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sort, setSort] = useState<(typeof sortOptions)[number]['value']>('newest');
  const [page, setPage] = useState(1);
  const filteredNotifications = useMemo(() => {
    const term = search.trim().toLowerCase();
    const items = (notifications.data ?? []).filter((item) => {
      const matchesSearch =
        !term ||
        [item.title, item.message, item.type, item.category, item.reference_id]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));

      return (
        matchesSearch &&
        (readFilter === 'all' || (readFilter === 'read' ? item.is_read : !item.is_read)) &&
        (typeFilter === 'all' || item.type === typeFilter)
      );
    });

    return [...items].sort((a, b) => {
      if (sort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [notifications.data, readFilter, search, sort, typeFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedNotifications = filteredNotifications.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function confirmDelete(notificationId: string) {
    Alert.alert('Delete alert?', 'This removes the alert from your feed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove.mutate(notificationId) },
    ]);
  }

  return (
    <Screen title="Alerts" subtitle="Security, wallet, payment, complaint, and system notifications.">
      {notifications.isLoading && <ActivityIndicator />}
      {notifications.error && (
        <StateMessage title="Notifications unavailable" message={getErrorMessage(notifications.error)} />
      )}
      <Card style={styles.controls}>
        <TextField label="Search alerts" value={search} onChangeText={(value) => { setSearch(value); setPage(1); }} />
        <FilterRow
          label="Read status"
          options={readOptions}
          value={readFilter}
          onChange={(value) => { setReadFilter(value); setPage(1); }}
        />
        <FilterRow
          label="Type"
          options={typeOptions.map((value) => ({ label: value === 'all' ? 'All' : value, value }))}
          value={typeFilter}
          onChange={(value) => { setTypeFilter(value); setPage(1); }}
        />
        <FilterRow
          label="Sort"
          options={sortOptions}
          value={sort}
          onChange={(value) => { setSort(value as typeof sort); setPage(1); }}
        />
      </Card>
      {notifications.data?.length === 0 && (
        <StateMessage title="No notifications" message="New wallet and payment alerts will show up here." />
      )}
      {notifications.data && notifications.data.length > 0 && filteredNotifications.length === 0 && (
        <StateMessage title="No matching alerts" message="Try a different search or filter." />
      )}
      {pagedNotifications.map((item) => (
        <Card key={item.id}>
          <View>
            <ThemedText type="smallBold">{item.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {formatDate(item.created_at)}
            </ThemedText>
          </View>
          <ThemedText>{item.message}</ThemedText>
          <View style={{ gap: 8 }}>
            <AppButton
              label={item.is_read ? 'Mark unread' : 'Mark read'}
              variant="secondary"
              loading={update.isPending}
              onPress={() => update.mutate({ notificationIds: [item.id], isRead: !item.is_read })}
            />
            <AppButton
              label="Delete"
              variant="ghost"
              loading={remove.isPending}
              onPress={() => confirmDelete(item.id)}
            />
          </View>
        </Card>
      ))}
      {filteredNotifications.length > 0 && (
        <View style={styles.pagination}>
          <ThemedText type="small" themeColor="textSecondary">
            Showing {(safePage - 1) * PAGE_SIZE + 1}-{Math.min(safePage * PAGE_SIZE, filteredNotifications.length)} of{' '}
            {filteredNotifications.length}
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
