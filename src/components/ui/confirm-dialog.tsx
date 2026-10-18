import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { radius, useAppTheme } from '@/theme';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onDismiss: () => void;
  destructive?: boolean;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText,
  onConfirm,
  onDismiss,
  destructive = true,
}: Props) {
  const theme = useAppTheme();
  const { t } = useTranslation();
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={{ borderRadius: radius.xl }}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{t('common.cancel')}</Button>
          <Button onPress={onConfirm} textColor={destructive ? theme.colors.error : theme.colors.primary}>
            {confirmText}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
