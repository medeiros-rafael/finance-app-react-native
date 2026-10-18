import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState, type ReactNode } from 'react';
import { FlatList, Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon, Menu, Text, TouchableRipple } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import type { Account, Category } from '@/api/schemas';
import { Sheet } from '@/components/ui/sheet';
import { formatMediumDate, parseLocalDate, toLocalDate, type LocalDate } from '@/lib/dates';
import { glassSurface } from '@/components/ui/glass';
import { radius, spacing, useAppTheme } from '@/theme';

import { accountTypeIcons, CategoryBadge, ColoredIconBadge } from './icons';
import { MoneyText } from './money-text';

type PickerFieldProps = {
  label: string;
  value: string | null;
  placeholder: string;
  onPress: () => void;
  leading: ReactNode;
  error?: string;
  style?: StyleProp<ViewStyle>;
};

export function PickerField({ label, value, placeholder, onPress, leading, error, style }: PickerFieldProps) {
  const theme = useAppTheme();
  return (
    <View style={style}>
      <TouchableRipple
        onPress={onPress}
        borderless
        role="button"
        aria-label={`${label}: ${value ?? placeholder}`}
        style={[
          glassSurface(theme, radius.md),
          styles.field,
          error ? { borderColor: theme.colors.error, borderWidth: 1.5 } : null,
        ]}
      >
        <View style={styles.fieldRow}>
          {leading}
          <View style={styles.fieldTexts}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {label}
            </Text>
            <Text
              variant="bodyLarge"
              numberOfLines={1}
              style={{ color: value ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}
            >
              {value ?? placeholder}
            </Text>
          </View>
          <Icon source="chevron-down" size={24} color={theme.colors.onSurfaceVariant} />
        </View>
      </TouchableRipple>
      {error ? (
        <Text variant="bodySmall" style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

type AccountDropdownProps = {
  label: string;
  accounts: Account[];
  selectedId: string;
  onSelect: (id: string) => void;
  error?: string;
  style?: StyleProp<ViewStyle>;
};

export function AccountDropdown({
  label,
  accounts,
  selectedId,
  onSelect,
  error,
  style,
}: AccountDropdownProps) {
  const theme = useAppTheme();
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(0);
  const selected = accounts.find((account) => account.id === selectedId);

  return (
    <View style={style} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <Menu
        visible={open}
        onDismiss={() => setOpen(false)}
        anchorPosition="bottom"
        contentStyle={{ width, backgroundColor: theme.glass.sheet, borderRadius: radius.md }}
        anchor={
          <PickerField
            label={label}
            value={selected?.name ?? null}
            placeholder=""
            onPress={() => setOpen(true)}
            error={error}
            leading={
              selected ? (
                <ColoredIconBadge icon={accountTypeIcons[selected.type]} color={selected.color} size={36} />
              ) : (
                <Icon source="bank-outline" size={24} color={theme.colors.onSurfaceVariant} />
              )
            }
          />
        }
      >
        {accounts.map((account) => (
          <TouchableRipple
            key={account.id}
            onPress={() => {
              onSelect(account.id);
              setOpen(false);
            }}
            role="menuitem"
          >
            <View style={styles.menuItem}>
              <ColoredIconBadge icon={accountTypeIcons[account.type]} color={account.color} size={28} />
              <Text variant="bodyLarge" style={styles.menuText} numberOfLines={1}>
                {account.name}
              </Text>
              <MoneyText cents={account.currentBalance} variant="labelMedium" />
            </View>
          </TouchableRipple>
        ))}
      </Menu>
    </View>
  );
}

type CategoryFieldProps = {
  category: Category | undefined;
  categories: Category[];
  onSelect: (id: string) => void;
  error?: string;
  style?: StyleProp<ViewStyle>;
};

export function CategoryField({ category, categories, onSelect, error, style }: CategoryFieldProps) {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <PickerField
        label={t('transactions.category')}
        value={category?.name ?? null}
        placeholder={t('transactions.chooseCategory')}
        onPress={() => setOpen(true)}
        error={error}
        style={style}
        leading={
          category ? (
            <CategoryBadge iconKey={category.icon} color={category.color} size={36} />
          ) : (
            <Icon source="shape-outline" size={24} color={theme.colors.onSurfaceVariant} />
          )
        }
      />
      <Sheet visible={open} onDismiss={() => setOpen(false)}>
        <CategoryGrid
          categories={categories}
          selectedId={category?.id ?? ''}
          onSelect={(id) => {
            onSelect(id);
            setOpen(false);
          }}
        />
      </Sheet>
    </>
  );
}

export function CategoryGrid({
  categories,
  selectedId,
  onSelect,
}: {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const theme = useAppTheme();
  const { t } = useTranslation();
  return (
    <View>
      <Text variant="titleMedium" style={styles.sheetTitle}>
        {t('transactions.chooseCategory')}
      </Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        numColumns={4}
        scrollEnabled={false}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const selected = item.id === selectedId;
          return (
            <TouchableRipple
              onPress={() => onSelect(item.id)}
              borderless
              role="radio"
              aria-checked={selected}
              style={[
                styles.gridItem,
                { backgroundColor: selected ? theme.colors.primaryContainer : 'transparent' },
              ]}
            >
              <View style={styles.gridContent}>
                <CategoryBadge iconKey={item.icon} color={item.color} />
                <Text variant="labelMedium" numberOfLines={2} style={styles.gridLabel}>
                  {item.name}
                </Text>
              </View>
            </TouchableRipple>
          );
        }}
      />
    </View>
  );
}

type DateFieldProps = {
  date: LocalDate;
  onDateChange: (date: LocalDate) => void;
  style?: StyleProp<ViewStyle>;
};

export function DateField({ date, onDateChange, style }: DateFieldProps) {
  const theme = useAppTheme();
  const { t, i18n } = useTranslation();
  const [iosOpen, setIosOpen] = useState(false);

  const open = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: parseLocalDate(date),
        mode: 'date',
        onChange: (event, selected) => {
          if (event.type === 'set' && selected) onDateChange(toLocalDate(selected));
        },
      });
    } else {
      setIosOpen(true);
    }
  };

  return (
    <>
      <PickerField
        label={t('transactions.date')}
        value={formatMediumDate(date, i18n.language)}
        placeholder=""
        onPress={open}
        style={style}
        leading={<Icon source="calendar-month-outline" size={24} color={theme.colors.onSurfaceVariant} />}
      />
      {Platform.OS === 'ios' ? (
        <Sheet visible={iosOpen} onDismiss={() => setIosOpen(false)}>
          <DateTimePicker
            value={parseLocalDate(date)}
            mode="date"
            display="inline"
            locale={i18n.language}
            accentColor={theme.colors.primary}
            onChange={(_, selected) => {
              if (selected) onDateChange(toLocalDate(selected));
              setIosOpen(false);
            }}
          />
        </Sheet>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  field: { borderRadius: radius.md, borderWidth: 1 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, minHeight: 64 },
  fieldTexts: { flex: 1, marginHorizontal: spacing.md },
  error: { marginLeft: spacing.lg, marginTop: spacing.xs },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  menuText: { flex: 1 },
  sheetTitle: { paddingHorizontal: spacing.screen, paddingBottom: spacing.sm },
  grid: { paddingHorizontal: spacing.md },
  gridItem: { flex: 1 / 4, margin: spacing.xs, borderRadius: radius.md },
  gridContent: { alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.xs },
  gridLabel: { textAlign: 'center', marginTop: spacing.xs },
});
