import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Chip, Switch, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { toAppError } from '@/api/errors';
import { ACCOUNT_TYPES, type Account } from '@/api/schemas';
import { AmountField } from '@/components/finance/amount-field';
import { accountTypeIcons } from '@/components/finance/icons';
import { AmbientBackground } from '@/components/ui/glass';
import { Button } from '@/components/ui/button';
import { FormScrollView } from '@/components/ui/form-scroll-view';
import { ColorSwatchPicker } from '@/components/ui/pickers';
import { ErrorBanner, LoadingState } from '@/components/ui/states';
import { TextField } from '@/components/ui/text-field';
import { TopBar } from '@/components/ui/top-bar';
import { useAccount, useSaveAccount } from '@/hooks/use-finance-queries';
import { useFormError } from '@/hooks/use-form-error';
import { accountTypeLabels, appErrorMessage, validationMessage } from '@/i18n/messages';
import { MoneyInput } from '@/lib/money';
import { accountSchema, type AccountForm, type AccountFormOutput } from '@/lib/validation';
import { showSnackbar } from '@/stores/snackbar';
import { spacing, swatches, useAppTheme } from '@/theme';

const EMPTY: AccountForm = {
  name: '',
  type: 'CHECKING',
  initialBalance: '',
  negativeBalance: false,
  institution: '',
  color: swatches[0],
};

function toForm(account: Account): AccountForm {
  return {
    name: account.name,
    type: account.type,
    initialBalance: MoneyInput.fromCents(account.initialBalance),
    negativeBalance: account.initialBalance < 0,
    institution: account.institution ?? '',
    color: account.color,
  };
}

export function AccountFormScreen({ accountId }: { accountId?: string }) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const existing = useAccount(accountId);
  const save = useSaveAccount(accountId);
  const values = useMemo(() => (existing.data ? toForm(existing.data) : undefined), [existing.data]);

  const { control, handleSubmit, setError, formState } = useForm<AccountForm, unknown, AccountFormOutput>({
    resolver: zodResolver(accountSchema),
    defaultValues: EMPTY,
    values,
    resetOptions: { keepDirtyValues: true },
  });
  const formError = useFormError(setError, ['name', 'institution', 'initialBalance', 'type', 'color']);

  const submit = handleSubmit((form) => {
    formError.clear();
    const balance = MoneyInput.toCents(form.initialBalance);
    save.mutate(
      {
        name: form.name,
        type: form.type,
        initialBalance: form.negativeBalance ? -balance : balance,
        institution: form.institution,
        color: form.color,
      },
      {
        onSuccess: () => {
          showSnackbar(t('accounts.saved'));
          router.back();
        },
        onError: formError.handle,
      },
    );
  });

  const title = accountId ? t('accounts.editTitle') : t('accounts.newTitle');

  if (accountId && existing.isPending) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.colors.surface }]}>
        <AmbientBackground />
        <TopBar title={title} onBack={() => router.back()} />
        <LoadingState />
      </View>
    );
  }

  const bannerError = formError.error ?? (existing.error ? toAppError(existing.error) : null);

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.surface }]}>
      <AmbientBackground />
      <TopBar title={title} onBack={() => router.back()} />
      <FormScrollView>
        <Controller
          control={control}
          name="initialBalance"
          render={({ field }) => (
            <AmountField
              digits={field.value}
              onDigitsChange={field.onChange}
              label={t('accounts.initialBalance')}
            />
          )}
        />
        <Controller
          control={control}
          name="negativeBalance"
          render={({ field }) => (
            <View style={styles.switchRow}>
              <Text variant="bodyMedium">{t('accounts.negativeBalance')}</Text>
              <Switch
                value={field.value}
                onValueChange={field.onChange}
                style={{ marginLeft: spacing.sm }}
                aria-label={t('accounts.negativeBalance')}
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <TextField
              label={t('accounts.name')}
              leftIcon="pencil-outline"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={validationMessage(t, formState.errors.name?.message)}
              autoCapitalize="words"
              containerStyle={{ marginTop: spacing.xl }}
            />
          )}
        />
        <Controller
          control={control}
          name="institution"
          render={({ field }) => (
            <TextField
              label={t('accounts.institution')}
              leftIcon="domain"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoCapitalize="words"
              containerStyle={{ marginTop: spacing.md }}
            />
          )}
        />

        <Text variant="titleSmall" style={styles.sectionTitle}>
          {t('accounts.type')}
        </Text>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <View style={styles.chips}>
              {ACCOUNT_TYPES.map((type) => (
                <Chip
                  key={type}
                  icon={accountTypeIcons[type]}
                  selected={field.value === type}
                  showSelectedOverlay
                  onPress={() => field.onChange(type)}
                >
                  {t(accountTypeLabels[type])}
                </Chip>
              ))}
            </View>
          )}
        />

        <Text variant="titleSmall" style={styles.sectionTitle}>
          {t('accounts.color')}
        </Text>
        <Controller
          control={control}
          name="color"
          render={({ field }) => <ColorSwatchPicker selected={field.value} onSelect={field.onChange} />}
        />

        <ErrorBanner
          message={bannerError ? appErrorMessage(t, bannerError) : null}
          style={{ marginTop: spacing.lg }}
        />

        <Button
          title={t('accounts.save')}
          onPress={submit}
          loading={save.isPending}
          style={{ marginVertical: spacing.xxl }}
        />
      </FormScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
