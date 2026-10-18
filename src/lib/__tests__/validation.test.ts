import type { z } from 'zod';

import {
  accountSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  transactionSchema,
  transferSchema,
  ValidationError,
} from '../validation';

function errorsOf(schema: z.ZodType, input: unknown): Record<string, string> {
  const result = schema.safeParse(input);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path.join('.');
    errors[field] ??= issue.message;
  }
  return errors;
}

describe('login', () => {
  it('exige e-mail válido e senha', () => {
    expect(errorsOf(loginSchema, { email: '', password: '' })).toEqual({
      email: ValidationError.REQUIRED,
      password: ValidationError.REQUIRED,
    });
    expect(errorsOf(loginSchema, { email: 'rafael', password: 'x' })).toEqual({
      email: ValidationError.INVALID_EMAIL,
    });
  });

  it('aceita e-mail com espaços nas pontas', () => {
    const result = loginSchema.parse({ email: '  rafael@email.com ', password: 'x' });
    expect(result.email).toBe('rafael@email.com');
  });
});

describe('cadastro', () => {
  const valid = {
    name: 'Rafael',
    email: 'rafael@email.com',
    password: 'Senha123',
    confirmPassword: 'Senha123',
  };

  it('aceita dados válidos', () => {
    expect(errorsOf(registerSchema, valid)).toEqual({});
  });

  it('senha curta, fraca e confirmação diferente', () => {
    expect(errorsOf(registerSchema, { ...valid, password: 'abc1', confirmPassword: 'abc1' })).toEqual({
      password: ValidationError.PASSWORD_TOO_SHORT,
    });
    expect(errorsOf(registerSchema, { ...valid, password: 'abcdefgh', confirmPassword: 'abcdefgh' })).toEqual(
      {
        password: ValidationError.PASSWORD_WEAK,
      },
    );
    expect(errorsOf(registerSchema, { ...valid, confirmPassword: 'outra' })).toEqual({
      confirmPassword: ValidationError.PASSWORDS_DO_NOT_MATCH,
    });
  });

  it('mostra todos os erros de uma vez (inclusive a confirmação)', () => {
    expect(
      errorsOf(registerSchema, { name: '', email: 'x', password: 'abcdefgh', confirmPassword: 'y' }),
    ).toEqual({
      name: ValidationError.REQUIRED,
      email: ValidationError.INVALID_EMAIL,
      password: ValidationError.PASSWORD_WEAK,
      confirmPassword: ValidationError.PASSWORDS_DO_NOT_MATCH,
    });
  });
});

describe('recuperar e trocar senha', () => {
  it('recuperação exige e-mail', () => {
    expect(errorsOf(forgotPasswordSchema, { email: '' })).toEqual({ email: ValidationError.REQUIRED });
  });

  it('redefinição exige código de 6 dígitos e nova senha confirmada', () => {
    expect(
      errorsOf(resetPasswordSchema, { code: '12a45', newPassword: 'Senha123', confirmPassword: 'x' }),
    ).toEqual({
      code: ValidationError.INVALID_CODE,
      confirmPassword: ValidationError.PASSWORDS_DO_NOT_MATCH,
    });
    expect(
      errorsOf(resetPasswordSchema, { code: '123456', newPassword: 'Senha123', confirmPassword: 'Senha123' }),
    ).toEqual({});
  });

  it('troca de senha valida atual, nova e confirmação', () => {
    expect(
      errorsOf(changePasswordSchema, { currentPassword: '', newPassword: 'abc', confirmPassword: 'abcd' }),
    ).toEqual({
      currentPassword: ValidationError.REQUIRED,
      newPassword: ValidationError.PASSWORD_TOO_SHORT,
      confirmPassword: ValidationError.PASSWORDS_DO_NOT_MATCH,
    });
  });
});

describe('conta', () => {
  const valid = {
    name: 'Nubank',
    type: 'CHECKING',
    initialBalance: '100000',
    negativeBalance: false,
    institution: '  ',
    color: '#8A05BE',
  };

  it('exige nome e limita a 60 caracteres', () => {
    expect(errorsOf(accountSchema, { ...valid, name: '  ' })).toEqual({ name: ValidationError.REQUIRED });
    expect(errorsOf(accountSchema, { ...valid, name: 'x'.repeat(61) })).toEqual({
      name: ValidationError.TOO_LONG,
    });
  });

  it('instituição em branco vira null', () => {
    expect(accountSchema.parse(valid).institution).toBeNull();
  });
});

describe('lançamento', () => {
  const valid = {
    type: 'EXPENSE',
    amount: '34218',
    description: 'Mercado',
    accountId: 'a1',
    categoryId: 'c2',
    date: '2026-09-27',
    paid: true,
    notes: '',
  };

  it('aceita dados válidos e normaliza observações', () => {
    const parsed = transactionSchema.parse({ ...valid, description: '  Mercado  ' });
    expect(parsed.description).toBe('Mercado');
    expect(parsed.notes).toBeNull();
  });

  it('valor zero, descrição vazia e categoria ausente', () => {
    expect(errorsOf(transactionSchema, { ...valid, amount: '', description: '', categoryId: '' })).toEqual({
      amount: ValidationError.AMOUNT_MUST_BE_POSITIVE,
      description: ValidationError.REQUIRED,
      categoryId: ValidationError.REQUIRED,
    });
  });

  it('descrição com mais de 120 caracteres', () => {
    expect(errorsOf(transactionSchema, { ...valid, description: 'x'.repeat(121) })).toEqual({
      description: ValidationError.TOO_LONG,
    });
  });
});

describe('transferência', () => {
  const valid = {
    amount: '50000',
    sourceAccountId: 'a1',
    destinationAccountId: 'a3',
    date: '2026-09-28',
    description: '',
  };

  it('aceita dados válidos', () => {
    expect(errorsOf(transferSchema, valid)).toEqual({});
  });

  it('não permite a mesma conta de origem e destino', () => {
    expect(errorsOf(transferSchema, { ...valid, destinationAccountId: 'a1' })).toEqual({
      destinationAccountId: ValidationError.SAME_ACCOUNT,
    });
  });

  it('valor zero e mesma conta aparecem juntos', () => {
    expect(errorsOf(transferSchema, { ...valid, amount: '', destinationAccountId: 'a1' })).toEqual({
      amount: ValidationError.AMOUNT_MUST_BE_POSITIVE,
      destinationAccountId: ValidationError.SAME_ACCOUNT,
    });
  });
});
