import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type AppIconName =
  | SymbolViewProps['name']
  | { ios: string; android?: string; web?: string };

type AppIconProps = Omit<ComponentProps<typeof SymbolView>, 'name'> & {
  name: AppIconName;
};

export function AppIcon({ name, size = 24, ...props }: AppIconProps) {
  if (typeof name !== 'string' && Platform.OS !== 'ios' && name.android) {
    const materialIconName = name.android.replace(/_/g, '-') as ComponentProps<typeof MaterialIcons>['name'];

    return (
      <MaterialIcons
        name={materialIconName}
        size={size}
        color={props.tintColor}
      />
    );
  }

  const symbolName = (typeof name === 'string' ? name : name.ios) as SymbolViewProps['name'];
  return <SymbolView name={symbolName} size={size} {...props} />;
}
