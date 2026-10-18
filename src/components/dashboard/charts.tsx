import { matchFont } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { BarGroup, CartesianChart, Pie, PolarChart } from 'victory-native';
import { useTranslation } from 'react-i18next';

import type { CategoryExpense, MonthlyEvolution } from '@/api/schemas';
import { MoneyText } from '@/components/finance/money-text';
import { formatShortMonth } from '@/lib/dates';
import { formatCompactMoney, type Cents } from '@/lib/money';
import { usePreferences } from '@/stores/preferences';
import { spacing, useAppTheme, withAlpha } from '@/theme';

const axisFont = matchFont({
  fontFamily: Platform.select({ ios: 'Helvetica', default: 'sans-serif' }),
  fontSize: 11,
});

export function MonthlyEvolutionChart({ evolution }: { evolution: MonthlyEvolution[] }) {
  const theme = useAppTheme();
  const { t, i18n } = useTranslation();
  const hide = usePreferences((state) => state.hideValues);

  const data = useMemo(
    () =>
      evolution.map((item, index) => ({ x: index, income: item.income / 100, expense: item.expense / 100 })),
    [evolution],
  );
  const labels = useMemo(
    () => evolution.map((item) => formatShortMonth(item.month, i18n.language)),
    [evolution, i18n.language],
  );

  if (data.length === 0) return null;

  return (
    <View>
      <View style={styles.chart} accessible aria-label={t('dashboard.chartDescription')}>
        <CartesianChart
          data={data}
          xKey="x"
          yKeys={['income', 'expense']}
          domain={{ y: [0] }}
          domainPadding={{ left: 28, right: 28, top: 16 }}
          xAxis={{
            font: axisFont,
            tickCount: data.length,
            labelColor: theme.colors.onSurfaceVariant,
            lineColor: 'transparent',
            formatXLabel: (value) => labels[Math.round(Number(value))] ?? '',
          }}
          yAxis={[
            {
              font: axisFont,
              tickCount: 4,
              labelColor: theme.colors.onSurfaceVariant,
              lineColor: withAlpha(theme.colors.outlineVariant, 0.5),
              formatYLabel: (value) => (hide ? '•••' : formatCompactMoney(Math.round(Number(value) * 100))),
            },
          ]}
          frame={{ lineWidth: 0 }}
        >
          {({ points, chartBounds }) => (
            <BarGroup
              chartBounds={chartBounds}
              betweenGroupPadding={0.45}
              withinGroupPadding={0.15}
              roundedCorners={{ topLeft: 6, topRight: 6 }}
            >
              <BarGroup.Bar points={points.income} color={theme.colors.income} animate={{ type: 'timing' }} />
              <BarGroup.Bar
                points={points.expense}
                color={theme.colors.expense}
                animate={{ type: 'timing' }}
              />
            </BarGroup>
          )}
        </CartesianChart>
      </View>
      <View style={styles.legend}>
        <LegendItem color={theme.colors.income} label={t('dashboard.income')} />
        <LegendItem color={theme.colors.expense} label={t('dashboard.expenses')} />
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="labelMedium">{label}</Text>
    </View>
  );
}

const MAX_SLICES = 5;

type Slice = { label: string; value: number; color: string; percentage: number };

export function buildSlices(expenses: CategoryExpense[], othersLabel: string, othersColor: string): Slice[] {
  const top = expenses.slice(0, MAX_SLICES).map((item) => ({
    label: item.name,
    value: item.amount,
    color: item.color,
    percentage: item.percentage,
  }));
  const rest = expenses.slice(MAX_SLICES);
  if (rest.length === 0) return top;
  return [
    ...top,
    {
      label: othersLabel,
      value: rest.reduce((sum, item) => sum + item.amount, 0),
      color: othersColor,
      percentage: rest.reduce((sum, item) => sum + item.percentage, 0),
    },
  ];
}

export function CategoryDonut({ expenses, total }: { expenses: CategoryExpense[]; total: Cents }) {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const slices = useMemo(
    () => buildSlices(expenses, t('dashboard.otherCategories'), theme.colors.outline),
    [expenses, t, theme.colors.outline],
  );
  const description = slices.map((slice) => `${slice.label} ${Math.round(slice.percentage)}%`).join(', ');

  return (
    <View style={styles.donutRow}>
      <View style={styles.donut} accessible aria-label={description}>
        <PolarChart data={slices} labelKey="label" valueKey="value" colorKey="color">
          <Pie.Chart innerRadius="68%" startAngle={-90}>
            {() => (
              <>
                <Pie.Slice animate={{ type: 'timing', duration: 900 }} />
                <Pie.SliceAngularInset
                  angularInset={{
                    angularStrokeWidth: slices.length > 1 ? 3 : 0,
                    angularStrokeColor: theme.colors.surfaceContainerLowest,
                  }}
                />
              </>
            )}
          </Pie.Chart>
        </PolarChart>
        <View style={styles.donutCenter} pointerEvents="none">
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('dashboard.total')}
          </Text>
          <MoneyText cents={total} variant="labelLarge" />
        </View>
      </View>
      <View style={styles.sliceList}>
        {slices.map((slice) => (
          <View key={slice.label} style={styles.sliceRow}>
            <View style={[styles.dot, { backgroundColor: slice.color }]} />
            <Text variant="bodySmall" numberOfLines={1} style={styles.sliceLabel}>
              {slice.label}
            </Text>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {Math.round(slice.percentage)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { height: 200 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg, marginTop: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dot: { width: 10, height: 10, borderRadius: 5 },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  donut: { width: 140, height: 140 },
  donutCenter: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliceList: { flex: 1, gap: spacing.sm },
  sliceRow: { flexDirection: 'row', alignItems: 'center' },
  sliceLabel: { flex: 1, marginLeft: spacing.sm },
});
