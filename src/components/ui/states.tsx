import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import { ActivityIndicator, Icon, Text } from 'react-native-paper';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { radius, spacing, useAppTheme, withAlpha } from '@/theme';

import { Button } from './button';
import { glassSurface } from './glass';

export function LoadingState({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.center, style]}>
      <ActivityIndicator size="large" />
    </View>
  );
}

type EmptyStateProps = {
  icon: string;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({ icon, title, message, actionText, onAction, style }: EmptyStateProps) {
  const theme = useAppTheme();
  return (
    <View style={[styles.center, styles.empty, style]}>
      <View style={[glassSurface(theme, 44), styles.emptyIcon]}>
        <Icon source={icon} size={40} color={theme.colors.primary} />
      </View>
      <Text variant="titleLarge" style={[styles.centerText, { marginTop: spacing.xl }]}>
        {title}
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.centerText, styles.message, { color: theme.colors.onSurfaceVariant }]}
      >
        {message}
      </Text>
      {actionText && onAction ? (
        <Button
          title={actionText}
          onPress={onAction}
          variant="tonal"
          fullWidth={false}
          style={{ marginTop: spacing.xl }}
        />
      ) : null}
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
  style,
}: {
  message: string;
  onRetry: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon="cloud-off-outline"
      title={t('common.errorTitle')}
      message={message}
      actionText={t('common.tryAgain')}
      onAction={onRetry}
      style={style}
    />
  );
}

export function ErrorBanner({ message, style }: { message?: string | null; style?: StyleProp<ViewStyle> }) {
  const theme = useAppTheme();
  if (!message) return null;
  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      role="alert"
      style={[
        styles.banner,
        {
          backgroundColor: withAlpha(theme.colors.error, 0.12),
          borderColor: withAlpha(theme.colors.error, 0.28),
        },
        style,
      ]}
    >
      <Icon source="alert-circle-outline" size={20} color={theme.colors.error} />
      <Text
        variant="bodyMedium"
        style={[
          styles.bannerText,
          { color: theme.dark ? theme.colors.error : theme.colors.onErrorContainer },
        ]}
      >
        {message}
      </Text>
    </Animated.View>
  );
}

type SkeletonProps = {
  width?: DimensionValue;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({ width = '100%', height, borderRadius = radius.full, style }: SkeletonProps) {
  const theme = useAppTheme();
  const opacity = useSharedValue(0.35);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.8, { duration: 900 }), -1, true);
  }, [opacity]);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: theme.colors.surfaceContainerHighest },
        animated,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { padding: spacing.xxl },
  emptyIcon: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  centerText: { textAlign: 'center' },
  message: { marginTop: spacing.sm, maxWidth: 320 },
  banner: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bannerText: { flex: 1, fontWeight: '600' },
});
