import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ui/glass';
import { spacing, useAppTheme } from '@/theme';

type Props = {
  title: string;
  subtitle: string;
  header?: ReactNode;
  children: ReactNode;
};

export function AuthScaffold({ title, subtitle, header, children }: Props) {
  const theme = useAppTheme();
  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.surface }]}>
      <AmbientBackground />
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.content}>
              {header}
              <Text variant="headlineLarge" role="heading">
                {title}
              </Text>
              <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                {subtitle}
              </Text>
              {children}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.lg,
  },
  content: { width: '100%', maxWidth: 480 },
  subtitle: { marginTop: spacing.sm, marginBottom: spacing.xl + spacing.xs },
});
