import type { Transaction } from '@/api/schemas';

import type { LocalDate } from './dates';
import type { Cents } from './money';

export type DaySection = { title: LocalDate; total: Cents; data: Transaction[] };

export function signedAmount(tx: Pick<Transaction, 'amount' | 'type'>): Cents {
  return tx.type === 'EXPENSE' ? -tx.amount : tx.amount;
}

export function groupByDay(items: Transaction[]): DaySection[] {
  const sections = new Map<LocalDate, DaySection>();
  for (const tx of items) {
    const section = sections.get(tx.date) ?? { title: tx.date, total: 0, data: [] };
    section.data.push(tx);
    if (tx.status === 'PAID') section.total += signedAmount(tx);
    sections.set(tx.date, section);
  }
  return [...sections.values()];
}
