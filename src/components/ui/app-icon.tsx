import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';

export type AppIconName = ComponentProps<typeof SymbolView>['name'];

type AppIconProps = Omit<ComponentProps<typeof SymbolView>, 'name'> & {
  name: AppIconName;
};

export function AppIcon({ name, size = 24, ...props }: AppIconProps) {
  return <SymbolView name={name} size={size} {...props} />;
}
