/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Stanford Cardinal Red
const tintColorLight = '#8C1515';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    border: '#ddd',
    buttonBackground: '#8C1515',
    buttonText: '#fff',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    border: '#444',
    buttonBackground: '#8C1515',
    buttonText: '#fff',
  },
};

// Stanford color palette
export const StanfordColors = {
  cardinal: '#8C1515',
  cardinalLight: '#B83A4B',
  cardinalDark: '#6B0F0F',
  white: '#FFFFFF',
  black: '#2E2D29',
  coolGrey: '#4D4F53',
  beige: '#F5E6D3',
};

/**
 * Layout spacing constants
 */
export const Spacing = {
  /** Horizontal padding for screen content */
  screenHorizontal: 24,
  /** Top padding to account for status bar (use SafeAreaView when possible) */
  screenTop: 60,
  /** Standard vertical gap between sections */
  sectionGap: 24,
  /** Small gap between related elements */
  elementGap: 12,
  /** Extra small gap */
  xs: 4,
  /** Small gap */
  sm: 8,
  /** Medium gap */
  md: 16,
  /** Large gap */
  lg: 24,
  /** Extra large gap */
  xl: 32,
};

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
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
