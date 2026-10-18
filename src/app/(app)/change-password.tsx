import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AmbientBackground } from '@/components/ui/glass';
import { Button } from '@/components/ui/button';
import { FormScrollView } from '@/components/ui/form-scroll-view';
import { ErrorBanner } from '@/components/ui/states';
import { TextField } from '@/components/ui/text-field';
import { TopBar } from '@/components/ui/top-bar';
import { useChangePassword } from '@/hooks/use-auth';
import { useFormError } from '@/hooks/use-form-error';
import { appErrorMessage, validationMessage } from '@/i18n/messages';
import { changePasswordSchema, type ChangePasswordForm } from '@/lib/validation';
import { showSnackbar } from '@/stores/snackbar';
import { spacing, useAppTheme } from '@/theme';

const FIELDS = ['currentPassword', 'newPassword', 'confirmPassword'] as const;

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const change = useChangePassword();
  const { control, handleSubmit, setError, formState } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const formError = useFormError(setError, FIELDS);

  const submit = handleSubmit(({ currentPassword, newPassword }) => {
    formError.clear();
    change.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          showSnackbar(t('settings.passwordChanged'));
          router.back();
        },
        onError: formError.handle,
      },
    );
  });

  const labels: Record<(typeof FIELDS)[number], { label: string; icon: string; hint?: string }> = {
    currentPassword: { label: t('settings.currentPassword'), icon: 'lock-outline' },
    newPassword: { label: t('settings.newPassword'), icon: 'lock-reset', hint: t('settings.passwordHint') },
    confirmPassword: { label: t('settings.confirmPassword'), icon: 'lock-reset' },
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.surface }]}>
      <AmbientBackground />
      <TopBar title={t('settings.changePassword')} onBack={() => router.back()} />
      <FormScrollView>
        {FIELDS.map((name) => (
          <Controller
            key={name}
            control={control}
            name={name}
            render={({ field }) => (
              <TextField
                label={labels[name].label}
                leftIcon={labels[name].icon}
                password
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={validationMessage(t, formState.errors[name]?.message)}
                supportingText={labels[name].hint}
                containerStyle={{ marginBottom: spacing.md }}
              />
            )}
          />
        ))}
        <ErrorBanner message={formError.error ? appErrorMessage(t, formError.error) : null} />
        <Button
          title={t('settings.save')}
          onPress={submit}
          loading={change.isPending}
          style={{ marginTop: spacing.xl }}
        />
      </FormScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
