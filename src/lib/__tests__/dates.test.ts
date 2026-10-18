import {
  addMonths,
  currentMonth,
  firstDayOf,
  formatDayHeader,
  formatMediumDate,
  formatMonthYear,
  formatShortMonth,
  lastDayOf,
  parseLocalDate,
  toLocalDate,
} from '../dates';

describe('datas sem fuso', () => {
  it('converte ida e volta sem mudar o dia', () => {
    expect(toLocalDate(parseLocalDate('2026-09-28'))).toBe('2026-09-28');
    expect(toLocalDate(parseLocalDate('2026-01-01'))).toBe('2026-01-01');
  });

  it('mês atual a partir de uma data', () => {
    expect(currentMonth(new Date(2026, 8, 28, 23, 59))).toBe('2026-09');
  });

  it('soma e subtrai meses atravessando o ano', () => {
    expect(addMonths('2026-09', 1)).toBe('2026-10');
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(addMonths('2026-09', -5)).toBe('2026-04');
  });

  it('primeiro e último dia do mês (inclui fevereiro bissexto)', () => {
    expect(firstDayOf('2026-09')).toBe('2026-09-01');
    expect(lastDayOf('2026-09')).toBe('2026-09-30');
    expect(lastDayOf('2028-02')).toBe('2028-02-29');
    expect(lastDayOf('2026-02')).toBe('2026-02-28');
  });
});

describe('formatação por idioma', () => {
  it('mês e ano com inicial maiúscula', () => {
    expect(formatMonthYear('2026-09', 'pt-BR')).toBe('Setembro 2026');
    expect(formatMonthYear('2026-09', 'en')).toBe('September 2026');
    expect(formatMonthYear('2026-09', 'es')).toBe('Septiembre 2026');
  });

  it('mês curto sem ponto para gráficos', () => {
    expect(formatShortMonth('2026-09', 'pt-BR')).toBe('Set');
    expect(formatShortMonth('2026-09', 'en')).toBe('Sep');
  });

  it('data média', () => {
    expect(formatMediumDate('2026-09-28', 'pt-BR')).toBe('28 de set. de 2026');
    expect(formatMediumDate('2026-09-28', 'en')).toBe('Sep 28, 2026');
  });

  it('cabeçalho de dia do extrato', () => {
    expect(formatDayHeader('2026-09-28', 'pt-BR')).toBe('Segunda-feira, 28 de setembro');
    expect(formatDayHeader('2026-09-28', 'en')).toBe('Monday, September 28');
    expect(formatDayHeader('2026-09-28', 'es')).toBe('Lunes, 28 de septiembre');
  });
});
