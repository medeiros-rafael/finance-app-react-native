import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import Animated, { SlideInLeft, SlideInRight } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { glassSurface } from '@/components/ui/glass';
import { addMonths, formatMonthYear, type YearMonth } from '@/lib/dates';
import { useAppTheme } from '@/theme';

type Props = {
  month: YearMonth;
  onMonthChange: (month: YearMonth) => void;
  style?: StyleProp<ViewStyle>;
};

export function MonthSelector({ month, onMonthChange, style }: Props) {
  const { t, i18n } = useTranslation();
  const theme = useAppTheme();
  const [previous, setPrevious] = useState(month);
  const [forward, setForward] = useState(true);
  if (month !== previous) {
    setForward(month > previous);
    setPrevious(month);
  }

  return (
    <View style={[glassSurface(theme, 22), styles.row, style]}>
      <IconButton
        size={20}
        style={styles.button}
        icon="chevron-left"
        onPress={() => onMonthChange(addMonths(month, -1))}
        accessibilityLabel={t('ui.previousMonth')}
      />
      <View style={styles.label}>
        <Animated.View key={month} entering={(forward ? SlideInRight : SlideInLeft).duration(220)}>
          <Text variant="titleSmall" style={styles.text}>
            {formatMonthYear(month, i18n.language)}
          </Text>
        </Animated.View>
      </View>
      <IconButton
        size={20}
        style={styles.button}
        icon="chevron-right"
        onPress={() => onMonthChange(addMonths(month, 1))}
        accessibilityLabel={t('ui.nextMonth')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', height: 44, marginVertical: 6 },
  button: { margin: 0 },
  label: { minWidth: 140, overflow: 'hidden' },
  text: { textAlign: 'center' },
});
