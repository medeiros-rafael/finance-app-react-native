import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { toAppError } from '@/api/errors';
import type { Account } from '@/api/schemas';
import { accountTypeIcons, ColoredIconBadge } from '@/components/finance/icons';
import { MoneyText } from '@/components/finance/money-text';
import { TransactionItem } from '@/components/finance/transaction-item';
import { AmbientBackground } from '@/components/ui/glass';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SectionHeader } from '@/components/ui/section-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { TopBar } from '@/components/ui/top-bar';
import { useAccount, useArchiveAccount, useTransactions } from '@/hooks/use-finance-queries';
import { useRefreshOnFocus } from '@/hooks/use-refresh-on-focus';
import { accountTypeLabels, appErrorMessage } from '@/i18n/messages';
import { showSnackbar } from '@/stores/snackbar';
import { radius, spacing, useAppTheme, withAlpha } from '@/theme';

const openTransaction = (id: string) => router.push({ pathname: '/transaction/[id]', params: { id } });

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const theme = useAppTheme();
  const account = useAccount(id);
  const transactions = useTransactions({ accountId: id });
  const archive = useArchiveAccount();
  const [confirmArchive, setConfirmArchive] = useState(false);
  const { refetch: refetchAccount } = account;
  const { refetch: refetchTransactions } = transactions;
  useRefreshOnFocus(
    useCallback(
      () => Promise.all([refetchAccount(), refetchTransactions()]),
      [refetchAccount, refetchTransactions],
    ),
  );

  const onArchive = () => {
    setConfirmArchive(false);
    archive.mutate(id, {
      onSuccess: () => {
        showSnackbar(t('accounts.archived'));
        router.back();
      },
      onError: (error) => showSnackbar(appErrorMessage(t, toAppError(error))),
    });
  };

  const items = transactions.data?.pages[0]?.items ?? [];

  let body;
  if (account.isPending) {
    body = <LoadingState />;
  } else if (!account.data) {
    body = (
      <ErrorState
        message={appErrorMessage(t, toAppError(account.error))}
        onRetry={() => void account.refetch()}
      />
    );
  } else {
    body = (
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        ListHeaderComponent={
          <>
            <AccountHeader account={account.data} />
            <SectionHeader
              title={t('accounts.transactions')}
              style={{ paddingHorizontal: spacing.screen, paddingVertical: spacing.sm }}
            />
          </>
        }
        ListEmptyComponent={
          transactions.isPending ? null : (
            <EmptyState
              icon="receipt-text-outline"
              title={t('accounts.noTransactionsTitle')}
              message={t('accounts.noTransactionsMessage')}
            />
          )
        }
        renderItem={({ item }) => <TransactionItem transaction={item} onPress={openTransaction} showDate />}
      />
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.surface }]}>
      <AmbientBackground />
      <TopBar
        title={account.data?.name ?? ''}
        onBack={() => router.back()}
        actions={
          account.data ? (
            <>
              <Appbar.Action
                icon="pencil-outline"
                accessibilityLabel={t('accounts.editTitle')}
                onPress={() => router.push({ pathname: '/account/edit/[id]', params: { id } })}
              />
              <Appbar.Action
                icon="archive-outline"
                accessibilityLabel={t('accounts.archive')}
                disabled={archive.isPending}
                onPress={() => setConfirmArchive(true)}
              />
            </>
          ) : null
        }
      />
      {body}
      <ConfirmDialog
        visible={confirmArchive}
        title={t('accounts.archiveConfirmTitle')}
        message={t('accounts.archiveConfirmMessage')}
        confirmText={t('accounts.archive')}
        onConfirm={onArchive}
        onDismiss={() => setConfirmArchive(false)}
      />
    </View>
  );
}

function AccountHeader({ account }: { account: Account }) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const muted = { color: theme.colors.onSurfaceVariant };
  return (
    <View style={[styles.header, { backgroundColor: withAlpha(account.color, 0.12) }]}>
      <ColoredIconBadge icon={accountTypeIcons[account.type]} color={account.color} size={48} />
      <Text variant="labelLarge" style={[muted, { marginTop: spacing.md }]}>
        {[t(accountTypeLabels[account.type]), account.institution].filter(Boolean).join(' • ')}
      </Text>
      <Text variant="bodySmall" style={[muted, { marginTop: spacing.sm }]}>
        {t('accounts.currentBalance')}
      </Text>
      <MoneyText cents={account.currentBalance} variant="headlineLarge" />
      <Text variant="bodySmall" style={[muted, { marginTop: spacing.sm }]}>
        {t('accounts.initialBalance')}
      </Text>
      <MoneyText cents={account.initialBalance} variant="bodyMedium" />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { margin: spacing.screen, padding: spacing.xl, borderRadius: radius.xl },
});
