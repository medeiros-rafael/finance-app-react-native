import { focusManager } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useAppLock } from '@/stores/app-lock';

export function useAppStateListeners() {
  useEffect(() => {
    const onChange = (status: AppStateStatus) => {
      const lock = useAppLock.getState();
      if (status === 'background') lock.onBackground();
      if (status === 'active') lock.onForeground();
      focusManager.setFocused(status === 'active');
    };
    const subscription = AppState.addEventListener('change', onChange);
    return () => subscription.remove();
  }, []);
}
