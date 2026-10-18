import { z } from 'zod';

import { toCents } from '@/lib/money';

const money = z.union([z.number(), z.string()]).transform((value) => toCents(value));

export function normalizeColor(value: string | null | undefined): string {
  const hex = (value ?? '').replace('#', '').trim();
  return /^[0-9a-fA-F]{6}$/.test(hex) ? `#${hex.toUpperCase()}` : '#7B5EA7';
}
const color = z.string().nullish().transform(normalizeColor);

const localDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}/)
  .transform((value) => value.slice(0, 10));
const yearMonth = z
  .string()
  .regex(/^\d{4}-\d{2}/)
  .transform((value) => value.slice(0, 7));

export const ACCOUNT_TYPES = [
  'CHECKING',
  'SAVINGS',
  'CASH',
  'DIGITAL_WALLET',
  'INVESTMENT',
  'OTHER',
] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const CATEGORY_TYPES = ['INCOME', 'EXPENSE', 'BOTH'] as const;
export type CategoryType = (typeof CATEGORY_TYPES)[number];

export const TRANSACTION_TYPES = ['INCOME', 'EXPENSE', 'TRANSFER'] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_STATUSES = ['PAID', 'PENDING'] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});
export type User = z.infer<typeof userSchema>;

export const authResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  tokenType: z.string().default('Bearer'),
  user: userSchema,
});
export type AuthResponse = z.infer<typeof authResponseSchema>;

export const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(ACCOUNT_TYPES).catch('OTHER'),
  initialBalance: money,
  currentBalance: money,
  institution: z
    .string()
    .nullish()
    .transform((value) => value ?? null),
  color,
  active: z.boolean().default(true),
});
export type Account = z.infer<typeof accountSchema>;

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(CATEGORY_TYPES).catch('BOTH'),
  icon: z.string(),
  color,
});
export type Category = z.infer<typeof categorySchema>;

export const transactionSchema = z
  .object({
    id: z.string(),
    accountId: z.string(),
    accountName: z.string(),
    categoryId: z.string(),
    categoryName: z.string(),
    categoryIcon: z.string(),
    categoryColor: color,
    amount: money,
    type: z.enum(TRANSACTION_TYPES).catch('EXPENSE'),
    description: z.string(),
    transactionDate: localDate,
    notes: z.string().nullish(),
    status: z.enum(TRANSACTION_STATUSES).catch('PAID'),
  })
  .transform(({ transactionDate, notes, ...rest }) => ({
    ...rest,
    date: transactionDate,
    notes: notes ?? null,
  }));
export type Transaction = z.infer<typeof transactionSchema>;

export const transactionPageSchema = z
  .object({
    page: z.object({
      items: z.array(transactionSchema),
      page: z.number(),
      pageSize: z.number(),
      totalCount: z.number(),
      totalPages: z.number().default(0),
      hasNextPage: z.boolean().default(false),
    }),
    summary: z.object({ totalIncome: money, totalExpense: money }),
  })
  .transform(({ page, summary }) => ({
    items: page.items,
    page: page.page,
    totalCount: page.totalCount,
    hasNextPage: page.hasNextPage,
    totalIncome: summary.totalIncome,
    totalExpense: summary.totalExpense,
  }));
export type TransactionPage = z.infer<typeof transactionPageSchema>;

export const transferSchema = z.object({
  id: z.string(),
  sourceAccountId: z.string(),
  sourceAccountName: z.string(),
  destinationAccountId: z.string(),
  destinationAccountName: z.string(),
  amount: money,
  date: localDate,
  description: z.string().nullish(),
});
export type Transfer = z.infer<typeof transferSchema>;

export const categoryExpenseSchema = z.object({
  categoryId: z.string(),
  name: z.string(),
  icon: z.string(),
  color,
  amount: money,
  percentage: z.number(),
});
export type CategoryExpense = z.infer<typeof categoryExpenseSchema>;

export const monthlyEvolutionSchema = z.object({
  month: yearMonth,
  income: money,
  expense: money,
});
export type MonthlyEvolution = z.infer<typeof monthlyEvolutionSchema>;

export const dashboardSchema = z.object({
  month: yearMonth,
  totalBalance: money,
  availableBalance: money,
  totalIncome: money,
  totalExpense: money,
  monthBalance: money,
  creditCardDebt: money,
  accounts: z.array(accountSchema),
  upcomingExpenses: z.array(transactionSchema),
  categoryExpenses: z.array(categoryExpenseSchema),
  monthlyEvolution: z.array(monthlyEvolutionSchema),
  recentTransactions: z.array(transactionSchema),
});
export type Dashboard = z.infer<typeof dashboardSchema>;

export const apiErrorBodySchema = z.object({
  status: z.number().default(0),
  code: z.string().default(''),
  message: z.string().default(''),
  errors: z.array(z.object({ field: z.string(), message: z.string() })).default([]),
  path: z.string().default(''),
});
export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;

export type AccountDraft = {
  name: string;
  type: AccountType;
  initialBalance: number;
  institution: string | null;
  color: string;
};

export type TransactionDraft = {
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  notes: string | null;
  status: TransactionStatus;
};

export type TransferDraft = {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  date: string;
  description: string | null;
};

export type TransactionFilter = {
  from?: string;
  to?: string;
  accountId?: string | null;
  categoryId?: string | null;
  type?: TransactionType | null;
  search?: string;
  minAmount?: number | null;
  maxAmount?: number | null;
};
