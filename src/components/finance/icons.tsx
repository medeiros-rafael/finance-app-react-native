import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from 'react-native-paper';

import type { AccountType } from '@/api/schemas';
import { withAlpha } from '@/theme';

const categoryIcons: Record<string, string> = {
  home: 'home-outline',
  restaurant: 'silverware-fork-knife',
  directions_car: 'car-outline',
  favorite: 'heart-outline',
  school: 'school-outline',
  sports_esports: 'controller-classic-outline',
  shopping_bag: 'shopping-outline',
  subscriptions: 'play-box-multiple-outline',
  account_balance: 'bank-outline',
  flight: 'airplane',
  pets: 'paw-outline',
  more_horiz: 'dots-horizontal',
  payments: 'cash-multiple',
  work: 'briefcase-outline',
  trending_up: 'trending-up',
  redeem: 'gift-outline',
  add_circle: 'plus-circle-outline',
};

export function categoryIcon(key: string): string {
  return categoryIcons[key] ?? 'shape-outline';
}

export const accountTypeIcons: Record<AccountType, string> = {
  CHECKING: 'bank-outline',
  SAVINGS: 'piggy-bank-outline',
  CASH: 'cash',
  DIGITAL_WALLET: 'wallet-outline',
  INVESTMENT: 'chart-line',
  OTHER: 'dots-horizontal',
};

type BadgeProps = {
  icon: string;
  color: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function ColoredIconBadge({ icon, color, size = 44, style }: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: size * 0.3, backgroundColor: withAlpha(color, 0.15) },
        style,
      ]}
    >
      <Icon source={icon} size={size * 0.5} color={color} />
    </View>
  );
}

export function CategoryBadge({ iconKey, ...props }: Omit<BadgeProps, 'icon'> & { iconKey: string }) {
  return <ColoredIconBadge icon={categoryIcon(iconKey)} {...props} />;
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center' },
});
