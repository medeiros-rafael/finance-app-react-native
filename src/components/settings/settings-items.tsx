import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Dialog, Icon, Portal, RadioButton, Switch, Text, TouchableRipple } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { LANGUAGES, type Language } from '@/i18n';
import { glassSurface } from '@/components/ui/glass';
import { radius, spacing, useAppTheme } from '@/theme';

export const languageLabels = {
  'pt-BR': 'settings.languagePt',
  en: 'settings.languageEn',
  es: 'settings.languageEs',
} as const satisfies Record<Language, string>;

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  const theme = useAppTheme();
  return (
    <View>
      <Text
        variant="labelMedium"
        style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}
        role="heading"
      >
        {title.toUpperCase()}
      </Text>
      <View style={[glassSurface(theme, radius.lg), styles.section]}>{children}</View>
    </View>
  );
}

type ItemProps = {
  icon: string;
  title: string;
  subtitle?: string;
  destructive?: boolean;
  onPress?: () => void;
};

export function SettingsItem({ icon, title, subtitle, destructive = false, onPress }: ItemProps) {
  const theme = useAppTheme();
  const tint = destructive ? theme.colors.error : theme.colors.primary;
  const content = (
    <View style={styles.item}>
      <IconTile icon={icon} color={tint} />
      <View style={styles.itemTexts}>
        <Text variant="bodyLarge" style={[styles.itemTitle, destructive ? { color: tint } : undefined]}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onPress ? <Icon source="chevron-right" size={22} color={theme.colors.onSurfaceVariant} /> : null}
    </View>
  );
  if (!onPress) return content;
  return (
    <TouchableRipple onPress={onPress} role="button" aria-label={title}>
      {content}
    </TouchableRipple>
  );
}

type SwitchProps = {
  icon: string;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function SettingsSwitch({ icon, title, subtitle, value, onValueChange }: SwitchProps) {
  const theme = useAppTheme();
  return (
    <TouchableRipple
      onPress={() => onValueChange(!value)}
      role="switch"
      aria-checked={value}
      aria-label={title}
    >
      <View style={styles.item}>
        <IconTile icon={icon} color={theme.colors.primary} />
        <View style={styles.itemTexts}>
          <Text variant="bodyLarge" style={styles.itemTitle}>
            {title}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {subtitle}
          </Text>
        </View>
        <Switch value={value} onValueChange={onValueChange} />
      </View>
    </TouchableRipple>
  );
}

function IconTile({ icon, color }: { icon: string; color: string }) {
  const theme = useAppTheme();
  return (
    <View style={[styles.tile, { backgroundColor: color }]}>
      <Icon source={icon} size={18} color={theme.dark ? theme.colors.onPrimary : '#FFFFFF'} />
    </View>
  );
}

type LanguageDialogProps = {
  visible: boolean;
  current: Language;
  onSelect: (language: Language) => void;
  onDismiss: () => void;
};

export function LanguageDialog({ visible, current, onSelect, onDismiss }: LanguageDialogProps) {
  const { t } = useTranslation();
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Icon icon="translate" />
        <Dialog.Title style={{ textAlign: 'center' }}>{t('settings.language')}</Dialog.Title>
        <Dialog.Content>
          <RadioButton.Group value={current} onValueChange={(value) => onSelect(value as Language)}>
            {LANGUAGES.map((language) => (
              <RadioButton.Item key={language} value={language} label={t(languageLabels[language])} />
            ))}
          </RadioButton.Group>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{t('settings.close')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginLeft: spacing.screen + spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  section: { marginHorizontal: spacing.screen, overflow: 'hidden' },
  tile: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontWeight: '600' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  itemTexts: { flex: 1, marginHorizontal: spacing.md },
});
