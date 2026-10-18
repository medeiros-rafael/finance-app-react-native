import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Icon, IconButton, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { toAppError } from '@/api/errors';
import type { Dashboard } from '@/api/schemas';
import { CategoryDonut, MonthlyEvolutionChart } from '@/components/dashboard/charts';
import {
  AccountCard,
  BalanceHeroCard,
  DashboardSkeleton,
  NewAccountCard,
  QuickAction,
} from '@/components/dashboard/dashboard-cards';
import { MonthSelector } from '@/components/finance/month-selector';
import { TransactionItem } from '@/components/finance/transaction-item';
import { Card } from '@/components/ui/card';
import { AmbientBackground, GlassGroup, glassSurface } from '@/components/ui/glass';
import { SectionHeader } from '@/components/ui/section-header';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { useDashboard } from '@/hooks/use-finance-queries';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useRefreshOnFocus } from '@/hooks/use-refresh-on-focus';
import { appErrorMessage } from '@/i18n/messages';
import { currentMonth } from '@/lib/dates';
import { usePreferences } from '@/stores/preferences';
import { firstName, useSession } from '@/stores/session';
import { spacing, useAppTheme } from '@/theme';

const openTransaction = (id: string) => router.push({ pathname: '/transaction/[id]', params: { id } });

export default function DashboardScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const [month, setMonth] = useState(currentMonth);
  const query = useDashboard(month);
  const pull = usePullToRefresh(query.refetch);
  useRefreshOnFocus(query.refetch);

  const name = useSession((state) => firstName(state.user?.name));
  const hideValues = usePreferences((state) => state.hideValues);
  const toggleHideValues = usePreferences((state) => state.toggleHideValues);

  let content;
  if (query.isPending) {
    content = <DashboardSkeleton />;
  } else if (query.isError && !query.data) {
    content = (
      <ErrorState
        message={appErrorMessage(t, toAppError(query.error))}
        onRetry={() => void query.refetch()}
      />
    );
  } else {
    content = (
      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={pull.refreshing} onRefresh={pull.onRefresh} />}
      >
        <DashboardContent dashboard={query.data!} />
      </ScrollView>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.surface }]}>
      <AmbientBackground />
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.greetingRow}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text variant="titleMedium" style={{ color: theme.colors.onPrimaryContainer }}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.greetingTexts}>
            <Text variant="headlineSmall">{t('dashboard.greeting', { name })}</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {t('dashboard.subtitle')}
            </Text>
          </View>
          <IconButton
            size={20}
            style={[glassSurface(theme, 22), styles.eye]}
            iconColor={theme.colors.onSurface}
            icon={hideValues ? 'eye-off-outline' : 'eye-outline'}
            onPress={toggleHideValues}
            accessibilityLabel={hideValues ? t('dashboard.showValues') : t('dashboard.hideValues')}
          />
        </View>
        <MonthSelector month={month} onMonthChange={setMonth} />
      </SafeAreaView>
      {content}
    </View>
  );
}

