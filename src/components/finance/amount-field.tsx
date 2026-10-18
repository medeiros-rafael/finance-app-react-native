import { StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';

import { formatMoney, MoneyInput } from '@/lib/money';
import { spacing, useAppTheme } from '@/theme';

type Props = {
  digits: string;
  onDigitsChange: (digits: string) => void;
  label: string;
  color?: string;
  error?: string;
  style?: StyleProp<ViewStyle>;
};

export function AmountField({ digits, onDigitsChange, label, color, error, style }: Props) {
  const theme = useAppTheme();
  const formatted = formatMoney(MoneyInput.toCents(digits));
  return (
    <View style={[styles.container, style]}>
      <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
      <TextInput
        value={formatted}
        onChangeText={(text) => onDigitsChange(MoneyInput.sanitize(text))}
        keyboardType="number-pad"
        caretHidden
        contextMenuHidden
        selection={{ start: formatted.length, end: formatted.length }}
        aria-label={label}
        style={[
          styles.input,
          theme.fonts.displayMedium,
          { color: color ?? theme.colors.onSurface, fontVariant: ['tabular-nums'] },
        ]}
      />
      {error ? (
        <Text variant="bodySmall" style={{ color: theme.colors.error }} role="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', alignSelf: 'stretch' },
  input: { alignSelf: 'stretch', textAlign: 'center', marginTop: spacing.xs, paddingVertical: 0 },
});
