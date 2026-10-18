import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { applyLanguage, type Language } from '@/i18n';

export type ThemeMode = 'system' | 'light' | 'dark';

type PreferencesState = {
  themeMode: ThemeMode;
  biometricLockEnabled: boolean;
  hideValues: boolean;
  language: Language | null;
  hydrated: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setBiometricLock: (enabled: boolean) => void;
  setHideValues: (hide: boolean) => void;
  toggleHideValues: () => void;
  setLanguage: (language: Language) => void;
};

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      biometricLockEnabled: false,
      hideValues: false,
      language: null,
      hydrated: false,
      setThemeMode: (themeMode) => set({ themeMode }),
      setBiometricLock: (biometricLockEnabled) => set({ biometricLockEnabled }),
      setHideValues: (hideValues) => set({ hideValues }),
      toggleHideValues: () => set((state) => ({ hideValues: !state.hideValues })),
      setLanguage: (language) => {
        applyLanguage(language);
        set({ language });
      },
    }),
    {
      name: 'finance.preferences',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ themeMode, biometricLockEnabled, hideValues, language }) => ({
        themeMode,
        biometricLockEnabled,
        hideValues,
        language,
      }),
      onRehydrateStorage: () => (state) => {
        applyLanguage(state?.language ?? null);
        usePreferences.setState({ hydrated: true });
      },
    },
  ),
);
