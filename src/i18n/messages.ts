import type { TFunction } from 'i18next';

import type { AppError } from '@/api/errors';
import type { AccountType } from '@/api/schemas';
import { ValidationError, type ValidationErrorCode } from '@/lib/validation';

const businessMessages = {
  INVALID_CREDENTIALS: 'ui.errorInvalidCredentials',
  EMAIL_IN_USE: 'ui.errorEmailInUse',
  INVALID_RESET_CODE: 'ui.errorInvalidResetCode',
  INVALID_CURRENT_PASSWORD: 'ui.errorInvalidCurrentPassword',
  TOO_MANY_REQUESTS: 'ui.errorRateLimited',
  SESSION_EXPIRED: 'ui.errorSession',
  INSUFFICIENT_BALANCE: 'ui.errorInsufficientBalance',
  SAME_ACCOUNT: 'ui.errorSameAccount',
  INACTIVE_ACCOUNT: 'ui.errorInactiveAccount',
  ACCOUNT_NAME_IN_USE: 'ui.errorAccountNameInUse',
  CATEGORY_TYPE_MISMATCH: 'ui.errorCategoryMismatch',
  CONCURRENCY_CONFLICT: 'ui.errorConcurrency',
  EXTERNAL_SERVICE_ERROR: 'ui.errorServer',
} as const;

export function appErrorMessage(t: TFunction, error: AppError): string {
  switch (error.kind) {
    case 'network':
      return t('ui.errorNetwork');
    case 'unauthorized':
      return t('ui.errorSession');
    case 'notFound':
      return t('ui.errorNotFound');
    case 'server':
      return t('ui.errorServer');
    case 'unknown':
      return t('ui.errorUnknown');
    case 'validation':
      return Object.values(error.fieldErrors)[0] ?? error.message ?? t('ui.errorInvalidInput');
    case 'business': {
      const key = businessMessages[error.code as keyof typeof businessMessages];
      return key ? t(key) : (error.message ?? t('ui.errorUnknown'));
    }
  }
}

const validationMessages = {
  [ValidationError.REQUIRED]: 'ui.validationRequired',
  [ValidationError.INVALID_EMAIL]: 'ui.validationEmail',
  [ValidationError.PASSWORD_TOO_SHORT]: 'ui.validationPasswordShort',
  [ValidationError.PASSWORD_WEAK]: 'ui.validationPasswordWeak',
  [ValidationError.PASSWORDS_DO_NOT_MATCH]: 'ui.validationPasswordsMatch',
  [ValidationError.AMOUNT_MUST_BE_POSITIVE]: 'ui.validationAmount',
  [ValidationError.SAME_ACCOUNT]: 'ui.validationSameAccount',
  [ValidationError.TOO_LONG]: 'ui.validationTooLong',
  [ValidationError.INVALID_CODE]: 'ui.validationCode',
} as const;

export function validationMessage(t: TFunction, message: string | undefined): string | undefined {
  if (!message) return undefined;
  const key = validationMessages[message as ValidationErrorCode];
  return key ? t(key) : message;
}

export const accountTypeLabels = {
  CHECKING: 'ui.accountChecking',
  SAVINGS: 'ui.accountSavings',
  CASH: 'ui.accountCash',
  DIGITAL_WALLET: 'ui.accountDigitalWallet',
  INVESTMENT: 'ui.accountInvestment',
  OTHER: 'ui.accountOther',
} as const satisfies Record<AccountType, string>;
