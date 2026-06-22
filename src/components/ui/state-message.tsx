import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { AppIcon } from '@/components/ui/app-icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type StateMessageProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function StateMessage({ title, message, actionLabel, onAction }: StateMessageProps) {
  const theme = useTheme();

  return (
    <Card>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: theme.accentSoft }]}>
          <AppIcon name={{ ios: 'info.circle.fill', android: 'info' }} size={22} tintColor={theme.accent} />
        </View>
        <View style={styles.content}>
        <ThemedText type="smallBold">{title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {message}
        </ThemedText>
        </View>
      </View>
      {actionLabel && onAction && <AppButton label={actionLabel} variant="secondary" onPress={onAction} />}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: Spacing.one,
  },
});
