import { z } from 'zod';

import { toReais } from '@/lib/money';

import { apiClient, request, send } from './client';
import {
  accountSchema,
  categorySchema,
  dashboardSchema,
  transactionPageSchema,
  transactionSchema,
  transferSchema,
  type AccountDraft,
  type CategoryType,
  type TransactionDraft,
  type TransactionFilter,
  type TransferDraft,
} from './schemas';

export const PAGE_SIZE = 30;

const accountBody = (draft: AccountDraft) => ({ ...draft, initialBalance: toReais(draft.initialBalance) });

const transactionBody = ({ date, amount, ...draft }: TransactionDraft) => ({
  ...draft,
  amount: toReais(amount),
  transactionDate: date,
});

function cleanParams(params: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

export const accountsApi = {
  list: (includeArchived = false) =>
    request(apiClient.get('accounts', { params: { includeArchived } }), z.array(accountSchema)),
  get: (id: string) => request(apiClient.get(`accounts/${id}`), accountSchema),
  create: (draft: AccountDraft) => request(apiClient.post('accounts', accountBody(draft)), accountSchema),
  update: (id: string, draft: AccountDraft) =>
    request(apiClient.put(`accounts/${id}`, accountBody(draft)), accountSchema),
  archive: (id: string) => send(apiClient.delete(`accounts/${id}`)),
};

export const categoriesApi = {
  list: (type?: CategoryType | null) =>
    request(apiClient.get('categories', { params: cleanParams({ type }) }), z.array(categorySchema)),
};

export const transactionsApi = {
  list: (filter: TransactionFilter, page: number, pageSize = PAGE_SIZE) =>
    request(
      apiClient.get('transactions', {
        params: cleanParams({
          from: filter.from,
          to: filter.to,
          accountId: filter.accountId,
          categoryId: filter.categoryId,
          type: filter.type,
          search: filter.search?.trim(),
          minAmount: filter.minAmount != null ? toReais(filter.minAmount) : null,
          maxAmount: filter.maxAmount != null ? toReais(filter.maxAmount) : null,
          page,
          pageSize,
        }),
      }),
      transactionPageSchema,
    ),
  get: (id: string) => request(apiClient.get(`transactions/${id}`), transactionSchema),
  create: (draft: TransactionDraft) =>
    request(apiClient.post('transactions', transactionBody(draft)), transactionSchema),
  update: (id: string, draft: TransactionDraft) =>
    request(apiClient.put(`transactions/${id}`, transactionBody(draft)), transactionSchema),
  remove: (id: string) => send(apiClient.delete(`transactions/${id}`)),
};

export const transfersApi = {
  create: (draft: TransferDraft) =>
    request(apiClient.post('transfers', { ...draft, amount: toReais(draft.amount) }), transferSchema),
};

export const dashboardApi = {
  get: (month: string) => request(apiClient.get('dashboard', { params: { month } }), dashboardSchema),
};
