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
import { useUpdateProfile } from '@/hooks/use-auth';
import { useFormError } from '@/hooks/use-form-error';
import { appErrorMessage, validationMessage } from '@/i18n/messages';
import { profileSchema, type ProfileForm } from '@/lib/validation';
import { useSession } from '@/stores/session';
import { showSnackbar } from '@/stores/snackbar';
import { spacing, useAppTheme } from '@/theme';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const user = useSession((state) => state.user);
  const update = useUpdateProfile();
  const { control, handleSubmit, setError, formState } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '' },
  });
  const formError = useFormError(setError, ['name']);

  const submit = handleSubmit(({ name }) => {
    formError.clear();
    update.mutate(name, {
      onSuccess: () => {
        showSnackbar(t('settings.profileSaved'));
        router.back();
      },
      onError: formError.handle,
    });
  });

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.surface }]}>
      <AmbientBackground />
      <TopBar title={t('settings.profile')} onBack={() => router.back()} />
      <FormScrollView>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <TextField
              label={t('settings.name')}
              leftIcon="account-outline"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={validationMessage(t, formState.errors.name?.message)}
              autoCapitalize="words"
            />
          )}
        />
        <TextField
          label={t('settings.email')}
          leftIcon="email-outline"
          value={user?.email ?? ''}
          disabled
          containerStyle={{ marginTop: spacing.md }}
        />
        <ErrorBanner
          message={formError.error ? appErrorMessage(t, formError.error) : null}
          style={{ marginTop: spacing.lg }}
        />
        <Button
          title={t('settings.save')}
          onPress={submit}
          loading={update.isPending}
          style={{ marginTop: spacing.xl }}
        />
      </FormScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
