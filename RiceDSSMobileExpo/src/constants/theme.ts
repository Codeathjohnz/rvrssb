/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// Shared "agri-tech" brand palette: saturated crop greens and a tech
// cyan/blue for data, offset with earth-toned harvest accents (soil,
// grain, sky) and a deep slate for dashboard chrome.
export const Palette = {
  // Farmer / primary — vivid crop green, not a flat Material green
  primary: '#16A34A',
  primaryDark: '#0B4D2C',
  primarySoft: '#DCFCE7',

  // Admin / data — tech cyan-blue
  admin: '#0EA5E9',
  adminDark: '#0C4A6E',
  adminSoft: '#E0F2FE',

  // Agricultural accents
  soil: '#8B5E34',
  soilSoft: '#F1E7DA',
  grain: '#D4A017',
  grainSoft: '#FDF3D3',
  sky: '#38BDF8',
  skySoft: '#E0F7FF',

  // Dashboard chrome — deep DA green with gold accents (the actual
  // Department of Agriculture brand colors, not a generic dark navy).
  slate: '#0E3B23',
  slateElevated: '#154A2C',
  slateBorder: '#1F5C38',
  slateText: '#CBD5E1',
  slateTextDim: '#9FCBAE',
  slateActiveTint: 'rgba(212,160,23,0.20)',
  slateActiveBar: '#D4A017',

  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  border: '#DDE3DA',

  // Card surfaces — pure white on a light canvas, always distinct
  // regardless of theme, so containers never blend into the page.
  canvas: '#F3F5F4',
  surface: '#FFFFFF',
} as const;

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
