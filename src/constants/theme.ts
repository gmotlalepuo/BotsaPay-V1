/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#13201A',
    background: '#F8FAF7',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E7F4EC',
    textSecondary: '#63706A',
    border: '#DCE6DF',
    primary: '#146C43',
    primaryText: '#FFFFFF',
    accent: '#E6A817',
    danger: '#B42318',
    success: '#16834D',
  },
  dark: {
    text: '#F6FAF7',
    background: '#101511',
    backgroundElement: '#18211B',
    backgroundSelected: '#20372A',
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
  small: 6,
  medium: 8,
  large: 12,
} as const;
