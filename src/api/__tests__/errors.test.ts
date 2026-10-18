import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';

import { ApiError, fromHttpResponse, toAppError } from '../errors';

function httpError(status: number, data: unknown) {
  const config = { headers: new AxiosHeaders() };
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse;
  return new AxiosError('falha', 'ERR_BAD_RESPONSE', config, null, response);
}

describe('toAppError (mesmas regras do ApiCall.kt)', () => {
  it('400 com erros de campo vira validation', () => {
    const error = toAppError(
      httpError(400, {
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        errors: [{ field: 'amount', message: 'Valor deve ser maior que zero' }],
        path: '/api/v1/transactions',
      }),
    );
    expect(error).toEqual({
      kind: 'validation',
      fieldErrors: { amount: 'Valor deve ser maior que zero' },
      message: 'Dados inválidos',
    });
  });

  it('422 de regra de negócio mantém o código da API', () => {
    const error = toAppError(
      httpError(422, {
        status: 422,
        code: 'INSUFFICIENT_BALANCE',
        message: 'Saldo insuficiente',
        errors: [],
      }),
    );
    expect(error).toEqual({ kind: 'business', code: 'INSUFFICIENT_BALANCE', message: 'Saldo insuficiente' });
  });

  it('401 de credenciais inválidas é regra de negócio; outro 401 é sessão expirada', () => {
    expect(
      toAppError(httpError(401, { code: 'INVALID_CREDENTIALS', message: 'E-mail ou senha inválidos.' })),
    ).toEqual({ kind: 'business', code: 'INVALID_CREDENTIALS', message: 'E-mail ou senha inválidos.' });
    expect(toAppError(httpError(401, { code: 'UNAUTHORIZED', message: 'Autenticação necessária.' }))).toEqual(
      {
        kind: 'unauthorized',
      },
    );
  });

  it('404, 500 e falha de conexão', () => {
    expect(toAppError(httpError(404, null))).toEqual({ kind: 'notFound' });
    expect(toAppError(httpError(500, { code: 'INTERNAL_ERROR', message: 'x' }))).toEqual({ kind: 'server' });
    expect(toAppError(new AxiosError('Network Error', 'ERR_NETWORK'))).toEqual({ kind: 'network' });
  });

  it('erro de serviço externo com 5xx mantém o código', () => {
    expect(fromHttpResponse(502, { code: 'EXTERNAL_SERVICE_ERROR', message: 'Serviço fora' })).toEqual({
      kind: 'business',
      code: 'EXTERNAL_SERVICE_ERROR',
      message: 'Serviço fora',
    });
  });

  it('corpo inesperado não quebra a conversão', () => {
    expect(fromHttpResponse(409, '<html>erro</html>')).toEqual({ kind: 'server' });
  });

  it('ApiError e erros desconhecidos', () => {
    expect(toAppError(new ApiError({ kind: 'network' }))).toEqual({ kind: 'network' });
    expect(toAppError(new Error('boom'))).toEqual({ kind: 'unknown' });
  });
});
