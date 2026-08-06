import { StyleSheet, View } from 'react-native';
import { Card, Divider, Text, useTheme } from 'react-native-paper';

import { LunchCupbap } from '@/types/menu';
import { MealDetailView } from './MealDetailView';

type LunchCardProps = {
  lunch: LunchCupbap | null;
};

export function LunchCard({ lunch }: LunchCardProps) {
  const theme = useTheme();

  // 주 1회만 제공되는 컵밥 메뉴 - 데이터가 없는 날은 카드 자체를 노출하지 않는다.
  if (!lunch) {
    return null;
  }

  return (
    <Card mode="elevated" style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.headerRow}>
          <Text variant="titleLarge" style={styles.headerLeft}>🍱 점심</Text>
          <Text variant="bodyMedium" style={[styles.headerCenter, { color: theme.colors.onSurfaceVariant }]}>
            {lunch.time}
          </Text>
          <Text variant="labelLarge" style={[styles.headerRight, { color: theme.colors.primary }]}>
            {''}
          </Text>
        </View>

        <Divider />

        <View style={styles.body}>
          <MealDetailView detail={{ main: lunch.menu, items: [], calories: '' }} />
          <Text variant="bodyMedium" style={[styles.caption, { color: theme.colors.onSurfaceVariant }]}>
            주 1회 제공되는 컵밥 메뉴입니다.
          </Text>
        </View>
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
    justifyContent: 'space-between',
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
  body: {
    minHeight: 85,
    justifyContent: 'center',
    gap: 8,
  },
  caption: {
    paddingLeft: 14,
  },
});
