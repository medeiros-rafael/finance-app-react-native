import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { TouchableRipple } from 'react-native-paper';

import { radius, spacing, useAppTheme } from '@/theme';

import { glassSurface } from './glass';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function Card({ children, onPress, style, contentStyle, accessibilityLabel }: Props) {
  const theme = useAppTheme();
  const container: StyleProp<ViewStyle> = [glassSurface(theme, radius.lg), styles.card, style];
  const content = <View style={[styles.content, contentStyle]}>{children}</View>;

  if (!onPress) return <View style={container}>{content}</View>;
  return (
    <TouchableRipple
      onPress={onPress}
      style={container}
      borderless
      role="button"
      accessibilityLabel={accessibilityLabel}
    >
      {content}
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden' },
  content: { padding: spacing.lg + 2 },
});
