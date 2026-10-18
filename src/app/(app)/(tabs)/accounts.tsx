import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { FAB, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { toAppError } from '@/api/errors';
import type { Account } from '@/api/schemas';
import { accountTypeIcons, ColoredIconBadge } from '@/components/finance/icons';
import { MoneyText } from '@/components/finance/money-text';
import { Card } from '@/components/ui/card';
import { AmbientBackground } from '@/components/ui/glass';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { TopBar } from '@/components/ui/top-bar';
import { useAccounts } from '@/hooks/use-finance-queries';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useRefreshOnFocus } from '@/hooks/use-refresh-on-focus';
import { accountTypeLabels, appErrorMessage } from '@/i18n/messages';
import { spacing, useAppTheme } from '@/theme';

const createAccount = () => router.push('/account/new');

export default function AccountsScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const query = useAccounts();
  const pull = usePullToRefresh(query.refetch);
  useRefreshOnFocus(query.refetch);
  const accounts = query.data;
  const total = useMemo(
    () => (accounts ?? []).reduce((sum, account) => sum + account.currentBalance, 0),
    [accounts],
  );

  let body;
  if (query.isPending) {
    body = <LoadingState />;
  } else if (!accounts) {
    body = (
      <ErrorState
        message={appErrorMessage(t, toAppError(query.error))}
        onRetry={() => void query.refetch()}
      />
    );
  } else if (accounts.length === 0) {
    body = (
      <EmptyState
        icon="bank-outline"
        title={t('accounts.emptyTitle')}
        message={t('accounts.emptyMessage')}
        actionText={t('accounts.new')}
        onAction={createAccount}
      />
    );
  } else {
    body = (
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={pull.refreshing} onRefresh={pull.onRefresh} />}
        ListHeaderComponent={
          <View style={styles.totals}>
            <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
              {t('accounts.total')}
            </Text>
            <MoneyText cents={total} variant="displaySmall" />
          </View>
        }
        renderItem={({ item }) => <AccountRow account={item} />}
      />
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.surface }]}>
      <AmbientBackground />
      <TopBar title={t('accounts.title')} />
      {body}
      <FAB
        icon="plus"
        label={t('accounts.new')}
        onPress={createAccount}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
      />
    </View>
  );
}

function AccountRow({ account }: { account: Account }) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const subtitle = [t(accountTypeLabels[account.type]), account.institution].filter(Boolean).join(' • ');
  return (
    <Card
      onPress={() => router.push({ pathname: '/account/[id]', params: { id: account.id } })}
      accessibilityLabel={account.name}
    >
      <View style={styles.row}>
        <ColoredIconBadge icon={accountTypeIcons[account.type]} color={account.color} />
        <View style={styles.rowTexts}>
          <Text variant="titleMedium" numberOfLines={1}>
            {account.name}
          </Text>
          <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>
            {subtitle}
          </Text>
        </View>
        <MoneyText
          cents={account.currentBalance}
          variant="titleMedium"
          color={account.currentBalance < 0 ? theme.colors.expense : theme.colors.onSurface}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingHorizontal: spacing.screen, paddingBottom: 96, gap: spacing.md },
  totals: { paddingTop: spacing.xs, paddingBottom: spacing.md, paddingHorizontal: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowTexts: { flex: 1, marginHorizontal: spacing.md },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.lg, borderRadius: 999 },
});
