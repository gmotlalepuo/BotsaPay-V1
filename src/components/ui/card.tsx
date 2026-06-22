import { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CardProps = ViewProps & {
  children: ReactNode;
};

export function Card({ children, style, ...props }: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.large,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
    shadowColor: '#163324',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
});
