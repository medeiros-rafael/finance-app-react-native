import '@/i18n';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { createQueryClient } from '@/lib/query-client';
import { lightTheme } from '@/theme';

const paperSettings = {
  icon: ({ name, ...props }: { name: string; size: number; color?: string }) => (
    <MaterialCommunityIcons name={name as keyof typeof MaterialCommunityIcons.glyphMap} {...props} />
  ),
};

function AppTestProviders({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 393, height: 852 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <QueryClientProvider client={createQueryClient({ gcTime: Infinity })}>
        <PaperProvider theme={lightTheme} settings={paperSettings}>
          {children}
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export function renderWithProviders(ui: ReactElement) {
  return rtlRender(ui, { wrapper: AppTestProviders });
}
