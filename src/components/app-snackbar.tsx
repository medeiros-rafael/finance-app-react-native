import { StyleSheet } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSnackbar } from '@/stores/snackbar';

export function AppSnackbar() {
  const { message, id, dismiss } = useSnackbar();
  const insets = useSafeAreaInsets();
  return (
    <Snackbar
      key={id}
      visible={message !== null}
      onDismiss={dismiss}
      duration={3000}
      wrapperStyle={[styles.wrapper, { bottom: insets.bottom + 8 }]}
    >
      {message ?? ''}
    </Snackbar>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', left: 0, right: 0 },
});
