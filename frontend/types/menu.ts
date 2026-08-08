// 식단 json 구조 정의

export interface MealDetail {
  main: string;
  items: string[];
  calories: string;
}

export interface Breakfast {
  korean: MealDetail;
  bakery: MealDetail;
  common: string;
}

export interface LunchCupbap {
  time: string;
  menu: string;
}

export interface Dinner {
  korean: MealDetail | null;
  info?: string; // "토요일 석식 미운영" 등 안내 문구
  common_beverage?: string;
}

export interface DailyMenu {
  date: string; // yyyy-mm-dd
  day_of_week: string; // "월요일" 등
  meals: {
    breakfast: Breakfast | null;
    lunch_cupbap: LunchCupbap | null;
    dinner: Dinner | null;
  };
}

export interface WeeklyMenuResponse {
  meta: {
    title: string;
    period: string;
    institution: string;
    provider: string;
    contacts: {
      phone: string;
      email: string;
    };
  };
  weekly_menu: DailyMenu[];
}
