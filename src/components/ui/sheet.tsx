import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { radius, spacing, useAppTheme } from '@/theme';

import { glassSurface } from './glass';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  children: ReactNode;
  scrollable?: boolean;
};

const MAX_CONTENT_HEIGHT = 600;

export function Sheet({ visible, onDismiss, children, scrollable = false }: Props) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const contentStyle = { paddingBottom: spacing.lg };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.root}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.backdrop }]}
          onPress={onDismiss}
          aria-label={t('settings.close')}
        />
        <View
          style={[
            glassSurface(theme, radius.xxl, 'sheet'),
            styles.sheet,
            { marginBottom: insets.bottom + spacing.sm },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.outlineVariant }]} />
          {scrollable ? (
            <ScrollView style={styles.scroll} contentContainerStyle={contentStyle}>
              {children}
            </ScrollView>
          ) : (
            <View style={contentStyle}>{children}</View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  sheet: { marginHorizontal: spacing.sm, paddingTop: spacing.sm, overflow: 'hidden' },
  handle: { alignSelf: 'center', width: 38, height: 5, borderRadius: 3, marginBottom: spacing.md },
  scroll: { maxHeight: MAX_CONTENT_HEIGHT },
});
