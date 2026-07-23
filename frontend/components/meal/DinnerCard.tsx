import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Dinner } from '@/types/menu';
import { MealDetailView } from './MealDetailView';

type DinnerCardProps = {
  dinner: Dinner;
};

export function DinnerCard({ dinner }: DinnerCardProps) {
  const theme = useTheme();
  const isOperating = dinner.korean !== null;

  return (
    <Card mode="elevated" style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.headerRow}>
          <Text variant="titleLarge">🍚 저녁</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            17:30 - 19:30
          </Text>
        </View>

        {isOperating ? (
          <>
            <MealDetailView detail={dinner.korean!} />
            {dinner.common_beverage && (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {dinner.info ? `${dinner.info} · ` : ''}
                {dinner.common_beverage}
              </Text>
            )}
          </>
        ) : (
          <View style={styles.notOperating}>
            <MaterialCommunityIcons
              name="silverware-variant"
              size={22}
              color={theme.colors.onSurfaceVariant}
            />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {dinner.info ?? '오늘은 석식이 운영되지 않습니다.'}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  content: {
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notOperating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
});
