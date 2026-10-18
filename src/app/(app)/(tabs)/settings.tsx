import * as Application from 'expo-application';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import {
  LanguageDialog,
  languageLabels,
  SettingsItem,
  SettingsSection,
  SettingsSwitch,
} from '@/components/settings/settings-items';
import { AmbientBackground } from '@/components/ui/glass';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SegmentedPicker } from '@/components/ui/pickers';
import { TopBar } from '@/components/ui/top-bar';
import { useLogout } from '@/hooks/use-auth';
import { deviceLanguage } from '@/i18n';
import { authenticate, biometricAvailability } from '@/lib/biometrics';
import { useAppLock } from '@/stores/app-lock';
import { usePreferences, type ThemeMode } from '@/stores/preferences';
import { useSession } from '@/stores/session';
import { showSnackbar } from '@/stores/snackbar';
import { radius, spacing, useAppTheme, withAlpha } from '@/theme';

const THEME_MODES: readonly ThemeMode[] = ['system', 'light', 'dark'];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const user = useSession((state) => state.user);
  const preferences = usePreferences();
  const logout = useLogout();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const language = preferences.language ?? deviceLanguage();

  const onBiometricToggle = async (enable: boolean) => {
    if (!enable) {
      preferences.setBiometricLock(false);
      return;
    }
    const availability = await biometricAvailability();
    if (availability === 'notEnrolled') return showSnackbar(t('settings.biometricNotEnrolled'));
    if (availability === 'unavailable') return showSnackbar(t('settings.biometricUnavailable'));
    const success = await authenticate({
      title: t('settings.biometricPromptTitle'),
      subtitle: t('settings.biometricPromptSubtitle'),
      cancelLabel: t('common.cancel'),
    });
    if (success) {
      useAppLock.getState().unlock();
      preferences.setBiometricLock(true);
    }
  };

  const themeLabel = (mode: ThemeMode) =>
    mode === 'system'
      ? t('settings.themeSystem')
      : mode === 'light'
        ? t('settings.themeLight')
        : t('settings.themeDark');

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.surface }]}>
      <AmbientBackground />
      <TopBar title={t('settings.title')} />
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <TouchableRipple
          onPress={() => router.push('/profile')}
          borderless
          role="button"
          aria-label={t('settings.profile')}
          style={styles.profileTouch}
        >
          <LinearGradient
            colors={theme.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profile}
          >
            <View style={styles.profileAvatar}>
              <Text variant="headlineSmall" style={{ color: theme.colors.onHero }}>
                {(user?.name ?? '').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileTexts}>
              <Text variant="titleLarge" style={{ color: theme.colors.onHero }}>
                {user?.name}
              </Text>
              <Text variant="bodyMedium" style={{ color: withAlpha(theme.colors.onHero, 0.85) }}>
                {user?.email}
              </Text>
            </View>
            <Icon source="chevron-right" size={24} color={theme.colors.onHero} />
          </LinearGradient>
        </TouchableRipple>

        <SettingsSection title={t('settings.sectionAppearance')}>
          <View style={styles.themeBlock}>
            <View style={styles.themeTitle}>
              <View style={[styles.tile, { backgroundColor: theme.colors.primary }]}>
                <Icon
                  source="theme-light-dark"
                  size={18}
                  color={theme.dark ? theme.colors.onPrimary : '#FFFFFF'}
                />
              </View>
              <Text variant="bodyLarge" style={styles.themeLabel}>
                {t('settings.theme')}
              </Text>
            </View>
            <SegmentedPicker
              options={THEME_MODES}
              selected={preferences.themeMode}
              onSelect={preferences.setThemeMode}
              label={themeLabel}
            />
          </View>
          <SettingsItem
            icon="translate"
            title={t('settings.language')}
            subtitle={t(languageLabels[language])}
            onPress={() => setLanguageOpen(true)}
          />
        </SettingsSection>

        <SettingsSection title={t('settings.sectionSecurity')}>
          <SettingsSwitch
            icon="face-recognition"
            title={t('settings.biometric')}
            subtitle={t('settings.biometricHint')}
            value={preferences.biometricLockEnabled}
            onValueChange={(value) => void onBiometricToggle(value)}
          />
          <SettingsSwitch
            icon="eye-off-outline"
            title={t('settings.hideValues')}
            subtitle={t('settings.hideValuesHint')}
            value={preferences.hideValues}
            onValueChange={preferences.setHideValues}
          />
          <SettingsItem
            icon="form-textbox-password"
            title={t('settings.changePassword')}
            onPress={() => router.push('/change-password')}
          />
        </SettingsSection>

        <SettingsSection title={t('settings.sectionAbout')}>
          <SettingsItem
            icon="information-outline"
            title={t('settings.version')}
            subtitle={Application.nativeApplicationVersion ?? '1.0.0'}
          />
          <SettingsItem
            icon="logout"
            title={t('settings.logout')}
            destructive
            onPress={() => setConfirmLogout(true)}
          />
        </SettingsSection>
      </ScrollView>

      <LanguageDialog
        visible={languageOpen}
        current={language}
        onSelect={(value) => {
          preferences.setLanguage(value);
          setLanguageOpen(false);
        }}
        onDismiss={() => setLanguageOpen(false)}
      />
      <ConfirmDialog
        visible={confirmLogout}
        title={t('settings.logoutConfirmTitle')}
        message={t('settings.logoutConfirmMessage')}
        confirmText={t('settings.logout')}
        onConfirm={() => {
          setConfirmLogout(false);
          logout.mutate();
        }}
        onDismiss={() => setConfirmLogout(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  profileTouch: { marginHorizontal: spacing.screen, marginVertical: spacing.sm, borderRadius: radius.xl },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTexts: { flex: 1, marginHorizontal: spacing.lg },
  themeBlock: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  themeTitle: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  tile: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  themeLabel: { marginLeft: spacing.md, fontWeight: '600' },
});
