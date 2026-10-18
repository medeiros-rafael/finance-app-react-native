import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
  type Theme as NavTheme,
} from 'expo-router';
import { MD3DarkTheme, MD3LightTheme, configureFonts, useTheme, type MD3Theme } from 'react-native-paper';
import type { MD3Type } from 'react-native-paper/lib/typescript/types';

import { palette } from './palette';

export { palette, swatches } from './palette';

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  screen: 20,
} as const;

export const radius = {
  xs: 8,
  sm: 12,
  md: 20,
  lg: 24,
  xl: 30,
  xxl: 36,
  full: 999,
} as const;

type FontConfig = Partial<Record<keyof typeof MD3LightTheme.fonts, Partial<MD3Type>>>;
const fontConfig: FontConfig = {
  displayLarge: { fontSize: 52, lineHeight: 60, fontWeight: '800', letterSpacing: -1.4 },
  displayMedium: { fontSize: 44, lineHeight: 52, fontWeight: '800', letterSpacing: -1.2 },
  displaySmall: { fontSize: 36, lineHeight: 44, fontWeight: '800', letterSpacing: -0.9 },
  headlineLarge: { fontSize: 32, lineHeight: 40, fontWeight: '800', letterSpacing: -0.7 },
  headlineMedium: { fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.6 },
  headlineSmall: { fontSize: 24, lineHeight: 30, fontWeight: '800', letterSpacing: -0.4 },
  titleLarge: { fontSize: 20, lineHeight: 26, fontWeight: '700', letterSpacing: -0.2 },
  titleMedium: { fontSize: 17, lineHeight: 22, fontWeight: '700', letterSpacing: -0.1 },
  titleSmall: { fontSize: 15, lineHeight: 20, fontWeight: '700', letterSpacing: 0 },
  bodyLarge: { fontSize: 16, lineHeight: 22, fontWeight: '500', letterSpacing: 0 },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '400', letterSpacing: 0 },
  bodySmall: { fontSize: 13, lineHeight: 18, fontWeight: '400', letterSpacing: 0 },
  labelLarge: { fontSize: 15, lineHeight: 20, fontWeight: '700', letterSpacing: 0 },
  labelMedium: { fontSize: 12, lineHeight: 16, fontWeight: '600', letterSpacing: 0.1 },
  labelSmall: { fontSize: 11, lineHeight: 14, fontWeight: '600', letterSpacing: 0.2 },
};
const fonts = configureFonts({ config: fontConfig as Record<string, MD3Type> });

type AppColors = MD3Theme['colors'] & {
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  income: string;
  incomeContainer: string;
  expense: string;
  expenseContainer: string;
  warning: string;
  onHero: string;
};

/**
 * Tokens for the light "glass" look: translucent surfaces over a softly tinted
 * ambient background, a hairline edge and an inner highlight (iOS 26 style, kept subtle).
 */
export type GlassTokens = {
  /** Default translucent surface (cards, grouped lists, fields). */
  fill: string;
  /** Denser surface for floating chrome (tab bar, pills over content). */
  fillStrong: string;
  /** Near-opaque surface for sheets and menus shown over content. */
  sheet: string;
  /** Selected segment / pressed state over glass. */
  selected: string;
  border: string;
  separator: string;
  /** Box shadow (outer soft shadow + inner top highlight). */
  shadow: string;
  /** Two ambient tints painted behind screens. */
  ambient: readonly [string, string];
};

export type AppTheme = Omit<MD3Theme, 'colors'> & {
  colors: AppColors;
  heroGradient: readonly [string, string, ...string[]];
  glass: GlassTokens;
};

