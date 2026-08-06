import { StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';

// 부모 컴포넌트에서 전달받을 데이터의 인터페이스
type DateHeaderProps = {
  date: string; // yyyy-mm-dd
  dayOfWeek: string; // "월요일"
  onPrevious: () => void;
  onNext: () => void;
  isFirstDay: boolean;
  isLastDay: boolean;
};

// 데이터를 화면에 표시할 형태로 포맷팅
function formatDisplayDate(date: string, dayOfWeek: string) {
  if (!date) return '';
  return `${date.replaceAll('-', '.')} (${dayOfWeek.charAt(0)})`;
}

export function DateHeader({
  date,
  dayOfWeek,
  onPrevious,
  onNext,
  isFirstDay,
  isLastDay,
}: DateHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text variant="titleLarge" style={[styles.appName, { color: theme.colors.primary }]}>
        오늘 벨밥
      </Text>

      <View style={styles.dateRow}>
        <IconButton
          icon="chevron-left"
          size={22}
          disabled={isFirstDay}
          onPress={onPrevious}
          accessibilityLabel="이전 날짜"
          style={isFirstDay && styles.disabledButton}
        />
        <Text variant="titleMedium" style={styles.dateText}>
          {formatDisplayDate(date, dayOfWeek)}
        </Text>
        <IconButton
          icon="chevron-right"
          size={22}
          disabled={isLastDay}
          onPress={onNext}
          accessibilityLabel="다음 날짜"
          style={isLastDay && styles.disabledButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 4,
    paddingHorizontal: 16,
  },
  appName: {
    textAlign: 'center',
    fontFamily: 'Pretendard-Bold',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  dateText: {
    minWidth: 160,
    textAlign: 'center',
    fontFamily: 'Pretendard-Bold',
  },
  disabledButton: {
    opacity: 0.3,
  },
});
