import { Redirect, Tabs } from 'expo-router';

import { useNotifications } from '@/api/hooks';
import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';

const tabIcons: Record<string, AppIconName> = {
  home: { ios: 'house.fill', android: 'home' },
  wallets: { ios: 'wallet.bifold.fill', android: 'account_balance_wallet' },
  transactions: { ios: 'list.bullet.rectangle.fill', android: 'receipt_long' },
  notifications: { ios: 'bell.fill', android: 'notifications' },
  profile: { ios: 'person.crop.circle.fill', android: 'person' },
};

export default function TabsLayout() {
  const session = useAuthStore((state) => state.session);

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return <AuthenticatedTabs />;
}

function AuthenticatedTabs() {
  const theme = useTheme();
  const notifications = useNotifications();
  const unreadCount = notifications.data?.filter((item) => !item.is_read).length ?? 0;
  const unreadBadge = unreadCount > 99 ? '99+' : unreadCount || undefined;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.backgroundElement,
          borderTopColor: 'transparent',
          height: 72,
          paddingTop: 9,
          paddingBottom: 8,
          elevation: 12,
          shadowColor: '#13251C',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, size }) => (
          <AppIcon name={tabIcons.home} size={size} tintColor={color} />
        ),
      }}>
      <Tabs.Screen
        name="home"
        options={{ title: 'Home', tabBarIcon: ({ color, size }) => <AppIcon name={tabIcons.home} size={size} tintColor={color} /> }}
      />
      <Tabs.Screen
        name="wallets"
        options={{ title: 'Wallets', tabBarIcon: ({ color, size }) => <AppIcon name={tabIcons.wallets} size={size} tintColor={color} /> }}
      />
      <Tabs.Screen
        name="transactions"
        options={{ title: 'Activity', tabBarIcon: ({ color, size }) => <AppIcon name={tabIcons.transactions} size={size} tintColor={color} /> }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarBadge: unreadBadge,
          tabBarBadgeStyle: {
            backgroundColor: theme.accent,
            color: theme.primaryText,
            fontSize: 10,
            fontWeight: '800',
          },
          tabBarIcon: ({ color, size }) => <AppIcon name={tabIcons.notifications} size={size} tintColor={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <AppIcon name={tabIcons.profile} size={size} tintColor={color} /> }}
      />
    </Tabs>
  );
}
