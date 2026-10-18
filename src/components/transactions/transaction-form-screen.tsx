import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Appbar, Switch, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { toAppError } from '@/api/errors';
import type { Transaction } from '@/api/schemas';
import { AmountField } from '@/components/finance/amount-field';
import { AccountDropdown, CategoryField, DateField } from '@/components/finance/form-pickers';
import { AmbientBackground, glassSurface } from '@/components/ui/glass';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FormScrollView } from '@/components/ui/form-scroll-view';
import { SegmentedPicker } from '@/components/ui/pickers';
import { EmptyState, ErrorBanner, LoadingState } from '@/components/ui/states';
import { TextField } from '@/components/ui/text-field';
import { TopBar } from '@/components/ui/top-bar';
import {
  useAccounts,
  useCategories,
  useDeleteTransaction,
  useSaveTransaction,
  useTransaction,
} from '@/hooks/use-finance-queries';
import { useFormError } from '@/hooks/use-form-error';
import { appErrorMessage, validationMessage } from '@/i18n/messages';
import { today } from '@/lib/dates';
import { MoneyInput } from '@/lib/money';
import { transactionSchema, type TransactionForm, type TransactionFormOutput } from '@/lib/validation';
import { showSnackbar } from '@/stores/snackbar';
import { radius, spacing, useAppTheme } from '@/theme';

type EntryType = TransactionForm['type'];
const TYPES: readonly EntryType[] = ['EXPENSE', 'INCOME'];
const FIELDS = ['amount', 'description', 'accountId', 'categoryId', 'notes'] as const;

function toForm(tx: Transaction): TransactionForm {
  return {
    type: tx.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
    amount: MoneyInput.fromCents(tx.amount),
    description: tx.description,
    accountId: tx.accountId,
    categoryId: tx.categoryId,
    date: tx.date,
    paid: tx.status === 'PAID',
    notes: tx.notes ?? '',
  };
}

type Props = {
  transactionId?: string;
  initialType?: EntryType;
};

