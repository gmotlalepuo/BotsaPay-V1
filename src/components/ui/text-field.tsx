import { forwardRef } from 'react';
import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, error, style, placeholderTextColor, accessibilityLabel, ...props }, ref) => {
    const theme = useTheme();

    return (
      <View style={styles.wrapper}>
        <ThemedText type="smallBold">{label}</ThemedText>
        <TextInput
          ref={ref}
          accessibilityLabel={accessibilityLabel ?? label}
          placeholderTextColor={placeholderTextColor ?? theme.textSecondary}
          style={[
            styles.input,
            {
              color: theme.text,
              borderColor: error ? theme.danger : theme.border,
              backgroundColor: theme.surfaceMuted,
            },
            style,
          ]}
          {...props}
        />
        {error && (
          <ThemedText type="small" style={{ color: theme.danger }}>
            {error}
          </ThemedText>
        )}
      </View>
    );
  },
);

TextField.displayName = 'TextField';

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.one,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
});
