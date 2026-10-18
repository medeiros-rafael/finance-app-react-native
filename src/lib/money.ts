export type Cents = number;

export const HIDDEN_MONEY = 'R$ ••••••';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const normalizeSpaces = (value: string) => value.replace(/[  ]/g, ' ');

export function formatMoney(cents: Cents): string {
  return normalizeSpaces(currency.format(cents / 100));
}

export function formatSignedMoney(cents: Cents): string {
  if (cents > 0) return `+ ${formatMoney(cents)}`;
  if (cents < 0) return `- ${formatMoney(-cents)}`;
  return formatMoney(0);
}

export function formatCompactMoney(cents: Cents): string {
  const sign = cents < 0 ? '-' : '';
  const reais = Math.abs(cents) / 100;
  const oneDecimal = (value: number) => (Math.round(value * 10) / 10).toFixed(1).replace('.', ',');
  if (reais >= 1_000_000) return `${sign}R$ ${oneDecimal(reais / 1_000_000)} mi`;
  if (reais >= 1_000) return `${sign}R$ ${oneDecimal(reais / 1_000)} mil`;
  return `${sign}R$ ${Math.round(reais)}`;
}

export function toCents(reais: number | string): Cents {
  return Math.round(Number(reais) * 100);
}

export function toReais(cents: Cents): number {
  return cents / 100;
}

export const MoneyInput = {
  MAX_DIGITS: 12,

  sanitize(raw: string): string {
    return raw.replace(/\D/g, '').replace(/^0+/, '').slice(0, MoneyInput.MAX_DIGITS);
  },

  toCents(digits: string): Cents {
    return digits ? Number.parseInt(digits, 10) : 0;
  },

  fromCents(cents: Cents): string {
    return MoneyInput.sanitize(String(Math.abs(Math.round(cents))));
  },
};

export function parseAmountInput(text: string): Cents | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const normalized = trimmed.includes(',') ? trimmed.replace(/\./g, '').replace(',', '.') : trimmed;
  const value = Number(normalized);
  return Number.isFinite(value) ? toCents(value) : null;
}
