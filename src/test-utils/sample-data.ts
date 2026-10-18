import type { Account, Category, Transaction, TransactionType } from '@/api/schemas';

export const sampleUser = { id: 'u1', name: 'Rafael Medeiros', email: 'rafael@email.com' };

export const sampleAccounts: Account[] = [
  {
    id: 'a1',
    name: 'Nubank',
    type: 'CHECKING',
    initialBalance: 100000,
    currentBalance: 532010,
    institution: 'Nubank',
    color: '#8A05BE',
    active: true,
  },
  {
    id: 'a2',
    name: 'Inter',
    type: 'CHECKING',
    initialBalance: 50000,
    currentBalance: 313027,
    institution: 'Banco Inter',
    color: '#FF7A00',
    active: true,
  },
];

export const sampleCategories: Category[] = [
  { id: 'c1', name: 'Moradia', type: 'EXPENSE', icon: 'home', color: '#8E7CC3' },
  { id: 'c2', name: 'Alimentação', type: 'EXPENSE', icon: 'restaurant', color: '#E07A5F' },
  { id: 'c3', name: 'Transporte', type: 'EXPENSE', icon: 'directions_car', color: '#3D8BD9' },
  { id: 'c4', name: 'Saúde', type: 'EXPENSE', icon: 'favorite', color: '#E05780' },
  { id: 'c8', name: 'Assinaturas', type: 'EXPENSE', icon: 'subscriptions', color: '#6C5B7B' },
  { id: 'c11', name: 'Salário', type: 'INCOME', icon: 'payments', color: '#2E9E6A' },
  { id: 'c12', name: 'Freelance', type: 'INCOME', icon: 'work', color: '#4AA96C' },
];

function tx(
  id: string,
  description: string,
  amount: number,
  type: TransactionType,
  category: Category,
  account: Account,
  day: number,
): Transaction {
  return {
    id,
    accountId: account.id,
    accountName: account.name,
    categoryId: category.id,
    categoryName: category.name,
    categoryIcon: category.icon,
    categoryColor: category.color,
    amount,
    type,
    description,
    date: `2026-09-${String(day).padStart(2, '0')}`,
    notes: null,
    status: 'PAID',
  };
}

const [nubank, inter] = sampleAccounts as [Account, Account];
const c = (id: string) => sampleCategories.find((category) => category.id === id)!;

export const sampleTransactions: Transaction[] = [
  tx('t1', 'Mercado Pão de Açúcar', 34218, 'EXPENSE', c('c2'), nubank, 27),
  tx('t2', 'Uber', 2390, 'EXPENSE', c('c3'), nubank, 27),
  tx('t3', 'Netflix', 4490, 'EXPENSE', c('c8'), inter, 26),
  tx('t4', 'Projeto landing page', 180000, 'INCOME', c('c12'), inter, 25),
  tx('t5', 'Farmácia', 6735, 'EXPENSE', c('c4'), nubank, 24),
  tx('t6', 'Aluguel', 150000, 'EXPENSE', c('c1'), nubank, 5),
  tx('t7', 'Salário', 720000, 'INCOME', c('c11'), nubank, 5),
];
