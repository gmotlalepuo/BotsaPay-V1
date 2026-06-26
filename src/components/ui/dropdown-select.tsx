import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type DropdownOption = {
  label: string;
  value: string;
};

type DropdownSelectProps = {
  label: string;
  value: string;
  options: readonly DropdownOption[];
  onChange: (value: string) => void;
};

export function DropdownSelect({ label, value, options, onChange }: DropdownSelectProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? 'Select';

  return (
    <>
      <View style={styles.wrapper}>
        <ThemedText type="smallBold">{label}</ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen(true)}
          style={[
            styles.trigger,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}>
          <ThemedText type="smallBold" numberOfLines={1} style={styles.triggerText}>
            {selectedLabel}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.chevron}>
            v
          </ThemedText>
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View
            onStartShouldSetResponder={() => true}
            style={[styles.menu, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            {options.map((option) => {
              const selected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  style={[
                    styles.option,
                    selected && { backgroundColor: theme.primarySoft },
                  ]}>
                  <ThemedText type="smallBold" style={selected ? { color: theme.primary } : undefined}>
                    {option.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    gap: Spacing.one,
    minWidth: 0,
  },
  trigger: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  triggerText: {
    flex: 1,
  },
  chevron: {
    fontSize: 14,
    lineHeight: 18,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(9, 18, 31, 0.42)',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  menu: {
    borderRadius: Radius.large,
    borderWidth: 1,
    overflow: 'hidden',
  },
  option: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
