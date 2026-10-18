import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon, SegmentedButtons } from 'react-native-paper';

import { radius, swatches, useAppTheme } from '@/theme';

import { glassSurface } from './glass';

type SegmentedPickerProps<T extends string> = {
  options: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
  label: (value: T) => string;
  style?: StyleProp<ViewStyle>;
};

export function SegmentedPicker<T extends string>({
  options,
  selected,
  onSelect,
  label,
  style,
}: SegmentedPickerProps<T>) {
  const theme = useAppTheme();
  return (
    <SegmentedButtons
      value={selected}
      onValueChange={(value) => onSelect(value as T)}
      buttons={options.map((option) => ({
        value: option,
        label: label(option),
        showSelectedCheck: true,
        labelStyle: { fontWeight: option === selected ? '800' : '600' },
        style: {
          borderWidth: 0,
          borderRadius: radius.full,
          backgroundColor: option === selected ? theme.glass.selected : 'transparent',
          boxShadow: option === selected ? '0 2px 8px 0 rgba(30,20,70,0.12)' : undefined,
        },
      }))}
      style={[glassSurface(theme, radius.full), styles.segmented, style]}
    />
  );
}

type ColorSwatchPickerProps = {
  selected: string;
  onSelect: (color: string) => void;
  colors?: readonly string[];
};

export function ColorSwatchPicker({ selected, onSelect, colors = swatches }: ColorSwatchPickerProps) {
  const theme = useAppTheme();
  return (
    <View style={styles.row} role="radiogroup">
      {colors.map((color) => {
        const isSelected = color.toUpperCase() === selected.toUpperCase();
        return (
          <Pressable
            key={color}
            onPress={() => onSelect(color)}
            role="radio"
            aria-checked={isSelected}
            aria-label={color}
            style={[
              styles.swatch,
              { backgroundColor: color },
              isSelected && { borderWidth: 3, borderColor: theme.colors.onSurface },
            ]}
          >
            {isSelected ? <Icon source="check" size={20} color="#FFFFFF" /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segmented: { padding: 3, gap: 2 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatch: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
