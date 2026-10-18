import type { StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';
import type { VariantProp } from 'react-native-paper/lib/typescript/components/Typography/types';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import type { TransactionType } from '@/api/schemas';
import { formatMoney, formatSignedMoney, HIDDEN_MONEY, type Cents } from '@/lib/money';
import { usePreferences } from '@/stores/preferences';
import { useAppTheme } from '@/theme';

type Props = {
  cents: Cents;
  variant?: VariantProp<never>;
  color?: string;
  signed?: boolean;
  style?: StyleProp<TextStyle>;
};

export function MoneyText({ cents, variant = 'bodyMedium', color, signed = false, style }: Props) {
  const hidden = usePreferences((state) => state.hideValues);
  const { t } = useTranslation();
  const text = hidden ? HIDDEN_MONEY : signed ? formatSignedMoney(cents) : formatMoney(cents);
  return (
    <Animated.View key={hidden ? 'hidden' : 'visible'} entering={FadeIn.duration(180)}>
      <Text
        variant={variant}
        numberOfLines={1}
        style={[{ fontVariant: ['tabular-nums'] }, color ? { color } : null, style]}
        accessibilityLabel={hidden ? t('ui.hiddenValue') : undefined}
      >
        {text}
      </Text>
    </Animated.View>
  );
}

export function TransactionAmountText({
  cents,
  type,
  variant,
}: {
  cents: Cents;
  type: TransactionType;
  variant?: VariantProp<never>;
}) {
  const theme = useAppTheme();
  const isExpense = type === 'EXPENSE';
  return (
    <MoneyText
      cents={isExpense ? -cents : cents}
      signed
      variant={variant}
      color={isExpense ? theme.colors.expense : theme.colors.income}
    />
  );
}
