import { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Button as TextButton, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { BrandMark } from '@/components/finance/brand-mark';
import { Button } from '@/components/ui/button';
import { AmbientBackground, glassSurface } from '@/components/ui/glass';
import { useLogout } from '@/hooks/use-auth';
import { authenticate } from '@/lib/biometrics';
import { useAppLock } from '@/stores/app-lock';
import { firstName, useSession } from '@/stores/session';
import { spacing, useAppTheme } from '@/theme';

export default function LockScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const name = useSession((state) => firstName(state.user?.name));
  const unlock = useAppLock((state) => state.unlock);
  const logout = useLogout();

  const prompt = useCallback(async () => {
    const success = await authenticate({
      title: t('auth.lockPromptTitle'),
      subtitle: t('auth.lockPromptSubtitle'),
      cancelLabel: t('common.cancel'),
    });
    if (success) unlock();
  }, [t, unlock]);

  useEffect(() => {
    void prompt();
  }, [prompt]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <AmbientBackground />
      <BrandMark size={88} />
      <Text variant="headlineMedium" style={[styles.center, { marginTop: spacing.xl }]}>
        {t('auth.lockGreeting', { name })}
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.center, { marginTop: spacing.sm, color: theme.colors.onSurfaceVariant }]}
      >
        {t('auth.lockMessage')}
      </Text>
      <View
        style={[glassSurface(theme, 56), styles.faceRing]}
        importantForAccessibility="no-hide-descendants"
      >
        <Icon source="face-recognition" size={52} color={theme.colors.primary} />
      </View>
      <Button title={t('auth.lockUnlock')} onPress={prompt} icon="face-recognition" style={styles.unlock} />
      <TextButton onPress={() => logout.mutate()} style={{ marginTop: spacing.sm }}>
        {t('auth.lockOtherAccount')}
      </TextButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  center: { textAlign: 'center' },
  faceRing: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  unlock: { marginTop: spacing.xxl, maxWidth: 360, width: '100%' },
});
