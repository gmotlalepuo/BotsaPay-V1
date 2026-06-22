import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ComponentProps } from 'react';

export type AppIconName =
  | SymbolViewProps['name']
  | { ios: string; android?: string; web?: string };

type AppIconProps = Omit<ComponentProps<typeof SymbolView>, 'name'> & {
  name: AppIconName;
};

export function AppIcon({ name, size = 24, ...props }: AppIconProps) {
  const symbolName = (typeof name === 'string' ? name : name.ios) as SymbolViewProps['name'];
  return <SymbolView name={symbolName} size={size} {...props} />;
}
