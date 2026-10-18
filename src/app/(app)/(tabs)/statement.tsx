import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, SectionList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Badge, Chip, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { toAppError } from '@/api/errors';
import type { TransactionFilter, TransactionType } from '@/api/schemas';
import { MoneyText } from '@/components/finance/money-text';
import { MonthSelector } from '@/components/finance/month-selector';
import { TransactionItem } from '@/components/finance/transaction-item';
import {
  activeFilterCount,
  EMPTY_FILTERS,
  FiltersSheet,
  type AdvancedFilters,
} from '@/components/transactions/filters-sheet';
import { AmbientBackground, GroupDivider, glassSurface } from '@/components/ui/glass';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { TextField } from '@/components/ui/text-field';
import { TopBar } from '@/components/ui/top-bar';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useAccounts, useCategories, useTransactions } from '@/hooks/use-finance-queries';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useRefreshOnFocus } from '@/hooks/use-refresh-on-focus';
import { appErrorMessage } from '@/i18n/messages';
import { currentMonth, firstDayOf, formatDayHeader, lastDayOf } from '@/lib/dates';
import type { Cents } from '@/lib/money';
import { groupByDay } from '@/lib/transactions';
import { radius, spacing, useAppTheme } from '@/theme';

const TYPE_OPTIONS: (TransactionType | null)[] = [null, 'INCOME', 'EXPENSE'];
const openTransaction = (id: string) => router.push({ pathname: '/transaction/[id]', params: { id } });

