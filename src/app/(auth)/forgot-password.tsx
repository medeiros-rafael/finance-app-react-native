import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View, type TextInput as NativeTextInput } from 'react-native';
import { Button as TextButton, IconButton } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { AuthScaffold } from '@/components/auth/auth-scaffold';
import { Button } from '@/components/ui/button';
import { ErrorBanner } from '@/components/ui/states';
import { TextField } from '@/components/ui/text-field';
import { useForgotPassword, useResetPassword } from '@/hooks/use-auth';
import { useFormError } from '@/hooks/use-form-error';
import { appErrorMessage, validationMessage } from '@/i18n/messages';
import {
  RESET_CODE_LENGTH,
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordForm,
  type ResetPasswordForm,
} from '@/lib/validation';
import { showSnackbar } from '@/stores/snackbar';
import { spacing } from '@/theme';

/** Passo 1: pede o código por e-mail. Passo 2: código + nova senha. */
export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState<string | null>(null);

  return (
    <AuthScaffold
      title={email ? t('auth.resetTitle') : t('auth.forgotTitle')}
      subtitle={email ? t('auth.forgotSent', { email }) : t('auth.forgotSubtitle')}
      header={
        <IconButton
          icon="arrow-left"
          onPress={() => (email ? setEmail(null) : router.back())}
          accessibilityLabel={t('auth.back')}
          style={{ marginLeft: -spacing.sm, marginBottom: spacing.lg }}
        />
      }
    >
      {email ? <ResetStep email={email} /> : <RequestStep onSent={setEmail} />}
    </AuthScaffold>
  );
}

function RequestStep({ onSent }: { onSent: (email: string) => void }) {
  const { t } = useTranslation();
  const forgot = useForgotPassword();
  const { control, handleSubmit, setError, formState } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });
  const formError = useFormError(setError, ['email']);

  const submit = handleSubmit(({ email }) => {
    formError.clear();
    forgot.mutate(email, { onSuccess: () => onSent(email.trim()), onError: formError.handle });
  });

  return (
    <View>
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
            returnKeyType="done"
            onSubmitEditing={submit}
          />
        )}
      />
      <ErrorBanner
        message={formError.error ? appErrorMessage(t, formError.error) : null}
        style={{ marginTop: spacing.md }}
      />
      <Button
        title={t('auth.forgotAction')}
        onPress={submit}
        loading={forgot.isPending}
        style={{ marginTop: spacing.xl }}
      />
    </View>
  );
}

const RESET_FIELDS = ['code', 'newPassword', 'confirmPassword'] as const;

function ResetStep({ email }: { email: string }) {
  const { t } = useTranslation();
  const reset = useResetPassword();
  const resend = useForgotPassword();
  const refs = {
    newPassword: useRef<NativeTextInput>(null),
    confirmPassword: useRef<NativeTextInput>(null),
  };
  const { control, handleSubmit, setError, formState } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: '', newPassword: '', confirmPassword: '' },
  });
  const formError = useFormError(setError, RESET_FIELDS);

  const submit = handleSubmit(({ code, newPassword }) => {
    formError.clear();
    reset.mutate(
      { email, code, newPassword },
      {
        onSuccess: () => {
          showSnackbar(t('auth.resetDone'));
          router.back();
        },
        onError: formError.handle,
      },
    );
  });

  const resendCode = () => {
    formError.clear();
    resend.mutate(email, {
      onSuccess: () => showSnackbar(t('auth.resetResent')),
      onError: formError.handle,
    });
  };

  const labels: Record<(typeof RESET_FIELDS)[number], { label: string; icon: string; hint?: string }> = {
    code: { label: t('auth.resetCode'), icon: 'numeric' },
    newPassword: { label: t('auth.resetNewPassword'), icon: 'lock-reset', hint: t('auth.passwordHint') },
    confirmPassword: { label: t('auth.confirmPassword'), icon: 'lock-reset' },
  };

  return (
    <Animated.View entering={FadeIn}>
      {RESET_FIELDS.map((name, index) => {
        const next = RESET_FIELDS[index + 1] as keyof typeof refs | undefined;
        return (
          <Controller
            key={name}
            control={control}
            name={name}
            render={({ field }) => (
              <TextField
                ref={name === 'code' ? undefined : refs[name]}
                label={labels[name].label}
                leftIcon={labels[name].icon}
                password={name !== 'code'}
                value={field.value}
                onChangeText={(value) => {
                  field.onChange(name === 'code' ? value.replace(/\D/g, '') : value);
                  formError.clear();
                }}
                onBlur={field.onBlur}
                error={validationMessage(t, formState.errors[name]?.message)}
                supportingText={labels[name].hint}
                keyboardType={name === 'code' ? 'number-pad' : 'default'}
                maxLength={name === 'code' ? RESET_CODE_LENGTH : undefined}
                autoComplete={name === 'code' ? 'one-time-code' : 'new-password'}
                textContentType={name === 'code' ? 'oneTimeCode' : 'newPassword'}
                returnKeyType={next ? 'next' : 'done'}
                onSubmitEditing={next ? () => refs[next].current?.focus() : submit}
                containerStyle={{ marginBottom: spacing.md }}
              />
            )}
          />
        );
      })}

      <ErrorBanner message={formError.error ? appErrorMessage(t, formError.error) : null} />

      <Button
        title={t('auth.resetAction')}
        onPress={submit}
        loading={reset.isPending}
        style={{ marginTop: spacing.xl }}
      />
      <TextButton onPress={resendCode} loading={resend.isPending} style={{ marginTop: spacing.sm }}>
        {t('auth.resetResend')}
      </TextButton>
    </Animated.View>
  );
}
