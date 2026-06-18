import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';

type StateMessageProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function StateMessage({ title, message, actionLabel, onAction }: StateMessageProps) {
  return (
    <Card>
      <View style={styles.content}>
        <ThemedText type="smallBold">{title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {message}
        </ThemedText>
      </View>
      {actionLabel && onAction && <AppButton label={actionLabel} variant="secondary" onPress={onAction} />}
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.one,
  },
});
