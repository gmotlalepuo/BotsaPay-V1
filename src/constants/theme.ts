/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#101828',
    background: '#F6F9FF',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E7F1FF',
    surfaceMuted: '#F1F6FF',
    primarySoft: '#DCEBFF',
    accentSoft: '#FFF1DE',
    textSecondary: '#667085',
    border: '#D6E2F5',
    primary: '#0A58D0',
    primaryText: '#FFFFFF',
    accent: '#FF7A00',
    danger: '#B42318',
    success: '#07845D',
  },
  dark: {
    text: '#F8FBFF',
    background: '#07162F',
    backgroundElement: '#0D2142',
    backgroundSelected: '#153766',
    surfaceMuted: '#102A52',
    primarySoft: '#123E79',
    accentSoft: '#3B2615',
    textSecondary: '#B8C7DD',
    border: '#23466F',
    primary: '#56A6FF',
    primaryText: '#061122',
    accent: '#FF9E2C',
    danger: '#FF8A80',
    success: '#62D6A5',
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
  large: 16,
  pill: 999,
} as const;
