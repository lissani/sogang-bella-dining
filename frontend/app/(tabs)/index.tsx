// 메인 화면 조립
// 화면의 레이아웃 순서를 알 수 있도록

import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BreakfastCard } from '@/components/meal/BreakfastCard';
import { ContactFooter } from '@/components/meal/ContactFooter';
import { DateHeader } from '@/components/meal/DateHeader';
import { DinnerCard } from '@/components/meal/DinnerCard';
import { LunchCard } from '@/components/meal/LunchCard';
import { useWeeklyMenu } from '@/hooks/useWeeklyMenu'; // 받은 날짜와 데이터 값을 컴포넌트에 그대로 전달

export default function MealScreen() {
  const theme = useTheme(); // react natvie paper의 theme 사용
  const {
    meta,
    selectedDate,
    currentDayMenu,
    isFirstDay,
    isLastDay,
    goToPreviousDay,
    goToNextDay,
  } = useWeeklyMenu(); // 커스텀 훅에서 필요한 데이터와 상태 조작 함수 불러옴

  if (!currentDayMenu) { // 로딩 상태 가드
    return (
      <SafeAreaView style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator animating size="large" /> // 로딩 애니메이션
      </SafeAreaView>
    );
  }

  return (
    // 안전 여백 확보
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <DateHeader
        date={selectedDate}
        dayOfWeek={currentDayMenu.day_of_week}
        onPrevious={goToPreviousDay}
        onNext={goToNextDay}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <BreakfastCard breakfast={currentDayMenu.meals.breakfast} />
        <LunchCard lunch={currentDayMenu.meals.lunch_cupbap} />
        <DinnerCard dinner={currentDayMenu.meals.dinner} />

        <View style={styles.footerSpacer} />
        <ContactFooter meta={meta} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 16,
  },
  footerSpacer: {
    height: 8,
  },
});
