import { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, UIManager, View } from 'react-native';
import { Card, Divider, Text, useTheme } from 'react-native-paper';

import { Breakfast } from '@/types/menu';
import { MealDetailView } from './MealDetailView';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type BreakfastCardProps = {
  breakfast: Breakfast | null;
};

export function BreakfastCard({ breakfast }: BreakfastCardProps) {
  const theme = useTheme();
  // 상태 관리 - 한식 vs 빵식 선택
  const [section, setSection] = useState<'korean' | 'bakery'>('korean');

  const handleSectionChange = (value: 'korean' | 'bakery') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSection(value);
  };

  // 기숙사 미운영 등 비정기 사유로 breakfast 자체가 없거나(null),
  // 객체는 있지만 실제 메뉴 데이터가 비어있는 날은 카드를 표시하지 않는다.
  const isEmpty = !breakfast || (!breakfast.korean.main && !breakfast.bakery.main);
  if (isEmpty) {
    return null;
  }

  return (
    <Card mode="elevated" style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.headerRow}>
          <Text variant="titleLarge" style={styles.headerLeft}>🍳 아침</Text>
          <Text variant="bodyMedium" style={[styles.headerCenter, { color: theme.colors.onSurfaceVariant }]}>
            07:30 - 09:30
          </Text>
          <Text variant="labelLarge" style={[styles.headerRight, { color: theme.colors.primary }]}>
            {breakfast[section].calories}
          </Text>
        </View>

        <Divider />

        <View style={[styles.segmentTrack, { backgroundColor: theme.colors.surfaceVariant }]}>
          {(['korean', 'bakery'] as const).map(value => {
            const selected = section === value;
            return (
              <Pressable
                key={value}
                onPress={() => handleSectionChange(value)}
                style={[
                  styles.segmentButton,
                  selected && [styles.segmentButtonActive, { backgroundColor: theme.colors.surface }],
                ]}>
                <Text
                  variant="labelLarge"
                  style={{
                    color: selected ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
                    fontFamily: selected ? 'Pretendard-SemiBold' : 'Pretendard-Medium',
                  }}>
                  {value === 'korean' ? '한식' : '빵식'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <MealDetailView detail={breakfast[section]} common={breakfast.common} />
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
  segmentTrack: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
});
