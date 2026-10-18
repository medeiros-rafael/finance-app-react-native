import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { spacing, useAppTheme } from '@/theme';

import { glassSurface } from './glass';

type Props = {
  title: string;
  onBack?: () => void;
  actions?: ReactNode;
};

/**
 * Root screens (no back action) use an iOS-style large title aligned to the leading edge;
 * pushed screens get a centered title with a round glass back button.
 */
export function TopBar({ title, onBack, actions }: Props) {
  const theme = useAppTheme();
  const { t } = useTranslation();
  if (!onBack) {
    return (
      <Appbar.Header mode="small" style={styles.transparent}>
        <Appbar.Content
          title={title}
          titleStyle={[theme.fonts.headlineLarge, { color: theme.colors.onSurface }]}
          style={styles.largeTitle}
        />
        {actions}
      </Appbar.Header>
    );
  }
  return (
    <Appbar.Header mode="center-aligned" style={styles.transparent}>
      <Appbar.BackAction
        onPress={onBack}
        accessibilityLabel={t('common.back')}
        size={20}
        style={[glassSurface(theme, 22), styles.back]}
      />
      <Appbar.Content title={title} titleStyle={theme.fonts.titleMedium} />
      {actions}
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  transparent: { backgroundColor: 'transparent' },
  largeTitle: { paddingLeft: spacing.xs },
  back: { width: 44, height: 44, marginLeft: spacing.md },
});
