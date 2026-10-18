import '@/i18n';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';

import { AppSnackbar } from '@/components/app-snackbar';
import { useAppStateListeners } from '@/hooks/use-app-state-listeners';
import { queryClient } from '@/lib/query-client';
import { useAppLock } from '@/stores/app-lock';
import { usePreferences } from '@/stores/preferences';
import { useSession } from '@/stores/session';
import { darkTheme, lightTheme, navigationTheme } from '@/theme';

void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true, duration: 250 });

useSession.subscribe((state, previous) => {
  if (previous.status === 'signedIn' && state.status === 'signedOut') {
    queryClient.clear();
    useAppLock.getState().unlock();
  }
});

export default function RootLayout() {
  const status = useSession((state) => state.status);
  const preferencesReady = usePreferences((state) => state.hydrated);
  const [fontsLoaded, fontError] = useFonts(MaterialCommunityIcons.font);
  const ready = status !== 'loading' && preferencesReady && (fontsLoaded || !!fontError);

  useEffect(() => {
    void useSession.getState().hydrate();
  }, []);

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  useAppStateListeners();

  if (!ready) return null;
  return <AppProviders />;
}

function AppProviders() {
  const systemScheme = useColorScheme();
  const themeMode = usePreferences((state) => state.themeMode);
  const dark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';
  const theme = dark ? darkTheme : lightTheme;

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.colors.background);
  }, [theme]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider
          theme={theme}
          settings={{
            icon: ({ name, ...props }) => (
              <MaterialCommunityIcons
                name={name as keyof typeof MaterialCommunityIcons.glyphMap}
                {...props}
              />
            ),
          }}
        >
          <ThemeProvider value={navigationTheme(theme)}>
            <StatusBar style={dark ? 'light' : 'dark'} />
            <RootNavigator />
            <AppSnackbar />
          </ThemeProvider>
        </PaperProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const signedIn = useSession((state) => state.status === 'signedIn');
  const biometricLock = usePreferences((state) => state.biometricLockEnabled);
  const locked = useAppLock((state) => state.locked) && biometricLock;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={signedIn && !locked}>
        <Stack.Screen name="(app)" options={{ animation: 'fade' }} />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && locked}>
        <Stack.Screen name="lock" options={{ animation: 'fade' }} />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
