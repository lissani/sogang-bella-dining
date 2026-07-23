import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

import { LunchCupbap } from '@/types/menu';

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
          <Text variant="titleLarge">🍱 점심</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {lunch.time}
          </Text>
        </View>
        <Text variant="titleMedium" style={styles.menu}>
          {lunch.menu}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          주 1회 제공되는 컵밥 메뉴입니다.
        </Text>
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
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menu: {
    fontFamily: 'Pretendard-SemiBold',
  },
});
