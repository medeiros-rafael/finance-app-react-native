import { LinearGradient } from 'expo-linear-gradient';
import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius as radii, useAppTheme, type AppTheme } from '@/theme';

/** Base style for a translucent "glass" surface. */
export function glassSurface(
  theme: AppTheme,
  radius: number = radii.lg,
  variant: 'fill' | 'fillStrong' | 'sheet' = 'fill',
): ViewStyle {
  return {
    backgroundColor: theme.glass[variant],
    borderColor: theme.glass.border,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: radius,
    boxShadow: theme.glass.shadow,
  };
}

/**
 * Soft ambient tint painted behind a screen so translucent surfaces read as glass.
 * Purely decorative: it ignores touches and is hidden from accessibility.
 */
export function AmbientBackground() {
  const theme = useAppTheme();
  const [top, side] = theme.glass.ambient;
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      importantForAccessibility="no-hide-descendants"
    >
      <LinearGradient
        colors={[top, 'rgba(0,0,0,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.75, y: 0.42 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0)', side, 'rgba(0,0,0,0)']}
        locations={[0.25, 0.5, 0.85]}
        start={{ x: 0.2, y: 0.2 }}
        end={{ x: 1, y: 0.8 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

type GlassProps = {
  children: ReactNode;
  radius?: number;
  variant?: 'fill' | 'fillStrong' | 'sheet';
  style?: StyleProp<ViewStyle>;
};

export function GlassSurface({ children, radius, variant = 'fill', style }: GlassProps) {
  const theme = useAppTheme();
  return <View style={[glassSurface(theme, radius, variant), styles.clip, style]}>{children}</View>;
}

/** Hairline separator used between rows inside a grouped glass list. */
export function GroupDivider({ inset = 68 }: { inset?: number }) {
  const theme = useAppTheme();
  return <View style={[styles.divider, { marginLeft: inset, backgroundColor: theme.glass.separator }]} />;
}

/** iOS-style inset grouped list: one glass container with hairlines between its children. */
export function GlassGroup({
  children,
  style,
  dividerInset,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  dividerInset?: number;
}) {
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <GlassSurface style={style}>
      {items.map((child, index) => (
        <Fragment key={child.key ?? index}>
          {index > 0 ? <GroupDivider inset={dividerInset} /> : null}
          {child}
        </Fragment>
      ))}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth * 2, marginRight: 0 },
});
