import { StyleSheet, View } from 'react-native';
import { Chip, Text, useTheme } from 'react-native-paper';

import { MealDetail } from '@/types/menu';

type MealDetailViewProps = {
  detail: MealDetail;
};

export function MealDetailView({ detail }: MealDetailViewProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text variant="titleMedium" style={styles.main}>
          {detail.main}
        </Text>
        <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
          {detail.calories}
        </Text>
      </View>

      <View style={styles.itemsRow}>
        {detail.items.map(item => (
          <Chip key={item} compact style={styles.chip} textStyle={styles.chipText}>
            {item}
          </Chip>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  main: {
    flexShrink: 1,
    fontFamily: 'Pretendard-SemiBold',
  },
  itemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    height: 32,
  },
  chipText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
