import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { MealDetail } from '@/types/menu';

type MealDetailViewProps = {
  detail: MealDetail;
  common?: string | null;
};

export function MealDetailView({ detail, common }: MealDetailViewProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.itemRow}>
        <MaterialCommunityIcons name="star" size={11} color={theme.colors.primary} />
        <Text variant="bodyLarge" style={[styles.main, { color: theme.colors.onSurface }]}>
          {detail.main}
        </Text>
      </View>

      {detail.items.map(item => (
        <View key={item} style={styles.itemRow}>
          <View style={[styles.bullet, { backgroundColor: theme.colors.onSurfaceVariant }]} />
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
            {item}
          </Text>
        </View>
      ))}

      {common && (
        <View style={styles.commonRow}>
          <View style={[styles.bullet, styles.commonBullet, { borderColor: theme.colors.onSurfaceVariant }]} />
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, flexShrink: 1 }}>
            {common}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingLeft: 12,
  },
  main: {
    fontFamily: 'Pretendard-SemiBold',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  commonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  commonBullet: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
});
