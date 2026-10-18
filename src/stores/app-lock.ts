import { create } from 'zustand';

export const LOCK_AFTER_MS = 30_000;

type AppLockState = {
  locked: boolean;
  backgroundedAt: number | null;
  unlock: () => void;
  onBackground: (now?: number) => void;
  onForeground: (now?: number) => void;
};

export const useAppLock = create<AppLockState>((set, get) => ({
  locked: true,
  backgroundedAt: null,
  unlock: () => set({ locked: false }),
  onBackground: (now = Date.now()) => set({ backgroundedAt: now }),
  onForeground: (now = Date.now()) => {
    const since = get().backgroundedAt;
    if (since === null) return;
    set({ backgroundedAt: null, locked: get().locked || now - since >= LOCK_AFTER_MS });
  },
}));
