import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AppButtonProps = PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  icon?: AppIconName;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  label,
  variant = 'primary',
  loading,
  icon,
  disabled,
  style,
  ...props
}: AppButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === 'primary'
      ? theme.primary
      : variant === 'danger'
        ? theme.danger
        : variant === 'secondary'
          ? theme.backgroundSelected
          : 'transparent';
  const color = variant === 'primary' || variant === 'danger' ? theme.primaryText : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, borderColor: theme.border, opacity: isDisabled ? 0.55 : pressed ? 0.82 : 1 },
        variant === 'ghost' && styles.ghost,
        style,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <>
          {icon && <AppIcon name={icon} size={19} tintColor={color} />}
          <ThemedText type="smallBold" style={{ color }}>
            {label}
          </ThemedText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    borderWidth: 1,
  },
  ghost: {
    borderWidth: 0,
  },
});