export function TransactionFormScreen({ transactionId, initialType = 'EXPENSE' }: Props) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const existing = useTransaction(transactionId);
  const accounts = useAccounts();
  const save = useSaveTransaction(transactionId);
  const remove = useDeleteTransaction();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const values = useMemo(() => (existing.data ? toForm(existing.data) : undefined), [existing.data]);

  const { control, handleSubmit, setError, setValue, formState } = useForm<
    TransactionForm,
    unknown,
    TransactionFormOutput
  >({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: initialType,
      amount: '',
      description: '',
      accountId: '',
      categoryId: '',
      date: today(),
      paid: true,
      notes: '',
    },
    values,
    resetOptions: { keepDirtyValues: true },
  });
  const formError = useFormError(setError, FIELDS);
  const type = useWatch({ control, name: 'type' });
  const accountId = useWatch({ control, name: 'accountId' });
  const categories = useCategories(type);

  const firstAccountId = accounts.data?.[0]?.id;
  useEffect(() => {
    if (!transactionId && !accountId && firstAccountId) setValue('accountId', firstAccountId);
  }, [transactionId, accountId, firstAccountId, setValue]);

  const submit = handleSubmit((form) => {
    formError.clear();
    save.mutate(
      {
        type: form.type,
        amount: MoneyInput.toCents(form.amount),
        description: form.description,
        accountId: form.accountId,
        categoryId: form.categoryId,
        date: form.date,
        notes: form.notes,
        status: form.paid ? 'PAID' : 'PENDING',
      },
      {
        onSuccess: () => {
          showSnackbar(
            form.type === 'INCOME' ? t('transactions.savedIncome') : t('transactions.savedExpense'),
          );
          router.back();
        },
        onError: formError.handle,
      },
    );
  });

  const onDelete = () => {
    setConfirmDelete(false);
    if (!transactionId) return;
    formError.clear();
    remove.mutate(transactionId, {
      onSuccess: () => {
        showSnackbar(t('transactions.deleted'));
        router.back();
      },
      onError: formError.handle,
    });
  };

  const title = transactionId
    ? t('transactions.editTitle')
    : type === 'INCOME'
      ? t('transactions.newIncome')
      : t('transactions.newExpense');

  const loadError = existing.error ?? accounts.error ?? categories.error;
  const bannerError = formError.error ?? (loadError ? toAppError(loadError) : null);
  const amountColor = type === 'INCOME' ? theme.colors.income : theme.colors.expense;

  let body;
  if ((transactionId && existing.isPending) || accounts.isPending) {
    body = <LoadingState />;
  } else if ((accounts.data ?? []).length === 0 && !loadError) {
    body = (
      <EmptyState
        icon="text-box-outline"
        title={t('transactions.noAccountsTitle')}
        message={t('transactions.noAccountsMessage')}
      />
    );
  } else {
    body = (
      <FormScrollView contentStyle={{ paddingVertical: spacing.md }}>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <SegmentedPicker
              options={TYPES}
              selected={field.value}
              onSelect={(value) => {
                if (value === field.value) return;
                field.onChange(value);
                setValue('categoryId', '');
              }}
              label={(value) => (value === 'INCOME' ? t('transactions.income') : t('transactions.expense'))}
            />
          )}
        />
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <AmountField
              digits={field.value}
              onDigitsChange={field.onChange}
              label={t('transactions.amount')}
              color={amountColor}
              error={validationMessage(t, formState.errors.amount?.message)}
              style={{ marginVertical: spacing.xl }}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <TextField
              label={t('transactions.description')}
              leftIcon="text-short"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={validationMessage(t, formState.errors.description?.message)}
              autoCapitalize="sentences"
              returnKeyType="done"
            />
          )}
        />
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <CategoryField
              category={categories.data?.find((category) => category.id === field.value)}
              categories={categories.data ?? []}
              onSelect={field.onChange}
              error={validationMessage(t, formState.errors.categoryId?.message)}
              style={{ marginTop: spacing.md }}
            />
          )}
        />
        <Controller
          control={control}
          name="accountId"
          render={({ field }) => (
            <AccountDropdown
              label={t('transactions.account')}
              accounts={accounts.data ?? []}
              selectedId={field.value}
              onSelect={field.onChange}
              error={validationMessage(t, formState.errors.accountId?.message)}
              style={{ marginTop: spacing.md }}
            />
          )}
        />
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <DateField date={field.value} onDateChange={field.onChange} style={{ marginTop: spacing.md }} />
          )}
        />
        <Controller
          control={control}
          name="paid"
          render={({ field }) => (
            <View style={[glassSurface(theme, radius.md), styles.paidRow]}>
              <View style={styles.flex}>
                <Text variant="bodyLarge">
                  {type === 'INCOME' ? t('transactions.received') : t('transactions.paid')}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {t('transactions.paidHint')}
                </Text>
              </View>
              <Switch
                value={field.value}
                onValueChange={field.onChange}
                aria-label={type === 'INCOME' ? t('transactions.received') : t('transactions.paid')}
              />
            </View>
          )}
        />
        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <TextField
              label={t('transactions.notes')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              multiline
              numberOfLines={2}
            />
          )}
        />

        <ErrorBanner
          message={bannerError ? appErrorMessage(t, bannerError) : null}
          style={{ marginTop: spacing.lg }}
        />
        <Button
          title={t('transactions.save')}
          onPress={submit}
          loading={save.isPending}
          style={{ marginVertical: spacing.xl }}
        />
      </FormScrollView>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.surface }]}>
      <AmbientBackground />
      <TopBar
        title={title}
        onBack={() => router.back()}
        actions={
          transactionId ? (
            <Appbar.Action
              icon="delete-outline"
              accessibilityLabel={t('transactions.delete')}
              disabled={remove.isPending}
              onPress={() => setConfirmDelete(true)}
            />
          ) : null
        }
      />
      {body}
      <ConfirmDialog
        visible={confirmDelete}
        title={t('transactions.deleteConfirmTitle')}
        message={t('transactions.deleteConfirmMessage')}
        confirmText={t('transactions.delete')}
        onConfirm={onDelete}
        onDismiss={() => setConfirmDelete(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  paidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.md,
    gap: spacing.md,
  },
});
