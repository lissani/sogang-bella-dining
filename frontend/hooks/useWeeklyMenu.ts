// 상태 관리 로직
// 데이터를 가져오고 관리하는 custom hook
// 화면에 그릴 정보는 다루지 않음
// 순수하게 데이터와 날짜 상태만 다룸

import { useState, useEffect } from 'react';
import { WeeklyMenuResponse, DailyMenu } from '../types/menu';

// // 임시 mock 데이터 import (또는 fetch API 사용)
// import mockData from '../assets/data/mock_menu.json';



export const useWeeklyMenu = () => {
  // 상태 선언
  const [menuData, setMenuData] = useState<WeeklyMenuResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(''); // yyyy-mm-dd

  useEffect(() => {
    // 실서비스 시에는 여기서 backend API 호출
    // const data = mockData as WeeklyMenuResponse;
    // setMenuData(data);

    // localhost 환경에서 API 호출
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/menu/weekly`)
      .then(response => {
        if (!response.ok) {
          throw new Error('API 응답 오류: ' + response.status);
        }
        return response.json();
      })
      .then((data: WeeklyMenuResponse) => {
        setMenuData(data);
        const todayStr = new Date().toISOString().split('T')[0];
        const hasToday = data.weekly_menu.some(m => m.date === todayStr);
        setSelectedDate(hasToday ? todayStr : data.weekly_menu[data.weekly_menu.length - 1]?.date ?? '');
      })
      .catch(error => {
        console.error('API 호출 실패:', error);
      });
  }, []); // 컴포넌트가 처음 마운트될 때 한 번만 실행

  const weeklyList = menuData?.weekly_menu ?? [];
  const currentIndex = weeklyList.findIndex(m => m.date === selectedDate);
  const currentDayMenu: DailyMenu | undefined =
    currentIndex >= 0 ? weeklyList[currentIndex] : weeklyList[0];

  const goToPreviousDay = () => {
    if (currentIndex > 0) setSelectedDate(weeklyList[currentIndex - 1].date);
  };

  const goToNextDay = () => {
    if (currentIndex >= 0 && currentIndex < weeklyList.length - 1) {
      setSelectedDate(weeklyList[currentIndex + 1].date);
    }
  };

  return {
    meta: menuData?.meta,
    weeklyList,
    selectedDate,
    currentDayMenu,
    isFirstDay: currentIndex <= 0,
    isLastDay: currentIndex === -1 || currentIndex === weeklyList.length - 1,
    goToPreviousDay,
    goToNextDay,
  };
};