export const lightTheme: AppTheme = {
  ...MD3LightTheme,
  fonts,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.violet40,
    onPrimary: '#FFFFFF',
    primaryContainer: palette.violet90,
    onPrimaryContainer: palette.violet10,
    secondary: palette.amethyst40,
    onSecondary: '#FFFFFF',
    secondaryContainer: palette.violet90,
    onSecondaryContainer: palette.violet10,
    tertiary: palette.orchid40,
    onTertiary: '#FFFFFF',
    tertiaryContainer: palette.orchid90,
    onTertiaryContainer: palette.orchid10,
    background: palette.mist,
    onBackground: palette.inkOnMist,
    surface: palette.mist,
    onSurface: palette.inkOnMist,
    surfaceVariant: palette.mistVariant,
    onSurfaceVariant: palette.inkVariant,
    outline: palette.outlineLight,
    outlineVariant: palette.outlineVariantLight,
    error: palette.errorLight,
    onError: '#FFFFFF',
    errorContainer: palette.errorContainerLight,
    onErrorContainer: '#410002',
    inverseSurface: '#303034',
    inverseOnSurface: '#F3F2F6',
    inversePrimary: palette.purple80,
    elevation: {
      level0: 'transparent',
      level1: palette.mistLow,
      level2: palette.mistContainer,
      level3: palette.mistLowest,
      level4: palette.mistHigh,
      level5: palette.mistHighest,
    },
    surfaceContainerLowest: palette.mistLowest,
    surfaceContainerLow: palette.mistLow,
    surfaceContainer: palette.mistContainer,
    surfaceContainerHigh: palette.mistHigh,
    surfaceContainerHighest: palette.mistHighest,
    income: palette.incomeLight,
    incomeContainer: palette.incomeContainerLight,
    expense: palette.expenseLight,
    expenseContainer: palette.expenseContainerLight,
    warning: palette.warningLight,
    onHero: '#FFFFFF',
  },
  heroGradient: ['#6843DB', '#5530C4', '#4726B4'],
  glass: {
    fill: 'rgba(255,255,255,0.68)',
    fillStrong: 'rgba(255,255,255,0.88)',
    sheet: 'rgba(250,249,253,0.98)',
    selected: '#FFFFFF',
    border: 'rgba(40,28,90,0.07)',
    separator: 'rgba(21,19,28,0.08)',
    shadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), 0 10px 28px 0 rgba(46,28,110,0.08)',
    ambient: ['rgba(132,96,255,0.20)', 'rgba(96,170,255,0.14)'],
  },
};

export const darkTheme: AppTheme = {
  ...MD3DarkTheme,
  fonts,
  colors: {
    ...MD3DarkTheme.colors,
    primary: palette.purple80,
    onPrimary: palette.purple20,
    primaryContainer: '#3A2A6E',
    onPrimaryContainer: palette.purple90,
    secondary: palette.mauve80,
    onSecondary: '#362B3F',
    secondaryContainer: '#2E2550',
    onSecondaryContainer: '#EBDDFF',
    tertiary: palette.pink80,
    onTertiary: '#4B1D30',
    tertiaryContainer: palette.pink30,
    onTertiaryContainer: '#FFD9E4',
    background: palette.graphite,
    onBackground: palette.inkOnGraphite,
    surface: palette.graphite,
    onSurface: palette.inkOnGraphite,
    surfaceVariant: palette.graphiteVariant,
    onSurfaceVariant: palette.inkVariantDark,
    outline: palette.outlineDark,
    outlineVariant: palette.outlineVariantDark,
    error: palette.errorDark,
    onError: '#690005',
    errorContainer: palette.errorContainerDark,
    onErrorContainer: '#FFDAD6',
    inverseSurface: palette.inkOnGraphite,
    inverseOnSurface: '#322F35',
    inversePrimary: palette.violet40,
    elevation: {
      level0: 'transparent',
      level1: palette.graphiteLow,
      level2: palette.graphiteContainer,
      level3: palette.graphiteHigh,
      level4: palette.graphiteHigh,
      level5: palette.graphiteHighest,
    },
    surfaceContainerLowest: palette.graphiteLowest,
    surfaceContainerLow: palette.graphiteLow,
    surfaceContainer: palette.graphiteContainer,
    surfaceContainerHigh: palette.graphiteHigh,
    surfaceContainerHighest: palette.graphiteHighest,
    income: palette.incomeDark,
    incomeContainer: palette.incomeContainerDark,
    expense: palette.expenseDark,
    expenseContainer: palette.expenseContainerDark,
    warning: palette.warningDark,
    onHero: '#F6EEFF',
  },
  heroGradient: ['#4A2CB0', '#3A2196', '#2B1878'],
  glass: {
    fill: 'rgba(255,255,255,0.065)',
    fillStrong: 'rgba(32,29,44,0.92)',
    sheet: 'rgba(24,22,33,0.98)',
    selected: 'rgba(255,255,255,0.15)',
    border: 'rgba(255,255,255,0.10)',
    separator: 'rgba(255,255,255,0.08)',
    shadow: 'inset 0 1px 0 0 rgba(255,255,255,0.06), 0 14px 34px 0 rgba(0,0,0,0.45)',
    ambient: ['rgba(120,84,255,0.24)', 'rgba(60,110,255,0.12)'],
  },
};

export const useAppTheme = () => useTheme<AppTheme>();

export function navigationTheme(theme: AppTheme): NavTheme {
  const base = theme.dark ? NavDarkTheme : NavLightTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.onSurface,
      border: theme.colors.outlineVariant,
      notification: theme.colors.error,
    },
  };
}

export function withAlpha(hex: string, alpha: number): string {
  const value = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex.slice(0, 7)}${value}`;
}
