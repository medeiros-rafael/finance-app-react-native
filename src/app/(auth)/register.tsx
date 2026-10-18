import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { TextInput as NativeTextInput } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { AuthScaffold } from '@/components/auth/auth-scaffold';
import { Button } from '@/components/ui/button';
import { ErrorBanner } from '@/components/ui/states';
import { TextField } from '@/components/ui/text-field';
import { useRegister } from '@/hooks/use-auth';
import { useFormError } from '@/hooks/use-form-error';
import { appErrorMessage, validationMessage } from '@/i18n/messages';
import { registerSchema, type RegisterForm } from '@/lib/validation';
import { spacing } from '@/theme';

const FIELDS = ['name', 'email', 'password', 'confirmPassword'] as const;

export default function RegisterScreen() {
  const { t } = useTranslation();
  const register = useRegister();
  const refs = {
    email: useRef<NativeTextInput>(null),
    password: useRef<NativeTextInput>(null),
    confirmPassword: useRef<NativeTextInput>(null),
  };
  const { control, handleSubmit, setError, formState } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });
  const formError = useFormError(setError, FIELDS);

  const submit = handleSubmit((values) => {
    formError.clear();
    register.mutate(values, { onError: formError.handle });
  });

  const field = (
    name: (typeof FIELDS)[number],
    props: {
      label: string;
      icon: string;
      next?: keyof typeof refs;
      password?: boolean;
      supportingText?: string;
    },
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur } }) => (
        <TextField
          ref={name === 'name' ? undefined : refs[name]}
          label={props.label}
          leftIcon={props.icon}
          password={props.password}
          value={value}
          onChangeText={(text) => {
            onChange(text);
            formError.clear();
          }}
          onBlur={onBlur}
          error={validationMessage(t, formState.errors[name]?.message)}
          supportingText={props.supportingText}
          autoCapitalize={name === 'name' ? 'words' : 'none'}
          keyboardType={name === 'email' ? 'email-address' : 'default'}
          returnKeyType={props.next ? 'next' : 'done'}
          onSubmitEditing={props.next ? () => refs[props.next!].current?.focus() : submit}
          containerStyle={{ marginBottom: spacing.md }}
        />
      )}
    />
  );

  return (
    <AuthScaffold
      title={t('auth.registerTitle')}
      subtitle={t('auth.registerSubtitle')}
      header={
        <IconButton
          icon="arrow-left"
          onPress={() => router.back()}
          accessibilityLabel={t('auth.back')}
          style={{ marginLeft: -spacing.sm, marginBottom: spacing.lg }}
        />
      }
    >
      {field('name', { label: t('auth.name'), icon: 'account-outline', next: 'email' })}
      {field('email', { label: t('auth.email'), icon: 'email-outline', next: 'password' })}
      {field('password', {
        label: t('auth.password'),
        icon: 'lock-outline',
        password: true,
        next: 'confirmPassword',
        supportingText: t('auth.passwordHint'),
      })}
      {field('confirmPassword', { label: t('auth.confirmPassword'), icon: 'lock-outline', password: true })}

      <ErrorBanner message={formError.error ? appErrorMessage(t, formError.error) : null} />

      <Button
        title={t('auth.registerAction')}
        onPress={submit}
        loading={register.isPending}
        style={{ marginVertical: spacing.xl }}
      />
    </AuthScaffold>
  );
}
