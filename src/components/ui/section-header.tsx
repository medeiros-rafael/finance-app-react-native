import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Button, Text } from 'react-native-paper';

type Props = {
  title: string;
  actionText?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function SectionHeader({ title, actionText, onAction, style }: Props) {
  return (
    <View style={[styles.row, style]}>
      <Text variant="titleLarge" style={styles.title} role="heading">
        {title}
      </Text>
      {actionText && onAction ? (
        <Button mode="text" onPress={onAction} compact labelStyle={styles.action}>
          {actionText}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  title: { flex: 1, fontWeight: '800' },
  action: { fontWeight: '700', fontSize: 15 },
});
