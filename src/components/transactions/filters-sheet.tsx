import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import type { Account, Category } from '@/api/schemas';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { TextField } from '@/components/ui/text-field';
import { parseAmountInput, type Cents } from '@/lib/money';
import { spacing } from '@/theme';

export type AdvancedFilters = {
  accountId: string | null;
  categoryId: string | null;
  minAmount: Cents | null;
  maxAmount: Cents | null;
};

export const EMPTY_FILTERS: AdvancedFilters = {
  accountId: null,
  categoryId: null,
  minAmount: null,
  maxAmount: null,
};

export function activeFilterCount(filters: AdvancedFilters): number {
  return Object.values(filters).filter((value) => value !== null).length;
}

const toInput = (cents: Cents | null) => (cents === null ? '' : String(cents / 100).replace('.', ','));
const onlyAmountChars = (text: string) => text.replace(/[^\d.,]/g, '');

type Props = {
  visible: boolean;
  current: AdvancedFilters;
  accounts: Account[];
  categories: Category[];
  onApply: (filters: AdvancedFilters) => void;
  onDismiss: () => void;
};

export function FiltersSheet({ visible, onDismiss, ...props }: Props) {
  return (
    <Sheet visible={visible} onDismiss={onDismiss} scrollable>
      <FiltersContent key={visible ? 'open' : 'closed'} onDismiss={onDismiss} {...props} />
    </Sheet>
  );
}

function FiltersContent({ current, accounts, categories, onApply, onDismiss }: Omit<Props, 'visible'>) {
  const { t } = useTranslation();
  const [accountId, setAccountId] = useState(current.accountId);
  const [categoryId, setCategoryId] = useState(current.categoryId);
  const [min, setMin] = useState(toInput(current.minAmount));
  const [max, setMax] = useState(toInput(current.maxAmount));

  const apply = (filters: AdvancedFilters) => {
    onApply(filters);
    onDismiss();
  };

  return (
    <View style={styles.content}>
      <Text variant="titleLarge">{t('transactions.filters')}</Text>

      <SectionTitle text={t('transactions.account')} />
      <View style={styles.chips}>
        {accounts.map((account) => (
          <Chip
            key={account.id}
            selected={accountId === account.id}
            showSelectedOverlay
            onPress={() => setAccountId(accountId === account.id ? null : account.id)}
          >
            {account.name}
          </Chip>
        ))}
      </View>

      <SectionTitle text={t('transactions.category')} />
      <View style={styles.chips}>
        {categories.map((category) => (
          <Chip
            key={category.id}
            selected={categoryId === category.id}
            showSelectedOverlay
            onPress={() => setCategoryId(categoryId === category.id ? null : category.id)}
          >
            {category.name}
          </Chip>
        ))}
      </View>

      <SectionTitle text={t('transactions.amountRange')} />
      <View style={styles.row}>
        <TextField
          label={t('transactions.minAmount')}
          value={min}
          onChangeText={(text) => setMin(onlyAmountChars(text))}
          keyboardType="decimal-pad"
          containerStyle={styles.flex}
        />
        <TextField
          label={t('transactions.maxAmount')}
          value={max}
          onChangeText={(text) => setMax(onlyAmountChars(text))}
          keyboardType="decimal-pad"
          containerStyle={styles.flex}
        />
      </View>

      <View style={[styles.row, { marginTop: spacing.xl }]}>
        <View style={styles.flex}>
          <Button
            title={t('transactions.clearFilters')}
            variant="outlined"
            onPress={() => apply(EMPTY_FILTERS)}
          />
        </View>
        <View style={styles.flex}>
          <Button
            title={t('transactions.applyFilters')}
            onPress={() =>
              apply({
                accountId,
                categoryId,
                minAmount: parseAmountInput(min),
                maxAmount: parseAmountInput(max),
              })
            }
          />
        </View>
      </View>
    </View>
  );
}

function SectionTitle({ text }: { text: string }) {
  return (
    <Text variant="titleSmall" style={styles.sectionTitle}>
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.screen },
  sectionTitle: { marginTop: spacing.lg, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
});