export default function StatementScreen() {
  const { t, i18n } = useTranslation();
  const theme = useAppTheme();
  const [month, setMonth] = useState(currentMonth);
  const [type, setType] = useState<TransactionType | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<AdvancedFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 400);

  const filter: TransactionFilter = useMemo(
    () => ({ from: firstDayOf(month), to: lastDayOf(month), type, search: debouncedSearch, ...filters }),
    [month, type, debouncedSearch, filters],
  );
  const query = useTransactions(filter);
  const accounts = useAccounts();
  const categories = useCategories();
  const pull = usePullToRefresh(query.refetch);
  useRefreshOnFocus(query.refetch);

  const pages = useMemo(() => query.data?.pages ?? [], [query.data]);
  const items = useMemo(() => pages.flatMap((page) => page.items), [pages]);
  const sections = useMemo(() => groupByDay(items), [items]);
  const totalIncome = pages[0]?.totalIncome ?? 0;
  const totalExpense = pages[0]?.totalExpense ?? 0;
  const filterCount = activeFilterCount(filters);

  const typeLabel = (option: TransactionType | null) =>
    option === 'INCOME'
      ? t('transactions.incomePlural')
      : option === 'EXPENSE'
        ? t('transactions.expensePlural')
        : t('transactions.all');

  let body;
  if (query.isPending) {
    body = <LoadingState />;
  } else if (query.isError && items.length === 0) {
    body = (
      <ErrorState
        message={appErrorMessage(t, toAppError(query.error))}
        onRetry={() => void query.refetch()}
      />
    );
  } else if (items.length === 0) {
    body = (
      <ScrollView
        contentContainerStyle={styles.flexGrow}
        refreshControl={<RefreshControl refreshing={pull.refreshing} onRefresh={pull.onRefresh} />}
      >
        <EmptyState
          icon="receipt-text-outline"
          title={t('transactions.emptyTitle')}
          message={t('transactions.emptyMessage')}
        />
      </ScrollView>
    );
  } else {
    body = (
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        refreshControl={<RefreshControl refreshing={pull.refreshing} onRefresh={pull.onRefresh} />}
        renderSectionHeader={({ section }) => (
          <View style={[styles.dayHeader, { backgroundColor: theme.colors.surface }]}>
            <Text variant="labelLarge" style={[styles.flex, { color: theme.colors.onSurfaceVariant }]}>
              {formatDayHeader(section.title, i18n.language)}
            </Text>
            <MoneyText
              cents={section.total}
              signed
              variant="labelMedium"
              color={theme.colors.onSurfaceVariant}
            />
          </View>
        )}
        renderItem={({ item, index, section }) => {
          const first = index === 0;
          const last = index === section.data.length - 1;
          return (
            <View
              style={[
                styles.groupRow,
                { backgroundColor: theme.glass.fill, borderColor: theme.glass.border },
                first && styles.groupFirst,
                last && styles.groupLast,
              ]}
            >
              {first ? null : <GroupDivider inset={72} />}
              <TransactionItem transaction={item} onPress={openTransaction} grouped />
            </View>
          );
        }}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
        }}
        ListFooterComponent={
          query.isFetchingNextPage ? <ActivityIndicator style={{ padding: spacing.lg }} /> : null
        }
      />
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.surface }]}>
      <AmbientBackground />
      <TopBar
        title={t('transactions.statementTitle')}
        actions={
          <View>
            <Appbar.Action
              style={[glassSurface(theme, 22), styles.filterButton]}
              size={20}
              icon="filter-variant"
              onPress={() => setFiltersOpen(true)}
              accessibilityLabel={t('transactions.filters')}
            />
            {filterCount > 0 ? (
              <Badge size={16} style={styles.badge}>
                {filterCount}
              </Badge>
            ) : null}
          </View>
        }
      />

      <TextField
        label={t('transactions.search')}
        leftIcon="magnify"
        value={search}
        onChangeText={setSearch}
        returnKeyType="search"
        containerStyle={styles.search}
      />
      <MonthSelector month={month} onMonthChange={setMonth} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chips}
      >
        {TYPE_OPTIONS.map((option) => {
          const selected = type === option;
          return (
            <Chip
              key={option ?? 'ALL'}
              selected={selected}
              showSelectedOverlay
              onPress={() => setType(option)}
              onClose={selected && option ? () => setType(null) : undefined}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? theme.colors.secondaryContainer : theme.glass.fill,
                  borderColor: theme.glass.border,
                },
              ]}
              textStyle={{ fontWeight: selected ? '800' : '600' }}
            >
              {typeLabel(option)}
            </Chip>
          );
        })}
      </ScrollView>
      <View style={[glassSurface(theme, radius.lg), styles.summary]}>
        <SummaryValue
          label={t('transactions.incomePlural')}
          cents={totalIncome}
          color={theme.colors.income}
        />
        <SummaryValue
          label={t('transactions.expensePlural')}
          cents={totalExpense}
          color={theme.colors.expense}
        />
        <SummaryValue
          label={t('transactions.balance')}
          cents={totalIncome - totalExpense}
          color={theme.colors.onSurface}
        />
      </View>

      {body}

      <FiltersSheet
        visible={filtersOpen}
        current={filters}
        accounts={accounts.data ?? []}
        categories={categories.data ?? []}
        onApply={setFilters}
        onDismiss={() => setFiltersOpen(false)}
      />
    </View>
  );
}

function SummaryValue({ label, cents, color }: { label: string; cents: Cents; color: string }) {
  const theme = useAppTheme();
  return (
    <View>
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
      <MoneyText cents={cents} variant="titleSmall" color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexGrow: { flexGrow: 1 },
  badge: { position: 'absolute', top: 4, right: 14 },
  search: { marginHorizontal: spacing.screen, marginBottom: spacing.xs },
  chipsScroll: { flexGrow: 0, flexShrink: 0 },
  chips: { paddingHorizontal: spacing.screen, gap: spacing.sm, alignItems: 'center' },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.screen,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  chip: { borderRadius: radius.full, borderWidth: 1 },
  filterButton: { width: 44, height: 44, marginRight: spacing.md },
  groupRow: {
    marginHorizontal: spacing.screen,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    overflow: 'hidden',
  },
  groupFirst: { borderTopWidth: 1, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  groupLast: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.sm,
  },
});
