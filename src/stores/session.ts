import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import type { AuthResponse, User } from '@/api/schemas';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export type SessionStatus = 'loading' | 'signedOut' | 'signedIn';

type SessionState = {
  status: SessionStatus;
  user: User | null;
  tokens: AuthTokens | null;
  hydrate: () => Promise<void>;
  signIn: (auth: AuthResponse) => Promise<void>;
  updateTokens: (tokens: AuthTokens) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  clear: () => Promise<void>;
};

const KEYS = {
  access: 'finance.session.access',
  refresh: 'finance.session.refresh',
  meta: 'finance.session.meta',
} as const;

type StoredMeta = { expiresAt: number; user: User };

export function tokensFrom(auth: AuthResponse, now: number = Date.now()): AuthTokens {
  return {
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    expiresAt: now + auth.expiresIn * 1000,
  };
}

async function persist(tokens: AuthTokens, user: User) {
  const meta: StoredMeta = { expiresAt: tokens.expiresAt, user };
  await Promise.all([
    SecureStore.setItemAsync(KEYS.access, tokens.accessToken),
    SecureStore.setItemAsync(KEYS.refresh, tokens.refreshToken),
    SecureStore.setItemAsync(KEYS.meta, JSON.stringify(meta)),
  ]);
}

export const useSession = create<SessionState>((set, get) => ({
  status: 'loading',
  user: null,
  tokens: null,

  hydrate: async () => {
    try {
      const [accessToken, refreshToken, rawMeta] = await Promise.all([
        SecureStore.getItemAsync(KEYS.access),
        SecureStore.getItemAsync(KEYS.refresh),
        SecureStore.getItemAsync(KEYS.meta),
      ]);
      if (!accessToken || !refreshToken || !rawMeta) {
        set({ status: 'signedOut', user: null, tokens: null });
        return;
      }
      const meta = JSON.parse(rawMeta) as StoredMeta;
      set({
        status: 'signedIn',
        user: meta.user,
        tokens: { accessToken, refreshToken, expiresAt: meta.expiresAt },
      });
    } catch {
      set({ status: 'signedOut', user: null, tokens: null });
    }
  },

  signIn: async (auth) => {
    const tokens = tokensFrom(auth);
    await persist(tokens, auth.user);
    set({ status: 'signedIn', user: auth.user, tokens });
  },

  updateTokens: async (tokens) => {
    const { user } = get();
    if (!user) return;
    await persist(tokens, user);
    set({ tokens });
  },

  updateUser: async (user) => {
    const { tokens } = get();
    if (!tokens) return;
    await persist(tokens, user);
    set({ user });
  },

  clear: async () => {
    await Promise.all(Object.values(KEYS).map((key) => SecureStore.deleteItemAsync(key)));
    set({ status: 'signedOut', user: null, tokens: null });
  },
}));

export function firstName(name: string | null | undefined): string {
  return (name ?? '').trim().split(/\s+/)[0] ?? '';
}
