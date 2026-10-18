import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { glassSurface } from '@/components/ui/glass';
import { spacing, useAppTheme } from '@/theme';

const TABS = {
  index: { label: 'nav.home', icon: 'home', iconOutline: 'home-outline' },
  statement: { label: 'nav.statement', icon: 'receipt-text', iconOutline: 'receipt-text-outline' },
  accounts: { label: 'nav.accounts', icon: 'wallet', iconOutline: 'wallet-outline' },
  settings: { label: 'nav.settings', icon: 'cog', iconOutline: 'cog-outline' },
} as const;

type Props = BottomTabBarProps & { onAddPress: () => void };

/**
 * Floating capsule tab bar (iOS 26 style) with the "add" action as a separate round button.
 */
export function FinanceTabBar({ state, navigation, onAddPress }: Props) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom + spacing.sm }]}>
      <View role="tablist" style={[glassSurface(theme, 32, 'fillStrong'), styles.bar]}>
        {state.routes.map((route, index) => {
          const tab = TABS[route.name as keyof typeof TABS];
          if (!tab) return null;
          const focused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };
          const color = focused ? theme.colors.primary : theme.colors.onSurfaceVariant;
          return (
            <Pressable
              key={route.key}
              role="tab"
              aria-selected={focused}
              aria-label={t(tab.label)}
              onPress={onPress}
              style={[
                styles.item,
                { backgroundColor: focused ? theme.colors.secondaryContainer : 'transparent' },
              ]}
            >
              <Icon source={focused ? tab.icon : tab.iconOutline} size={23} color={color} />
              <Text
                variant="labelSmall"
                numberOfLines={1}
                style={[styles.label, { color, fontWeight: focused ? '800' : '600' }]}
              >
                {t(tab.label)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        role="button"
        aria-label={t('nav.add')}
        onPress={onAddPress}
        android_ripple={{ color: theme.colors.onPrimary, borderless: false, foreground: true }}
        style={({ pressed }) => [
          styles.addButton,
          {
            backgroundColor: theme.colors.primary,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.96 : 1 }],
            boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.28), 0 10px 24px 0 ${theme.dark ? 'rgba(120,90,255,0.35)' : 'rgba(91,52,200,0.30)'}`,
          },
        ]}
      >
        <Icon source="plus" size={28} color={theme.colors.onPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  bar: { flex: 1, flexDirection: 'row', height: 64, padding: 4, gap: 2 },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: 28,
    overflow: 'hidden',
  },
  label: { fontSize: 11 },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
