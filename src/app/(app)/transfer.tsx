import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { toAppError } from '@/api/errors';
import { AmountField } from '@/components/finance/amount-field';
import { AccountDropdown, DateField } from '@/components/finance/form-pickers';
import { AmbientBackground } from '@/components/ui/glass';
import { Button } from '@/components/ui/button';
import { FormScrollView } from '@/components/ui/form-scroll-view';
import { EmptyState, ErrorBanner, LoadingState } from '@/components/ui/states';
import { TextField } from '@/components/ui/text-field';
import { TopBar } from '@/components/ui/top-bar';
import { useAccounts, useCreateTransfer } from '@/hooks/use-finance-queries';
import { useFormError } from '@/hooks/use-form-error';
import { appErrorMessage, validationMessage } from '@/i18n/messages';
import { today } from '@/lib/dates';
import { MoneyInput } from '@/lib/money';
import { transferSchema, type TransferForm, type TransferFormOutput } from '@/lib/validation';
import { showSnackbar } from '@/stores/snackbar';
import { spacing, useAppTheme } from '@/theme';

export default function TransferScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const accounts = useAccounts();
  const transfer = useCreateTransfer();
  const list = useMemo(() => accounts.data ?? [], [accounts.data]);
  const initialValues = useMemo<TransferForm | undefined>(
    () =>
      list.length > 0
        ? {
            amount: '',
            sourceAccountId: list[0]?.id ?? '',
            destinationAccountId: list[1]?.id ?? '',
            date: today(),
            description: '',
          }
        : undefined,
    [list],
  );

  const { control, handleSubmit, setError, getValues, setValue, formState } = useForm<
    TransferForm,
    unknown,
    TransferFormOutput
  >({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      amount: '',
      sourceAccountId: '',
      destinationAccountId: '',
      date: today(),
      description: '',
    },
    values: initialValues,
    resetOptions: { keepDirtyValues: true },
  });
  const formError = useFormError(setError, [
    'amount',
    'sourceAccountId',
    'destinationAccountId',
    'description',
  ]);

  const swap = () => {
    const { sourceAccountId, destinationAccountId } = getValues();
    setValue('sourceAccountId', destinationAccountId, { shouldDirty: true });
    setValue('destinationAccountId', sourceAccountId, { shouldDirty: true });
    formError.clear();
  };

  const submit = handleSubmit((form) => {
    formError.clear();
    transfer.mutate(
      {
        sourceAccountId: form.sourceAccountId,
        destinationAccountId: form.destinationAccountId,
        amount: MoneyInput.toCents(form.amount),
        date: form.date,
        description: form.description,
      },
      {
        onSuccess: () => {
          showSnackbar(t('transactions.transferSaved'));
          router.back();
        },
        onError: formError.handle,
      },
    );
  });

  let body;
  if (accounts.isPending) {
    body = <LoadingState />;
  } else if (list.length < 2 && !accounts.error) {
    body = (
      <EmptyState
        icon="swap-horizontal"
        title={t('transactions.transferNeedAccountsTitle')}
        message={t('transactions.transferNeedAccountsMessage')}
      />
    );
  } else {
    const bannerError = formError.error ?? (accounts.error ? toAppError(accounts.error) : null);
    body = (
      <FormScrollView contentStyle={{ paddingVertical: spacing.md }}>
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <AmountField
              digits={field.value}
              onDigitsChange={field.onChange}
              label={t('transactions.amount')}
              error={validationMessage(t, formState.errors.amount?.message)}
              style={{ marginVertical: spacing.xl }}
            />
          )}
        />
        <Controller
          control={control}
          name="sourceAccountId"
          render={({ field }) => (
            <AccountDropdown
              label={t('transactions.from')}
              accounts={list}
              selectedId={field.value}
              onSelect={field.onChange}
              error={validationMessage(t, formState.errors.sourceAccountId?.message)}
            />
          )}
        />
        <View style={styles.swap}>
          <IconButton
            icon="swap-vertical"
            mode="contained-tonal"
            onPress={swap}
            accessibilityLabel={t('transactions.swapAccounts')}
          />
        </View>
        <Controller
          control={control}
          name="destinationAccountId"
          render={({ field }) => (
            <AccountDropdown
              label={t('transactions.to')}
              accounts={list}
              selectedId={field.value}
              onSelect={field.onChange}
              error={validationMessage(t, formState.errors.destinationAccountId?.message)}
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
          name="description"
          render={({ field }) => (
            <TextField
              label={t('transactions.descriptionOptional')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              containerStyle={{ marginTop: spacing.md }}
            />
          )}
        />
        <ErrorBanner
          message={bannerError ? appErrorMessage(t, bannerError) : null}
          style={{ marginTop: spacing.lg }}
        />
        <Button
          title={t('transactions.transferAction')}
          onPress={submit}
          loading={transfer.isPending}
          style={{ marginVertical: spacing.xl }}
        />
      </FormScrollView>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.surface }]}>
      <AmbientBackground />
      <TopBar title={t('transactions.transferTitle')} onBack={() => router.back()} />
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  swap: { alignItems: 'center' },
});
