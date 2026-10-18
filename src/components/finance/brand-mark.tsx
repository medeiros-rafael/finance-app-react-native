import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from 'react-native-paper';

import { useAppTheme } from '@/theme';

export function BrandMark({ size = 72 }: { size?: number }) {
  const theme = useAppTheme();
  return (
    <LinearGradient
      colors={theme.heroGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.35), 0 14px 30px 0 ${theme.dark ? 'rgba(120,90,255,0.35)' : 'rgba(91,52,200,0.30)'}`,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon source="piggy-bank" size={size * 0.55} color={theme.colors.onHero} />
    </LinearGradient>
  );
}
