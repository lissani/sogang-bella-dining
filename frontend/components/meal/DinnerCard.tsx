import { StyleSheet, View } from 'react-native';
import { Card, Divider, Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Dinner } from '@/types/menu';
import { MealDetailView } from './MealDetailView';

type DinnerCardProps = {
  dinner: Dinner | null;
};

export function DinnerCard({ dinner }: DinnerCardProps) {
  const theme = useTheme();

  // 기숙사 미운영 등 비정기 사유로 dinner 객체 자체가 내려오지 않는 날은 카드를 표시하지 않는다.
  if (!dinner) {
    return null;
  }

  // 토요일 정기 미운영처럼 dinner 객체는 있지만 한식 메뉴가 없는 날은 안내 문구를 보여준다.
  const isOperating = dinner.korean !== null;

  return (
    <Card mode="elevated" style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.headerRow}>
          <Text variant="titleLarge" style={styles.headerLeft}>🍚 저녁</Text>
          <Text variant="bodyMedium" style={[styles.headerCenter, { color: theme.colors.onSurfaceVariant }]}>
            17:30 - 19:30
          </Text>
          <Text variant="labelLarge" style={[styles.headerRight, { color: theme.colors.primary }]}>
            {isOperating ? dinner.korean!.calories : ''}
          </Text>
        </View>

        <Divider />

        {isOperating ? (
          <>
            <MealDetailView detail={dinner.korean!} common={dinner.common_beverage} />
            {dinner.info && (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {dinner.info}
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
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerCenter: {
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flex: 1,
    textAlign: 'right',
  },
  notOperating: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 85,
    paddingVertical: 24,
  },
});
