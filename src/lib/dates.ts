export type LocalDate = string;
export type YearMonth = string;

const pad = (value: number) => String(value).padStart(2, '0');

export function toLocalDate(date: Date): LocalDate {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseLocalDate(value: LocalDate): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

export function today(now: Date = new Date()): LocalDate {
  return toLocalDate(now);
}

export function currentMonth(now: Date = new Date()): YearMonth {
  return today(now).slice(0, 7);
}

export function monthOf(date: LocalDate): YearMonth {
  return date.slice(0, 7);
}

export function addMonths(month: YearMonth, amount: number): YearMonth {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(year ?? 1970, (m ?? 1) - 1 + amount, 1);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function firstDayOf(month: YearMonth): LocalDate {
  return `${month}-01`;
}

export function lastDayOf(month: YearMonth): LocalDate {
  const [year, m] = month.split('-').map(Number);
  const last = new Date(year ?? 1970, m ?? 1, 0).getDate();
  return `${month}-${pad(last)}`;
}

const capitalize = (value: string, locale: string) =>
  value.charAt(0).toLocaleUpperCase(locale) + value.slice(1);

export function formatMonthYear(month: YearMonth, locale: string): string {
  const date = parseLocalDate(firstDayOf(month));
  const name = new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
  return `${capitalize(name, locale)} ${date.getFullYear()}`;
}

export function formatShortMonth(month: YearMonth, locale: string): string {
  const date = parseLocalDate(firstDayOf(month));
  const name = new Intl.DateTimeFormat(locale, { month: 'short' }).format(date).replace(/\.$/, '');
  return capitalize(name, locale);
}

export function formatMediumDate(date: LocalDate, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(
    parseLocalDate(date),
  );
}

export function formatDayHeader(date: LocalDate, locale: string): string {
  const value = parseLocalDate(date);
  const weekday = capitalize(new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(value), locale);
  const month = new Intl.DateTimeFormat(locale, { month: 'long' }).format(value);
  return locale.startsWith('en')
    ? `${weekday}, ${capitalize(month, locale)} ${value.getDate()}`
    : `${weekday}, ${value.getDate()} de ${month}`;
}
