import axios, { isAxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import type { z } from 'zod';

import { tokensFrom, useSession } from '@/stores/session';

import { ApiError, toAppError } from './errors';
import { authResponseSchema } from './schemas';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  Platform.select({ android: 'http://10.0.2.2:5080/api/v1/', default: 'http://localhost:5080/api/v1/' });

const baseConfig = {
  baseURL: API_URL,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
};

export const publicClient = axios.create(baseConfig);

export const apiClient = axios.create(baseConfig);

apiClient.interceptors.request.use((config) => {
  const token = useSession.getState().tokens?.accessToken;
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

apiClient.interceptors.response.use(undefined, async (error: unknown) => {
  if (!isAxiosError(error) || error.response?.status !== 401 || !error.config) throw error;
  const config = error.config as RetriableConfig;
  if (config._retried) throw error;

  const failedToken = String(config.headers.get('Authorization') ?? '').replace('Bearer ', '');
  const newToken = await refreshAccessToken(failedToken);
  if (!newToken) throw error;

  config._retried = true;
  config.headers.set('Authorization', `Bearer ${newToken}`);
  return apiClient.request(config);
});

let refreshing: Promise<string | null> | null = null;

export function refreshAccessToken(failedToken: string): Promise<string | null> {
  const { tokens } = useSession.getState();
  if (!tokens) return Promise.resolve(null);
  if (tokens.accessToken !== failedToken) return Promise.resolve(tokens.accessToken);

  refreshing ??= (async () => {
    try {
      const response = await publicClient.post('auth/refresh', { refreshToken: tokens.refreshToken });
      const auth = authResponseSchema.parse(response.data);
      await useSession.getState().updateTokens(tokensFrom(auth));
      return auth.accessToken;
    } catch (error) {
      if (isAxiosError(error) && error.response) await useSession.getState().clear();
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

export async function request<S extends z.ZodType>(
  call: Promise<AxiosResponse>,
  schema: S,
): Promise<z.output<S>> {
  try {
    const response = await call;
    return schema.parse(response.data);
  } catch (error) {
    throw new ApiError(toAppError(error));
  }
}

export async function send(call: Promise<AxiosResponse>): Promise<void> {
  try {
    await call;
  } catch (error) {
    throw new ApiError(toAppError(error));
  }
}
