import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View, type TextInput as NativeTextInput } from 'react-native';
import { Button as TextButton, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { AuthScaffold } from '@/components/auth/auth-scaffold';
import { BrandMark } from '@/components/finance/brand-mark';
import { Button } from '@/components/ui/button';
import { ErrorBanner } from '@/components/ui/states';
import { TextField } from '@/components/ui/text-field';
import { useLogin } from '@/hooks/use-auth';
import { useFormError } from '@/hooks/use-form-error';
import { appErrorMessage, validationMessage } from '@/i18n/messages';
import { loginSchema, type LoginForm } from '@/lib/validation';
import { spacing } from '@/theme';

export default function LoginScreen() {
  const { t } = useTranslation();
  const login = useLogin();
  const passwordRef = useRef<NativeTextInput>(null);
  const { control, handleSubmit, setError, formState } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const formError = useFormError(setError, ['email', 'password']);

  const submit = handleSubmit((values) => {
    formError.clear();
    login.mutate(values, { onError: formError.handle });
  });

  return (
    <AuthScaffold
      title={t('auth.loginTitle')}
      subtitle={t('auth.loginSubtitle')}
      header={
        <View style={styles.brand}>
          <BrandMark />
        </View>
      }
    >
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <TextField
            label={t('auth.email')}
            leftIcon="email-outline"
            value={field.value}
            onChangeText={(value) => {
              field.onChange(value);
              formError.clear();
            }}
            onBlur={field.onBlur}
            error={validationMessage(t, formState.errors.email?.message)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <TextField
            ref={passwordRef}
            label={t('auth.password')}
            leftIcon="lock-outline"
            password
            value={field.value}
            onChangeText={(value) => {
              field.onChange(value);
              formError.clear();
            }}
            onBlur={field.onBlur}
            error={validationMessage(t, formState.errors.password?.message)}
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={submit}
            containerStyle={{ marginTop: spacing.md }}
          />
        )}
      />
      <TextButton style={styles.forgot} onPress={() => router.push('/forgot-password')}>
        {t('auth.forgotPassword')}
      </TextButton>

      <ErrorBanner
        message={formError.error ? appErrorMessage(t, formError.error) : null}
        style={{ marginTop: spacing.sm }}
      />

      <Button
        title={t('auth.loginAction')}
        onPress={submit}
        loading={login.isPending}
        style={{ marginTop: spacing.lg }}
      />

      <View style={styles.registerRow}>
        <Text variant="bodyMedium">{t('auth.noAccount')}</Text>
        <TextButton onPress={() => router.push('/register')}>{t('auth.createAccount')}</TextButton>
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  brand: { marginTop: spacing.xxl, marginBottom: spacing.xl },
  forgot: { alignSelf: 'flex-end' },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
});
