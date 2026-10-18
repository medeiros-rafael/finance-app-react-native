import {
  formatCompactMoney,
  formatMoney,
  formatSignedMoney,
  MoneyInput,
  parseAmountInput,
  toCents,
  toReais,
} from '../money';

describe('formatMoney', () => {
  it('formata em real com separador de milhar', () => {
    expect(formatMoney(125050)).toBe('R$ 1.250,50');
  });

  it('formata valores negativos', () => {
    expect(formatMoney(-1000).replace('- ', '-')).toBe('-R$ 10,00');
  });

  it('usa espaço comum depois de "R$" (sem espaço não separável)', () => {
    expect(formatMoney(100)).not.toMatch(/[  ]/);
  });
});

describe('formatSignedMoney', () => {
  it('adiciona sinal explícito', () => {
    expect(formatSignedMoney(500)).toBe('+ R$ 5,00');
    expect(formatSignedMoney(-500)).toBe('- R$ 5,00');
    expect(formatSignedMoney(0)).toBe('R$ 0,00');
  });
});

describe('formatCompactMoney', () => {
  it('usa forma curta para eixos de gráfico', () => {
    expect(formatCompactMoney(150_000)).toBe('R$ 1,5 mil');
    expect(formatCompactMoney(200_000_000)).toBe('R$ 2,0 mi');
    expect(formatCompactMoney(95_000)).toBe('R$ 950');
    expect(formatCompactMoney(-150_000)).toBe('-R$ 1,5 mil');
  });
});

describe('conversão reais <-> centavos', () => {
  it('converte sem erro de ponto flutuante', () => {
    expect(toCents(0.1)).toBe(10);
    expect(toCents(1250.5)).toBe(125050);
    expect(toCents('19.99')).toBe(1999);
    expect(toCents(0.1 + 0.2)).toBe(30);
  });

  it('volta para reais ao enviar à API', () => {
    expect(toReais(125050)).toBe(1250.5);
    expect(toReais(-1999)).toBe(-19.99);
  });
});

describe('MoneyInput', () => {
  it('preenche da direita para a esquerda', () => {
    expect(MoneyInput.toCents('1')).toBe(1);
    expect(MoneyInput.toCents('12')).toBe(12);
    expect(MoneyInput.toCents('125')).toBe(125);
    expect(MoneyInput.toCents('')).toBe(0);
  });

  it('remove tudo que não é dígito e zeros à esquerda', () => {
    expect(MoneyInput.sanitize('R$ 0,012')).toBe('12');
    expect(MoneyInput.sanitize('abc')).toBe('');
  });

  it('limita a 12 dígitos', () => {
    expect(MoneyInput.sanitize('1234567890123456')).toBe('123456789012');
  });

  it('converte um valor existente em dígitos (edição)', () => {
    expect(MoneyInput.fromCents(125050)).toBe('125050');
    expect(MoneyInput.fromCents(-1500)).toBe('1500');
    expect(MoneyInput.fromCents(0)).toBe('');
  });
});

describe('parseAmountInput (filtros)', () => {
  it('aceita formato brasileiro e com ponto', () => {
    expect(parseAmountInput('1.250,50')).toBe(125050);
    expect(parseAmountInput('1250.50')).toBe(125050);
    expect(parseAmountInput('50')).toBe(5000);
  });

  it('devolve null para vazio ou inválido', () => {
    expect(parseAmountInput('')).toBeNull();
    expect(parseAmountInput('   ')).toBeNull();
    expect(parseAmountInput('1,2,3')).toBeNull();
  });
});
