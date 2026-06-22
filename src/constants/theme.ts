/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#17231D',
    background: '#F6F8F4',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E8F3EC',
    surfaceMuted: '#EFF3EF',
    primarySoft: '#DDF1E5',
    accentSoft: '#FFF3D3',
    textSecondary: '#65736C',
    border: '#DEE6E0',
    primary: '#0D7045',
    primaryText: '#FFFFFF',
    accent: '#D99A13',
    danger: '#B42318',
    success: '#16834D',
  },
  dark: {
    text: '#F6FAF7',
    background: '#101511',
    backgroundElement: '#18211B',
    backgroundSelected: '#20372A',
    surfaceMuted: '#202A23',
    primarySoft: '#173C29',
    accentSoft: '#3B321B',
    textSecondary: '#AAB7AF',
    border: '#2C3A32',
    primary: '#4CC783',
    primaryText: '#08120C',
    accent: '#F0C14B',
    danger: '#FF8A80',
    success: '#68D391',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export const Radius = {
  small: 8,
  medium: 12,
  large: 18,
  pill: 999,
} as const;