function DashboardContent({ dashboard }: { dashboard: Dashboard }) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const goToAccounts = () => router.navigate('/accounts');
  const createAccount = () => router.push('/account/new');

  return (
    <>
      <View style={styles.padded}>
        <BalanceHeroCard dashboard={dashboard} />
      </View>

      <View style={styles.quickActions}>
        <QuickAction
          icon="arrow-down"
          label={t('dashboard.actionIncome')}
          tint={theme.colors.income}
          onPress={() => router.push({ pathname: '/transaction/new', params: { type: 'INCOME' } })}
        />
        <QuickAction
          icon="arrow-up"
          label={t('dashboard.actionExpense')}
          tint={theme.colors.expense}
          onPress={() => router.push({ pathname: '/transaction/new', params: { type: 'EXPENSE' } })}
        />
        <QuickAction
          icon="swap-horizontal"
          label={t('dashboard.actionTransfer')}
          tint={theme.colors.primary}
          onPress={() => router.push('/transfer')}
        />
        <QuickAction
          icon="bank-outline"
          label={t('dashboard.actionAccounts')}
          tint={theme.colors.primary}
          onPress={goToAccounts}
        />
      </View>

      <View>
        <SectionHeader
          title={t('dashboard.myAccounts')}
          actionText={t('dashboard.seeAll')}
          onAction={goToAccounts}
          style={styles.sectionHeader}
        />
        <FlatList
          horizontal
          data={dashboard.accounts}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
          renderItem={({ item }) => (
            <AccountCard
              account={item}
              onPress={() => router.push({ pathname: '/account/[id]', params: { id: item.id } })}
            />
          )}
          ListFooterComponent={<NewAccountCard onPress={createAccount} />}
        />
      </View>

      {dashboard.accounts.length === 0 ? (
        <EmptyState
          icon="bank-outline"
          title={t('dashboard.emptyTitle')}
          message={t('dashboard.emptyMessage')}
          actionText={t('dashboard.newAccount')}
          onAction={createAccount}
          style={styles.empty}
        />
      ) : (
        <>
          <Card style={styles.padded}>
            <SectionHeader title={t('dashboard.spendingByCategory')} />
            <View style={{ marginTop: spacing.md }}>
              {dashboard.categoryExpenses.length === 0 ? (
                <View style={styles.noExpenses}>
                  <Icon source="chart-donut" size={24} color={theme.colors.onSurfaceVariant} />
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurfaceVariant, marginLeft: spacing.sm }}
                  >
                    {t('dashboard.noExpenses')}
                  </Text>
                </View>
              ) : (
                <CategoryDonut expenses={dashboard.categoryExpenses} total={dashboard.totalExpense} />
              )}
            </View>
          </Card>

          <Card style={styles.padded}>
            <SectionHeader title={t('dashboard.monthlyEvolution')} />
            <View style={{ marginTop: spacing.sm }}>
              <MonthlyEvolutionChart evolution={dashboard.monthlyEvolution} />
            </View>
          </Card>

          {dashboard.upcomingExpenses.length > 0 ? (
            <View>
              <SectionHeader title={t('dashboard.upcoming')} style={styles.sectionHeader} />
              <GlassGroup style={styles.padded}>
                {dashboard.upcomingExpenses.map((tx) => (
                  <TransactionItem
                    key={`up-${tx.id}`}
                    transaction={tx}
                    onPress={openTransaction}
                    showDate
                    grouped
                  />
                ))}
              </GlassGroup>
            </View>
          ) : null}

          <View>
            <SectionHeader
              title={t('dashboard.recent')}
              actionText={t('dashboard.seeStatement')}
              onAction={() => router.navigate('/statement')}
              style={styles.sectionHeader}
            />
            {dashboard.recentTransactions.length === 0 ? (
              <Text variant="bodyMedium" style={[styles.padded, { color: theme.colors.onSurfaceVariant }]}>
                {t('dashboard.noTransactions')}
              </Text>
            ) : (
              <GlassGroup style={styles.padded}>
                {dashboard.recentTransactions.map((tx) => (
                  <TransactionItem
                    key={`recent-${tx.id}`}
                    transaction={tx}
                    onPress={openTransaction}
                    showDate
                    grouped
                  />
                ))}
              </GlassGroup>
            )}
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingLeft: spacing.screen, paddingRight: spacing.sm, paddingTop: spacing.md },
  greetingRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  eye: { width: 44, height: 44, marginRight: spacing.sm },
  greetingTexts: { flex: 1, marginLeft: spacing.md },
  list: { paddingBottom: spacing.xl, paddingTop: spacing.xs, gap: spacing.xl },
  padded: { marginHorizontal: spacing.screen },
  quickActions: { flexDirection: 'row', paddingHorizontal: spacing.sm },
  sectionHeader: { paddingLeft: spacing.screen, paddingRight: spacing.sm, marginBottom: spacing.xs },
  carousel: { paddingHorizontal: spacing.screen, gap: spacing.md },
  empty: { minHeight: 320 },
  noExpenses: { flexDirection: 'row', alignItems: 'center' },
});
