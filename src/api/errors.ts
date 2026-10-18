import { isAxiosError } from 'axios';

import { apiErrorBodySchema } from './schemas';

export type AppError =
  | { kind: 'network' }
  | { kind: 'unauthorized' }
  | { kind: 'notFound' }
  | { kind: 'server' }
  | { kind: 'unknown' }
  | { kind: 'business'; code: string; message?: string }
  | { kind: 'validation'; fieldErrors: Record<string, string>; message?: string };

export class ApiError extends Error {
  constructor(readonly error: AppError) {
    super(error.kind);
    this.name = 'ApiError';
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof ApiError) return error.error;
  if (isAxiosError(error)) {
    if (!error.response) return { kind: 'network' };
    return fromHttpResponse(error.response.status, error.response.data);
  }
  return { kind: 'unknown' };
}

export function fromHttpResponse(status: number, data: unknown): AppError {
  const parsed = apiErrorBodySchema.safeParse(data);
  const body = parsed.success ? parsed.data : null;

  if (status === 401) {
    return body?.code === 'INVALID_CREDENTIALS'
      ? { kind: 'business', code: body.code, message: body.message }
      : { kind: 'unauthorized' };
  }
  if (status === 404) return { kind: 'notFound' };
  if (status === 400 && body && body.errors.length > 0) {
    return {
      kind: 'validation',
      fieldErrors: Object.fromEntries(body.errors.map((e) => [e.field, e.message])),
      message: body.message || undefined,
    };
  }
  if (status >= 500 && body?.code !== 'EXTERNAL_SERVICE_ERROR') return { kind: 'server' };
  if (body && body.code) return { kind: 'business', code: body.code, message: body.message || undefined };
  return { kind: 'server' };
}
