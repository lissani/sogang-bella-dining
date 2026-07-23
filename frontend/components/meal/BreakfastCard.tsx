import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, SegmentedButtons, Text, useTheme } from 'react-native-paper';

import { Breakfast } from '@/types/menu';
import { MealDetailView } from './MealDetailView';

type BreakfastCardProps = {
  breakfast: Breakfast;
};

export function BreakfastCard({ breakfast }: BreakfastCardProps) {
  const theme = useTheme();
  // 상태 관리 - 한식 vs 빵식 선택
  const [section, setSection] = useState<'korean' | 'bakery'>('korean');

  return (
    <Card mode="elevated" style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.headerRow}>
          <Text variant="titleLarge">🍳 아침</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            07:30 - 09:30
          </Text>
        </View>

        <SegmentedButtons
          value={section}
          onValueChange={value => setSection(value as 'korean' | 'bakery')}
          buttons={[
            { value: 'korean', label: '한식' },
            { value: 'bakery', label: '빵식' },
          ]}
          style={styles.segmented}
        />

        <MealDetailView detail={breakfast[section]} />

        <Text variant="bodySmall" style={[styles.common, { color: theme.colors.onSurfaceVariant }]}>
          {breakfast.common}
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
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  segmented: {
    marginTop: 4,
  },
  common: {
    marginTop: 2,
  },
});
