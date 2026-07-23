# 코드 리뷰 가이드 (오늘 벨밥 - 프론트엔드)

이 문서는 `frontend/` 코드를 처음부터 읽으며 이해하기 위한 가이드입니다.
기술 스택: **Expo (React Native) + Expo Router + TypeScript + React Native Paper**

---

## 1. 실행 방법

```powershell
npm install        # 최초 1회
npm run web         # 웹 브라우저에서 실행 (가장 빠르게 확인 가능)
npm run ios         # iOS 시뮬레이터 (Mac 전용)
npm run android      # Android 에뮬레이터
```

`expo` 명령이 전역에 없어서 `npm run web`(=내부적으로 `expo start --web` 실행) 형태로 씁니다.

---

## 2. 폴더 구조 한눈에 보기

```
frontend/
├── app/                     # 화면 = 파일 (Expo Router의 파일 기반 라우팅)
│   ├── _layout.tsx          # 앱 전체를 감싸는 루트 레이아웃 (Provider들이 여기 모임)
│   ├── modal.tsx            # 예시 모달 화면 (기본 템플릿 잔재, 현재 미사용)
│   └── (tabs)/               # 괄호 폴더 = URL에는 안 드러나는 그룹핑 (하단 탭 그룹)
│       ├── _layout.tsx      # 하단 탭 3개 정의 (식단/출석체크/알림)
│       ├── index.tsx        # "식단" 탭 = 메인 화면
│       ├── attendance.tsx   # "출석체크" 탭 = placeholder
│       └── notifications.tsx# "알림" 탭 = placeholder
│
├── components/
│   ├── meal/                 # 이번에 새로 만든, 식단 화면 전용 컴포넌트들
│   │   ├── DateHeader.tsx      # 상단 "오늘 벨밥" + 날짜 이동 화살표
│   │   ├── BreakfastCard.tsx   # 조식 카드 (한식/베이커리 탭 전환 포함)
│   │   ├── LunchCard.tsx       # 중식 카드 (데이터 없으면 안 그려짐)
│   │   ├── DinnerCard.tsx      # 석식 카드 (미운영일 때 안내문구로 분기)
│   │   ├── MealDetailView.tsx  # 메뉴명+반찬+칼로리 표시 (3곳에서 재사용되는 공통 부품)
│   │   └── ContactFooter.tsx   # 하단 문의처
│   └── (그 외 파일들)          # Expo 기본 템플릿 잔재, 3번 섹션에서 설명
│
├── hooks/
│   └── useWeeklyMenu.ts     # 식단 데이터를 불러오고, 날짜 이동 상태를 관리하는 커스텀 훅
│
├── types/
│   └── menu.ts               # 식단 JSON의 타입 정의 (백엔드 parsed_menu.json 구조와 대응)
│
├── assets/data/
│   └── mock_menu.json        # 개발용 mock 데이터 (백엔드 실제 API 연동 전까지 사용)
│
├── constants/
│   ├── paper-theme.ts        # React Native Paper용 MD3 테마 (브랜드 컬러)
│   └── theme.ts               # Expo 기본 템플릿 테마 (Navigation 컨테이너용, 지금도 사용중)
│
└── app.json / package.json / tsconfig.json  # 설정 파일들
```

---

## 3. 추천 리뷰 순서

아래 순서대로 읽으면 "데이터가 어떻게 화면까지 흘러가는지" 자연스럽게 이해됩니다.

### ① `types/menu.ts` — 데이터 모양부터 파악
식단 JSON이 어떤 구조인지 정의합니다. `DailyMenu` → `meals` → `breakfast`/`lunch_cupbap`/`dinner` 구조를 먼저 눈에 익히면 이후 코드가 다 이 타입을 기준으로 움직인다는 걸 알 수 있습니다.
- `dinner.korean`이 `MealDetail | null`인 것에 주목하세요 — 이게 "석식 미운영" 예외 처리의 핵심입니다.
- `lunch_cupbap`이 `LunchCupbap | null`인 것도 마찬가지로 "주 1회만 제공" 조건부 렌더링의 근거입니다.

### ② `assets/data/mock_menu.json` — 실제 값 확인
타입에 맞는 실제 예시 데이터입니다. 백엔드의 `parsed_menu.json`을 바탕으로 하되, 조건부 렌더링을 눈으로 확인할 수 있도록 **수요일만 중식 컵밥이 있고, 토요일 석식은 미운영으로 임의 조정**했습니다. 실 서비스 연동 시엔 이 파일 대신 백엔드 API 응답을 그대로 씁니다.

### ③ `hooks/useWeeklyMenu.ts` — 상태 관리 로직
- `useEffect`에서 mock 데이터를 로드하고, 오늘 날짜가 데이터에 있으면 오늘로, 없으면 첫째 날로 기본 선택
- `weeklyList`에서 `selectedDate`의 인덱스(`currentIndex`)를 찾아 `currentDayMenu`를 계산
- `goToPreviousDay` / `goToNextDay`: 인덱스 ±1로 날짜 이동, 배열 끝에서는 움직이지 않음
- `isFirstDay` / `isLastDay`: 헤더의 화살표 버튼을 비활성화할지 판단하는 값

여기서 "화면에 뭘 그릴지"는 전혀 모르고, 순수하게 **데이터와 날짜 상태만** 다루는 게 포인트입니다. (관심사 분리)

