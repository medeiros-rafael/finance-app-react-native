import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import type { Transaction } from '@/api/schemas';
import { formatMediumDate } from '@/lib/dates';
import { radius, spacing, useAppTheme, withAlpha } from '@/theme';

import { CategoryBadge } from './icons';
import { TransactionAmountText } from './money-text';

type Props = {
  transaction: Transaction;
  onPress: (id: string) => void;
  showDate?: boolean;
  /** Row sits inside a grouped glass container: use the container's inner padding. */
  grouped?: boolean;
};

export const TransactionItem = memo(function TransactionItem({
  transaction,
  onPress,
  showDate = false,
  grouped = false,
}: Props) {
  const theme = useAppTheme();
  const { t, i18n } = useTranslation();
  const subtitle = [
    transaction.categoryName,
    transaction.accountName,
    showDate ? formatMediumDate(transaction.date, i18n.language) : null,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <TouchableRipple onPress={() => onPress(transaction.id)} role="button">
      <View style={[styles.row, grouped && styles.groupedRow]}>
        <CategoryBadge iconKey={transaction.categoryIcon} color={transaction.categoryColor} />
        <View style={styles.texts}>
          <Text variant="bodyLarge" numberOfLines={1} style={styles.title}>
            {transaction.description}
          </Text>
          <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>
            {subtitle}
          </Text>
        </View>
        <View style={styles.amount}>
          <TransactionAmountText cents={transaction.amount} type={transaction.type} variant="titleSmall" />
          {transaction.status === 'PENDING' ? (
            <Text
              variant="labelSmall"
              style={[
                styles.pending,
                { color: theme.colors.warning, backgroundColor: withAlpha(theme.colors.warning, 0.14) },
              ]}
            >
              {t('ui.pending')}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableRipple>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.md,
  },
  groupedRow: { paddingHorizontal: spacing.lg, minHeight: 64 },
  texts: { flex: 1 },
  amount: { alignItems: 'flex-end' },
  title: { fontWeight: '600' },
  pending: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    overflow: 'hidden',
    fontWeight: '800',
  },
});
