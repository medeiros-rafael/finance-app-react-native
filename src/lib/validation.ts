import { z } from 'zod';

import { MoneyInput } from './money';

export const ValidationError = {
  REQUIRED: 'REQUIRED',
  INVALID_EMAIL: 'INVALID_EMAIL',
  PASSWORD_TOO_SHORT: 'PASSWORD_TOO_SHORT',
  PASSWORD_WEAK: 'PASSWORD_WEAK',
  PASSWORDS_DO_NOT_MATCH: 'PASSWORDS_DO_NOT_MATCH',
  AMOUNT_MUST_BE_POSITIVE: 'AMOUNT_MUST_BE_POSITIVE',
  SAME_ACCOUNT: 'SAME_ACCOUNT',
  TOO_LONG: 'TOO_LONG',
  INVALID_CODE: 'INVALID_CODE',
} as const;
export type ValidationErrorCode = (typeof ValidationError)[keyof typeof ValidationError];

export const MIN_PASSWORD = 8;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const required = z.string().trim().min(1, ValidationError.REQUIRED);

const email = z
  .string()
  .trim()
  .min(1, ValidationError.REQUIRED)
  .regex(EMAIL_REGEX, ValidationError.INVALID_EMAIL);

const newPassword = z
  .string()
  .min(1, ValidationError.REQUIRED)
  .min(MIN_PASSWORD, ValidationError.PASSWORD_TOO_SHORT)
  .refine((value) => value.length < MIN_PASSWORD || (/\p{L}/u.test(value) && /\d/.test(value)), {
    message: ValidationError.PASSWORD_WEAK,
  });

const positiveAmount = z.string().refine((digits) => MoneyInput.toCents(digits) > 0, {
  message: ValidationError.AMOUNT_MUST_BE_POSITIVE,
});

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value ? value : null));

function passwordsMatch<T extends Record<string, unknown>>(password: keyof T, confirm: keyof T) {
  return {
    check: (data: T) => data[password] === data[confirm],
    options: {
      message: ValidationError.PASSWORDS_DO_NOT_MATCH,
      path: [confirm as string],
      when: () => true,
    },
  };
}

export const loginSchema = z.object({
  email,
  password: z.string().min(1, ValidationError.REQUIRED),
});
export type LoginForm = z.input<typeof loginSchema>;

const registerMatch = passwordsMatch<{ password: string; confirmPassword: string }>(
  'password',
  'confirmPassword',
);
export const registerSchema = z
  .object({
    name: required,
    email,
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine(registerMatch.check, registerMatch.options);
export type RegisterForm = z.input<typeof registerSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordForm = z.input<typeof forgotPasswordSchema>;

export const RESET_CODE_LENGTH = 6;

const resetMatch = passwordsMatch<{ newPassword: string; confirmPassword: string }>(
  'newPassword',
  'confirmPassword',
);
export const resetPasswordSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, ValidationError.REQUIRED)
      .regex(new RegExp(`^\\d{${RESET_CODE_LENGTH}}$`), ValidationError.INVALID_CODE),
    newPassword,
    confirmPassword: z.string(),
  })
  .refine(resetMatch.check, resetMatch.options);
export type ResetPasswordForm = z.input<typeof resetPasswordSchema>;

const changeMatch = passwordsMatch<{ newPassword: string; confirmPassword: string }>(
  'newPassword',
  'confirmPassword',
);
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, ValidationError.REQUIRED),
    newPassword,
    confirmPassword: z.string(),
  })
  .refine(changeMatch.check, changeMatch.options);
export type ChangePasswordForm = z.input<typeof changePasswordSchema>;

export const profileSchema = z.object({ name: required });
export type ProfileForm = z.input<typeof profileSchema>;

export const accountSchema = z.object({
  name: required.max(60, ValidationError.TOO_LONG),
  type: z.enum(['CHECKING', 'SAVINGS', 'CASH', 'DIGITAL_WALLET', 'INVESTMENT', 'OTHER']),
  initialBalance: z.string(),
  negativeBalance: z.boolean(),
  institution: optionalText,
  color: z.string(),
});
export type AccountForm = z.input<typeof accountSchema>;
export type AccountFormOutput = z.output<typeof accountSchema>;

export const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: positiveAmount,
  description: required.max(120, ValidationError.TOO_LONG),
  accountId: required,
  categoryId: required,
  date: z.string(),
  paid: z.boolean(),
  notes: optionalText,
});
export type TransactionForm = z.input<typeof transactionSchema>;
export type TransactionFormOutput = z.output<typeof transactionSchema>;

export const transferSchema = z
  .object({
    amount: positiveAmount,
    sourceAccountId: required,
    destinationAccountId: required,
    date: z.string(),
    description: optionalText,
  })
  .refine((data) => !data.sourceAccountId || data.sourceAccountId !== data.destinationAccountId, {
    message: ValidationError.SAME_ACCOUNT,
    path: ['destinationAccountId'],
    when: () => true,
  });
export type TransferForm = z.input<typeof transferSchema>;
export type TransferFormOutput = z.output<typeof transferSchema>;
