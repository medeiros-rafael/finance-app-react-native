import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { accountsApi, categoriesApi, dashboardApi, transactionsApi, transfersApi } from '@/api/finance';
import type {
  AccountDraft,
  CategoryType,
  TransactionDraft,
  TransactionFilter,
  TransactionType,
  TransferDraft,
} from '@/api/schemas';

export const queryKeys = {
  dashboard: (month: string) => ['dashboard', month] as const,
  accounts: ['accounts'] as const,
  account: (id: string) => ['accounts', id] as const,
  categories: (type?: CategoryType | null) => ['categories', type ?? 'ALL'] as const,
  transactions: (filter: TransactionFilter) => ['transactions', filter] as const,
  transaction: (id: string) => ['transaction', id] as const,
};

export function useDashboard(month: string) {
  return useQuery({ queryKey: queryKeys.dashboard(month), queryFn: () => dashboardApi.get(month) });
}

export function useAccounts() {
  return useQuery({ queryKey: queryKeys.accounts, queryFn: () => accountsApi.list() });
}

export function useAccount(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.account(id ?? ''),
    queryFn: () => accountsApi.get(id!),
    enabled: !!id,
  });
}

export function useCategories(type?: TransactionType | null) {
  const categoryType: CategoryType | null = type === 'INCOME' || type === 'EXPENSE' ? type : null;
  return useQuery({
    queryKey: queryKeys.categories(categoryType),
    queryFn: () => categoriesApi.list(categoryType),
    staleTime: 5 * 60_000,
  });
}

export function useTransactions(filter: TransactionFilter) {
  return useInfiniteQuery({
    queryKey: queryKeys.transactions(filter),
    queryFn: ({ pageParam }) => transactionsApi.list(filter, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNextPage ? last.page + 1 : undefined),
    placeholderData: keepPreviousData,
  });
}

export function useTransaction(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.transaction(id ?? ''),
    queryFn: () => transactionsApi.get(id!),
    enabled: !!id,
  });
}

function useInvalidateFinance() {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: ['dashboard'] }),
      client.invalidateQueries({ queryKey: ['accounts'] }),
      client.invalidateQueries({ queryKey: ['transactions'] }),
      client.invalidateQueries({ queryKey: ['transaction'] }),
    ]);
}

export function useSaveAccount(id?: string) {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: (draft: AccountDraft) => (id ? accountsApi.update(id, draft) : accountsApi.create(draft)),
    onSuccess: invalidate,
  });
}

export function useArchiveAccount() {
  const invalidate = useInvalidateFinance();
  return useMutation({ mutationFn: (id: string) => accountsApi.archive(id), onSuccess: invalidate });
}

export function useSaveTransaction(id?: string) {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: (draft: TransactionDraft) =>
      id ? transactionsApi.update(id, draft) : transactionsApi.create(draft),
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateFinance();
  return useMutation({ mutationFn: (id: string) => transactionsApi.remove(id), onSuccess: invalidate });
}

export function useCreateTransfer() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: (draft: TransferDraft) => transfersApi.create(draft),
    onSuccess: invalidate,
  });
}
