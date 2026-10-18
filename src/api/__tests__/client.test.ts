import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { z } from 'zod';

import { useSession } from '@/stores/session';
import { sampleUser } from '@/test-utils/sample-data';

import { apiClient, publicClient, request } from '../client';
import { ApiError } from '../errors';

function fakeAdapter(handler: (config: InternalAxiosRequestConfig) => { status: number; data?: unknown }) {
  const adapter: AxiosAdapter = async (config) => {
    const { status, data } = handler(config);
    const response: AxiosResponse = { status, data, statusText: '', headers: {}, config };
    if (status >= 400) throw new AxiosError('falha', 'ERR_BAD_RESPONSE', config, null, response);
    return response;
  };
  return adapter;
}

const authJson = (accessToken: string) => ({
  accessToken,
  refreshToken: 'refresh-2',
  expiresIn: 3600,
  tokenType: 'Bearer',
  user: sampleUser,
});

beforeEach(() => {
  useSession.setState({
    status: 'signedIn',
    user: sampleUser,
    tokens: { accessToken: 'expired', refreshToken: 'refresh-1', expiresAt: 0 },
  });
});

describe('cliente autenticado', () => {
  it('envia o token e, em 401, renova a sessão uma única vez e repete as requisições', async () => {
    const refreshCalls: unknown[] = [];
    publicClient.defaults.adapter = fakeAdapter((config) => {
      refreshCalls.push(JSON.parse(String(config.data)));
      return { status: 200, data: authJson('fresh') };
    });
    apiClient.defaults.adapter = fakeAdapter((config) =>
      config.headers.get('Authorization') === 'Bearer fresh'
        ? { status: 200, data: { ok: true, url: config.url } }
        : { status: 401, data: { code: 'UNAUTHORIZED' } },
    );

    const schema = z.object({ ok: z.boolean(), url: z.string() });
    const [first, second] = await Promise.all([
      request(apiClient.get('accounts'), schema),
      request(apiClient.get('dashboard'), schema),
    ]);

    expect(first).toEqual({ ok: true, url: 'accounts' });
    expect(second).toEqual({ ok: true, url: 'dashboard' });
    expect(refreshCalls).toEqual([{ refreshToken: 'refresh-1' }]);
    expect(useSession.getState().tokens?.accessToken).toBe('fresh');
    expect(useSession.getState().tokens?.refreshToken).toBe('refresh-2');
  });

  it('refresh recusado encerra a sessão (volta para o login)', async () => {
    publicClient.defaults.adapter = fakeAdapter(() => ({
      status: 401,
      data: { code: 'INVALID_REFRESH_TOKEN' },
    }));
    apiClient.defaults.adapter = fakeAdapter(() => ({ status: 401, data: { code: 'UNAUTHORIZED' } }));

    await expect(request(apiClient.get('accounts'), z.unknown())).rejects.toEqual(
      new ApiError({ kind: 'unauthorized' }),
    );
    expect(useSession.getState().status).toBe('signedOut');
  });

  it('sem rede no refresh mantém a sessão', async () => {
    publicClient.defaults.adapter = async () => {
      throw new AxiosError('Network Error', 'ERR_NETWORK');
    };
    apiClient.defaults.adapter = fakeAdapter(() => ({ status: 401 }));

    await expect(request(apiClient.get('accounts'), z.unknown())).rejects.toBeInstanceOf(ApiError);
    expect(useSession.getState().status).toBe('signedIn');
  });

  it('resposta fora do contrato vira erro tipado', async () => {
    useSession.setState({ tokens: { accessToken: 'fresh', refreshToken: 'r', expiresAt: 0 } });
    apiClient.defaults.adapter = fakeAdapter(() => ({ status: 200, data: { unexpected: true } }));

    const failure = await request(apiClient.get('accounts'), z.array(z.string())).catch((e: unknown) => e);
    expect(failure).toBeInstanceOf(ApiError);
    expect((failure as ApiError).error).toEqual({ kind: 'unknown' });
  });
});
