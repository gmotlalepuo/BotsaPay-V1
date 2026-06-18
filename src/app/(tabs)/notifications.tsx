import { ActivityIndicator, View } from 'react-native';

import { useDeleteNotification, useNotifications, useUpdateNotifications } from '@/api/hooks';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { getErrorMessage } from '@/utils/errors';
import { formatDate } from '@/utils/format';

export default function NotificationsTab() {
  const notifications = useNotifications();
  const update = useUpdateNotifications();
  const remove = useDeleteNotification();

  return (
    <Screen title="Alerts" subtitle="Security, wallet, payment, complaint, and system notifications.">
      {notifications.isLoading && <ActivityIndicator />}
      {notifications.error && (
        <StateMessage title="Notifications unavailable" message={getErrorMessage(notifications.error)} />
      )}
      {notifications.data?.length === 0 && (
        <StateMessage title="No notifications" message="New wallet and payment alerts will show up here." />
      )}
      {notifications.data?.map((item) => (
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
              onPress={() => remove.mutate(item.id)}
            />
          </View>
        </Card>
      ))}
    </Screen>
  );
}
