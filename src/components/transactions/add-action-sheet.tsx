import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import type { TransactionType } from '@/api/schemas';
import { ColoredIconBadge } from '@/components/finance/icons';
import { GlassGroup, glassSurface } from '@/components/ui/glass';
import { radius, spacing, useAppTheme } from '@/theme';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onAddTransaction: (type: Extract<TransactionType, 'INCOME' | 'EXPENSE'>) => void;
  onTransfer: () => void;
};

export function AddActionSheet({ visible, onDismiss, onAddTransaction, onTransfer }: Props) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const choose = (action: () => void) => () => {
    onDismiss();
    action();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.root}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.backdrop }]}
          onPress={onDismiss}
          aria-label={t('settings.close')}
        />
        <View
          style={[
            glassSurface(theme, radius.xxl, 'sheet'),
            styles.sheet,
            { marginBottom: insets.bottom + spacing.sm },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.outlineVariant }]} />
          <Text variant="headlineSmall" style={styles.title}>
            {t('transactions.addTitle')}
          </Text>
          <GlassGroup style={styles.options} dividerInset={80}>
            <AddOption
              icon="arrow-down"
              color={theme.colors.income}
              title={t('transactions.income')}
              subtitle={t('transactions.addIncomeHint')}
              onPress={choose(() => onAddTransaction('INCOME'))}
            />
            <AddOption
              icon="arrow-up"
              color={theme.colors.expense}
              title={t('transactions.expense')}
              subtitle={t('transactions.addExpenseHint')}
              onPress={choose(() => onAddTransaction('EXPENSE'))}
            />
            <AddOption
              icon="swap-horizontal"
              color={theme.colors.primary}
              title={t('transactions.transferTitle')}
              subtitle={t('transactions.addTransferHint')}
              onPress={choose(onTransfer)}
            />
          </GlassGroup>
        </View>
      </View>
    </Modal>
  );
}

type AddOptionProps = { icon: string; color: string; title: string; subtitle: string; onPress: () => void };

function AddOption({ icon, color, title, subtitle, onPress }: AddOptionProps) {
  const theme = useAppTheme();
  return (
    <TouchableRipple onPress={onPress} role="button" aria-label={title}>
      <View style={styles.option}>
        <ColoredIconBadge icon={icon} color={color} size={48} />
        <View style={styles.optionTexts}>
          <Text variant="titleMedium">{title}</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {subtitle}
          </Text>
        </View>
        <Icon source="chevron-right" size={22} color={theme.colors.onSurfaceVariant} />
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  sheet: { marginHorizontal: spacing.sm, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  handle: { alignSelf: 'center', width: 38, height: 5, borderRadius: 3, marginBottom: spacing.sm },
  title: { paddingHorizontal: spacing.screen, paddingVertical: spacing.md },
  options: { marginHorizontal: spacing.lg },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  optionTexts: { flex: 1 },
});
