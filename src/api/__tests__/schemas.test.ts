import {
  accountSchema,
  authResponseSchema,
  dashboardSchema,
  normalizeColor,
  transactionPageSchema,
  transactionSchema,
} from '../schemas';

const transactionJson = {
  id: 't1',
  accountId: 'a1',
  accountName: 'Nubank',
  categoryId: 'c2',
  categoryName: 'Alimentação',
  categoryIcon: 'restaurant',
  categoryColor: '#e07a5f',
  amount: 342.18,
  type: 'EXPENSE',
  description: 'Mercado',
  transactionDate: '2026-09-27',
  notes: null,
  status: 'PAID',
};

describe('schemas da API (equivalente aos mappers do Kotlin)', () => {
  it('dinheiro vira centavos exatos', () => {
    expect(transactionSchema.parse({ ...transactionJson, amount: 0.1 }).amount).toBe(10);
    expect(transactionSchema.parse(transactionJson).amount).toBe(34218);
  });

  it('lançamento: renomeia data, normaliza cor e observações', () => {
    const tx = transactionSchema.parse({ ...transactionJson, notes: undefined });
    expect(tx.date).toBe('2026-09-27');
    expect(tx.categoryColor).toBe('#E07A5F');
    expect(tx.notes).toBeNull();
    expect(tx).not.toHaveProperty('transactionDate');
  });

  it('enum desconhecido usa valor padrão em vez de quebrar', () => {
    const account = accountSchema.parse({
      id: 'a1',
      name: 'Conta',
      type: 'CRYPTO',
      initialBalance: 0,
      currentBalance: '10.5',
      color: 'invalida',
      active: true,
    });
    expect(account.type).toBe('OTHER');
    expect(account.currentBalance).toBe(1050);
    expect(account.color).toBe('#7B5EA7');
    expect(account.institution).toBeNull();
    expect(transactionSchema.parse({ ...transactionJson, status: 'NOVO' }).status).toBe('PAID');
  });

  it('página do extrato achata paginação e resumo', () => {
    const page = transactionPageSchema.parse({
      page: {
        items: [transactionJson],
        page: 1,
        pageSize: 30,
        totalCount: 1,
        totalPages: 1,
        hasNextPage: false,
      },
      summary: { totalIncome: 9000, totalExpense: 1978.33 },
    });
    expect(page).toMatchObject({
      page: 1,
      totalCount: 1,
      hasNextPage: false,
      totalIncome: 900000,
      totalExpense: 197833,
    });
    expect(page.items).toHaveLength(1);
  });

  it('dashboard com meses em "AAAA-MM"', () => {
    const dashboard = dashboardSchema.parse({
      month: '2026-09',
      totalBalance: 12437.87,
      availableBalance: 8437.87,
      totalIncome: 9000,
      totalExpense: 1978.33,
      monthBalance: 7021.67,
      creditCardDebt: 0,
      accounts: [],
      upcomingExpenses: [],
      categoryExpenses: [
        { categoryId: 'c1', name: 'Moradia', icon: 'home', color: '#8E7CC3', amount: 1500, percentage: 75.8 },
      ],
      monthlyEvolution: [{ month: '2026-09-01', income: 7000, expense: 3200 }],
      recentTransactions: [transactionJson],
    });
    expect(dashboard.totalBalance).toBe(1243787);
    expect(dashboard.monthlyEvolution[0]?.month).toBe('2026-09');
    expect(dashboard.categoryExpenses[0]?.amount).toBe(150000);
  });

  it('resposta de login/cadastro (sessão)', () => {
    const user = { id: 'u1', name: 'Rafael', email: 'rafael@email.com' };
    const auth = authResponseSchema.parse({ accessToken: 'a', refreshToken: 'r', expiresIn: 900, user });
    expect(auth.tokenType).toBe('Bearer');
    expect(auth.user.email).toBe('rafael@email.com');
  });

  it('normalizeColor', () => {
    expect(normalizeColor('8a05be')).toBe('#8A05BE');
    expect(normalizeColor(null)).toBe('#7B5EA7');
  });
});