### ④ `app/(tabs)/index.tsx` — 메인 화면 조립
`useWeeklyMenu()`를 호출해서 받은 값들을 각 컴포넌트에 그대로 전달만 합니다.
```
currentDayMenu 없음 → 로딩 스피너
currentDayMenu 있음 → DateHeader + BreakfastCard + LunchCard + DinnerCard + ContactFooter
```
이 파일만 보면 화면의 "레이아웃 순서"가 한눈에 보이도록 의도적으로 로직 없이 조립만 하게 만들었습니다.

### ⑤ `components/meal/*.tsx` — 각 카드 뜯어보기
- **DateHeader.tsx**: `date`, `dayOfWeek`를 받아 `2026.07.06 (월)` 형태로 포맷(`formatDisplayDate` 함수). 화살표는 `disabled={isFirstDay}` / `disabled={isLastDay}`로 경계 처리.
- **BreakfastCard.tsx**: `useState`로 자체적으로 `한식`/`베이커리` 탭 상태를 들고 있습니다 (다른 카드와 공유하지 않는 로컬 상태). `SegmentedButtons`가 Paper의 세그먼트 컨트롤 컴포넌트입니다.
- **LunchCard.tsx**: `if (!lunch) return null;` — React에서 컴포넌트가 `null`을 리턴하면 아무것도 렌더링되지 않습니다. 이게 "데이터 없는 날 완전히 숨김" 요구사항의 구현입니다.
- **DinnerCard.tsx**: `dinner.korean !== null` 여부로 `isOperating`을 판단해서 정상 메뉴 or 미운영 안내문구 중 하나만 그립니다.
- **MealDetailView.tsx**: `main`(메인메뉴) + `items`(반찬 Chip 리스트) + `calories`를 그리는 재사용 컴포넌트. 조식(한식/베이커리 각각)과 석식에서 총 3번 재사용됩니다 — 그래서 별도 컴포넌트로 뺐습니다.

### ⑥ `app/_layout.tsx`, `app/(tabs)/_layout.tsx` — 레이아웃/네비게이션
- `app/_layout.tsx`: 앱 최상단. `PaperProvider`(Paper 테마 주입) → `ThemeProvider`(React Navigation 테마) → `Stack`(화면 스택, 지금은 `(tabs)`와 `modal` 두 개) 순서로 감쌉니다.
- `app/(tabs)/_layout.tsx`: 하단 탭 3개(`index`=식단, `attendance`=출석체크, `notifications`=알림)를 `Tabs.Screen`으로 등록하고 각각 아이콘을 지정합니다. 파일 이름이 곧 탭의 route가 됩니다 (Expo Router 규칙).

### ⑦ `constants/paper-theme.ts` vs `constants/theme.ts`
두 개가 따로 존재하는 이유: **서로 다른 두 라이브러리의 테마 시스템**이기 때문입니다.
- `paper-theme.ts`: React Native Paper 컴포넌트(Card, Chip, SegmentedButtons 등)의 색상을 정함
- `theme.ts`: React Navigation(`ThemeProvider`)과 기존 템플릿 컴포넌트(`ThemedText`, `ThemedView`)가 쓰는 색상을 정함

지금은 두 시스템이 같이 쓰이고 있어서 다소 중복처럼 보일 수 있는데, 실제 화면(식단 카드들)은 전부 Paper 테마를 따르고, `theme.ts`는 탭 아이콘 색 계산 등 일부 남은 곳에서만 쓰입니다.

---

## 4. Expo 기본 템플릿 잔재 (지금 플로우와 무관한 파일들)

`create-expo-app`으로 프로젝트를 만들 때 기본으로 딸려온 파일들입니다. 삭제하진 않았지만 식단 기능과는 관련 없으니, 리뷰할 때 "왜 이게 있지?" 헷갈리지 않도록 표시해둡니다.

| 파일 | 용도 | 사용 위치 |
|---|---|---|
| `components/themed-text.tsx`, `themed-view.tsx` | 라이트/다크 모드 대응 텍스트·뷰 | `app/modal.tsx`, `components/ui/collapsible.tsx` |
| `components/hello-wave.tsx` | 손 흔드는 이모지 애니메이션 | `app/modal.tsx` |
| `components/parallax-scroll-view.tsx` | 헤더 이미지 패럴랙스 스크롤 | `app/modal.tsx` |
| `components/ui/collapsible.tsx` | 접기/펼치기 UI | `app/modal.tsx` |
| `app/modal.tsx` | 템플릿 예시 모달 화면 | 루트 Stack에 등록만 되어있고 현재 어디서도 링크 안 함 |

→ 나중에 정말 필요 없다고 판단되면 이 파일들과 `app/modal.tsx`를 지워도 무방합니다.

---

## 5. 지금부터 채워야 할 부분 (TODO)

- `hooks/useWeeklyMenu.ts`의 mock 데이터를 실제 백엔드 API 호출로 교체 (`fetch`/`axios` 등)
- `app/(tabs)/attendance.tsx`, `notifications.tsx` — 지금은 "준비 중" placeholder, 실제 기능 설계 필요
- 다크 모드에서 실제로 예쁘게 보이는지 확인 (`constants/paper-theme.ts`의 dark 팔레트)
