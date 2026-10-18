import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import type { Account, Dashboard } from '@/api/schemas';
import { accountTypeIcons, ColoredIconBadge } from '@/components/finance/icons';
import { MoneyText } from '@/components/finance/money-text';
import { glassSurface } from '@/components/ui/glass';
import { Skeleton } from '@/components/ui/states';
import type { Cents } from '@/lib/money';
import { radius, spacing, useAppTheme, withAlpha } from '@/theme';

export function BalanceHeroCard({ dashboard }: { dashboard: Dashboard }) {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const onHero = theme.colors.onHero;
  return (
    <LinearGradient
      colors={theme.heroGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.hero,
        {
          boxShadow: theme.dark ? '0 18px 40px 0 rgba(90,60,220,0.30)' : '0 18px 40px 0 rgba(91,52,200,0.28)',
        },
      ]}
    >
      <View pointerEvents="none" style={styles.heroShine} />
      <Text variant="labelLarge" style={{ color: withAlpha(onHero, 0.85) }}>
        {t('dashboard.netWorth')}
      </Text>
      <MoneyText
        cents={dashboard.totalBalance}
        variant="displayMedium"
        color={onHero}
        style={{ marginTop: spacing.xs }}
      />
      <View style={styles.availableRow}>
        <Text variant="bodySmall" style={{ color: withAlpha(onHero, 0.8) }}>
          {t('dashboard.available')}{' '}
        </Text>
        <MoneyText cents={dashboard.availableBalance} variant="bodySmall" color={withAlpha(onHero, 0.9)} />
      </View>
      <View style={styles.pills}>
        <HeroPill icon="arrow-bottom-left" label={t('dashboard.income')} cents={dashboard.totalIncome} />
        <HeroPill icon="arrow-top-right" label={t('dashboard.expenses')} cents={dashboard.totalExpense} />
      </View>
    </LinearGradient>
  );
}

function HeroPill({ icon, label, cents }: { icon: string; label: string; cents: Cents }) {
  const onHero = useAppTheme().colors.onHero;
  return (
    <View style={styles.pill}>
      <View style={[styles.pillIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
        <Icon source={icon} size={16} color={onHero} />
      </View>
      <View style={{ marginLeft: spacing.sm, flexShrink: 1 }}>
        <Text variant="labelSmall" style={{ color: withAlpha(onHero, 0.85) }}>
          {label}
        </Text>
        <MoneyText cents={cents} variant="labelLarge" color={onHero} />
      </View>
    </View>
  );
}

type QuickActionProps = { icon: string; label: string; tint: string; onPress: () => void };

export function QuickAction({ icon, label, tint, onPress }: QuickActionProps) {
  const theme = useAppTheme();
  return (
    <TouchableRipple onPress={onPress} borderless role="button" aria-label={label} style={styles.quickAction}>
      <View style={styles.quickActionContent}>
        <View style={[glassSurface(theme, 30), styles.quickIcon]}>
          <Icon source={icon} size={24} color={tint} />
        </View>
        <Text variant="labelMedium" numberOfLines={1} style={styles.quickLabel}>
          {label}
        </Text>
      </View>
    </TouchableRipple>
  );
}

export function AccountCard({ account, onPress }: { account: Account; onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <TouchableRipple
      onPress={onPress}
      borderless
      role="button"
      aria-label={account.name}
      style={[glassSurface(theme, radius.lg), styles.accountCard]}
    >
      <View style={styles.accountContent}>
        <ColoredIconBadge icon={accountTypeIcons[account.type]} color={account.color} size={40} />
        <Text variant="bodyMedium" numberOfLines={1} style={styles.accountName}>
          {account.name}
        </Text>
        <MoneyText cents={account.currentBalance} variant="titleLarge" />
      </View>
    </TouchableRipple>
  );
}

export function NewAccountCard({ onPress }: { onPress: () => void }) {
  const theme = useAppTheme();
  const { t } = useTranslation();
  return (
    <TouchableRipple
      onPress={onPress}
      borderless
      role="button"
      style={[
        glassSurface(theme, radius.lg),
        styles.newAccount,
        { borderStyle: 'dashed', borderColor: withAlpha(theme.colors.primary, 0.35) },
      ]}
    >
      <View style={styles.newAccountContent}>
        <Icon source="plus" size={24} color={theme.colors.primary} />
        <Text variant="labelLarge" style={{ color: theme.colors.primary, marginTop: spacing.xs }}>
          {t('dashboard.newAccount')}
        </Text>
      </View>
    </TouchableRipple>
  );
}

export function DashboardSkeleton() {
  return (
    <View style={styles.skeleton}>
      <Skeleton height={190} borderRadius={radius.xl} />
      <View style={styles.skeletonRow}>
        {[0, 1, 2, 3].map((key) => (
          <Skeleton key={key} width={56} height={56} />
        ))}
      </View>
      <View style={styles.skeletonRow}>
        <Skeleton width={168} height={118} borderRadius={radius.lg} />
        <Skeleton width={168} height={118} borderRadius={radius.lg} />
      </View>
      <Skeleton height={200} borderRadius={radius.lg} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.xl, padding: spacing.xl, overflow: 'hidden' },
  heroShine: {
    position: 'absolute',
    top: -90,
    right: -70,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  availableRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  pills: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pillIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickAction: { flex: 1, borderRadius: radius.md },
  quickActionContent: { alignItems: 'center', paddingVertical: spacing.sm },
  quickIcon: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { marginTop: spacing.sm, fontWeight: '700' },
  accountCard: { width: 168, overflow: 'hidden' },
  accountName: { marginTop: spacing.md, fontWeight: '600' },
  accountContent: { padding: spacing.lg },
  newAccount: { width: 120, alignSelf: 'stretch', minHeight: 132, overflow: 'hidden' },
  newAccountContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  skeleton: { paddingHorizontal: spacing.screen, gap: spacing.lg, paddingTop: spacing.sm },
  skeletonRow: { flexDirection: 'row', gap: spacing.lg },
});
