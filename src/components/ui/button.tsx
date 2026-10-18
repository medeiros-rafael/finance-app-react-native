import type { StyleProp, ViewStyle } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';

import { radius, useAppTheme } from '@/theme';

export type ButtonVariant = 'primary' | 'tonal' | 'outlined' | 'text';

const modes = {
  primary: 'contained',
  tonal: 'contained-tonal',
  outlined: 'outlined',
  text: 'text',
} as const;

type Props = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  style,
}: Props) {
  const theme = useAppTheme();
  const surface: ViewStyle =
    variant === 'primary' && !(disabled || loading)
      ? {
          boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.25), 0 10px 22px 0 ${theme.dark ? 'rgba(120,90,255,0.30)' : 'rgba(91,52,200,0.28)'}`,
        }
      : variant === 'outlined'
        ? { backgroundColor: theme.glass.fill, borderColor: theme.glass.border }
        : {};
  return (
    <PaperButton
      mode={modes[variant]}
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      icon={icon}
      style={[{ borderRadius: radius.full }, surface, fullWidth && styles.fullWidth, style]}
      contentStyle={variant === 'text' ? undefined : styles.content}
      labelStyle={[theme.fonts.labelLarge, variant === 'text' ? undefined : styles.label]}
      aria-busy={loading}
    >
      {title}
    </PaperButton>
  );
}

const styles = {
  fullWidth: { alignSelf: 'stretch' },
  content: { minHeight: 56 },
  label: { fontSize: 17, fontWeight: '800' },
} as const;
