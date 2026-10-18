import { sampleTransactions } from '@/test-utils/sample-data';

import { groupByDay, signedAmount } from '../transactions';

describe('groupByDay', () => {
  it('agrupa por dia mantendo a ordem da API', () => {
    const sections = groupByDay(sampleTransactions);
    expect(sections.map((section) => section.title)).toEqual([
      '2026-09-27',
      '2026-09-26',
      '2026-09-25',
      '2026-09-24',
      '2026-09-05',
    ]);
    expect(sections[0]?.data.map((tx) => tx.id)).toEqual(['t1', 't2']);
  });

  it('total do dia soma receitas e subtrai despesas pagas', () => {
    const sections = groupByDay(sampleTransactions);
    expect(sections[0]?.total).toBe(-36608);
    expect(sections[4]?.total).toBe(570000);
  });

  it('ignora lançamentos pendentes no total do dia', () => {
    const pending = { ...sampleTransactions[0]!, id: 'p1', status: 'PENDING' as const };
    const [section] = groupByDay([pending]);
    expect(section?.total).toBe(0);
    expect(section?.data).toHaveLength(1);
  });
});

describe('signedAmount', () => {
  it('despesa negativa, receita positiva', () => {
    expect(signedAmount({ amount: 100, type: 'EXPENSE' })).toBe(-100);
    expect(signedAmount({ amount: 100, type: 'INCOME' })).toBe(100);
  });
});
