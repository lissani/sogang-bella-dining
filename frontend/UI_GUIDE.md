# 프론트엔드 UI 수정 가이드 (오늘 벨밥)

`CODE_GUIDE.md`가 "코드를 읽는" 가이드라면, 이 문서는 "UI를 실제로 고치는" 가이드입니다.
어디를 고치면 화면의 어느 부분이 바뀌는지 목적별로 정리했습니다.

> ⚠️ `AGENTS.md`에 적혀 있듯 Expo 버전이 자주 바뀝니다. 새 컴포넌트/API를 쓸 땐
> https://docs.expo.dev/versions/v54.0.0/ 최신 문서를 먼저 확인하세요.

---

## 0. 수정 전 준비 — 화면 띄워서 실시간으로 확인하기

```powershell
cd frontend
npm run web        # 브라우저에서 실행, 코드 저장하면 자동 반영(Fast Refresh)
```

파일을 저장할 때마다 브라우저가 자동으로 갱신되므로, 코드를 고치면서 바로바로 눈으로 확인하세요.
(iOS/Android 확인이 필요하면 `npm run ios` / `npm run android`)

---

## 1. "무엇을 바꾸고 싶은가"별 수정 위치

### ① 특정 화면의 텍스트·레이아웃 순서를 바꾸고 싶다
→ `app/(tabs)/index.tsx` (식단 메인 화면 조립부)
- 이 파일은 로직 없이 컴포넌트를 순서대로 나열만 합니다.
- 카드 순서를 바꾸고 싶으면 `<BreakfastCard>` / `<LunchCard>` / `<DinnerCard>` 태그 순서를 바꾸면 됩니다.
- 다른 탭 화면: `app/(tabs)/attendance.tsx`(출석체크), `app/(tabs)/notifications.tsx`(알림) — 현재 placeholder라 자유롭게 채워도 됩니다.

### ② 특정 카드(아침/중식/석식)의 디자인을 바꾸고 싶다
→ `components/meal/` 안의 해당 파일
| 바꾸고 싶은 것 | 파일 |
|---|---|
| 상단 날짜 헤더 (제목, 화살표, 날짜 형식) | `components/meal/DateHeader.tsx` |
| 아침 카드 (한식/빵식 탭 포함) | `components/meal/BreakfastCard.tsx` |
| 중식 카드 | `components/meal/LunchCard.tsx` |
| 석식 카드 (미운영 안내 포함) | `components/meal/DinnerCard.tsx` |
| 메뉴명+반찬+칼로리 표시 (3곳에서 공통 재사용) | `components/meal/MealDetailView.tsx` |
| 하단 문의처 | `components/meal/ContactFooter.tsx` |

각 파일은 JSX(화면 구조) + 맨 아래 `StyleSheet.create({...})`(스타일) 두 부분으로 구성되어 있습니다.
- 텍스트/문구를 바꾸려면 JSX 안의 `<Text>` 내용을 수정
- 여백·정렬·크기를 바꾸려면 아래쪽 `styles` 객체 값을 수정 (예: `marginTop`, `padding`, `flexDirection`)

### ③ 전체 앱의 색상(브랜드 컬러, 다크모드)을 바꾸고 싶다
→ `constants/paper-theme.ts`
- 실제 화면(카드들)은 전부 이 테마를 따릅니다. `primary`(포인트 컬러), `background`(배경), `surface`(카드 배경) 등을 수정하면 앱 전체에 반영됩니다.
- `paperLightTheme` = 라이트 모드, `paperDarkTheme` = 다크 모드. 두 개를 각각 맞춰야 합니다.
- 컴포넌트 안에서 색을 쓸 땐 하드코딩하지 말고 `useTheme()`으로 가져온 `theme.colors.xxx`를 사용하세요 (다크모드 자동 대응).
  ```tsx
  const theme = useTheme();
  <Text style={{ color: theme.colors.primary }}>...</Text>
  ```
- 참고: `constants/theme.ts`는 별개 시스템(React Navigation + 탭 아이콘 색)이라 손댈 일이 거의 없습니다. 자세한 차이는 `CODE_GUIDE.md` 3-⑦ 참고.

### ④ 하단 탭(아이콘, 이름, 개수)을 바꾸고 싶다
→ `app/(tabs)/_layout.tsx`
- `<Tabs.Screen name="..." options={{ title: '탭 이름', tabBarIcon: ... }} />` 블록 하나가 탭 하나
- 아이콘은 `MaterialCommunityIcons` 이름 문자열만 바꾸면 됨 (아이콘 목록: https://icons.expo.fyi/)
- 탭을 추가하려면: `app/(tabs)/` 안에 새 파일(예: `profile.tsx`)을 만들고, 여기에 `<Tabs.Screen name="profile" .../>` 추가

### ⑤ 재사용 가능한 새 UI 부품을 만들고 싶다
→ `components/meal/` (식단 관련이면 이 폴더에), 그 외 공통 UI는 `components/ui/`
- 기존 카드 컴포넌트(`BreakfastCard.tsx` 등) 구조를 그대로 참고해서 만들면 스타일 일관성 유지가 쉽습니다.
- 라이브러리는 **React Native Paper**를 씁니다 (`Card`, `Text`, `Chip`, `SegmentedButtons`, `IconButton` 등). 새 컴포넌트도 기본 `View`/`Text` 대신 Paper 컴포넌트를 우선 사용하세요.

---

## 2. 자주 하는 수정 예시

**예시 1 — "아침" 카드의 이모지/제목 바꾸기**
`components/meal/BreakfastCard.tsx` 21번째 줄 근처:
```tsx
<Text variant="titleLarge">🍳 아침</Text>
```
텍스트나 이모지를 원하는 값으로 교체.

**예시 2 — 카드 사이 간격 넓히기**
각 카드 파일 하단 `styles.card`의 `marginTop` 값을 늘리면 됩니다.
```tsx
card: {
  marginHorizontal: 16,
  marginTop: 16,   // ← 이 값을 키우면 카드 위 간격이 늘어남
},
```

**예시 3 — 브랜드 포인트 컬러 바꾸기**
`constants/paper-theme.ts`의 `primary: '#C4622D'` 값을 원하는 색상 코드로 교체 (라이트/다크 둘 다).

**예시 4 — 날짜 표시 형식 바꾸기** (예: `2026.07.06 (월)` → `07/06 (월)`)
`components/meal/DateHeader.tsx`의 `formatDisplayDate` 함수 로직만 수정.

---

## 3. 확인 체크리스트

- [ ] `npm run web`으로 라이트 모드 확인
- [ ] OS/브라우저 다크모드로 전환해서 `paperDarkTheme` 색상도 확인
- [ ] 데이터가 없는 경우(예: 석식 미운영일, 중식 컵밥 없는 날)도 깨지지 않는지 확인 — `assets/data/mock_menu.json`에서 날짜별로 다른 케이스를 테스트할 수 있음
- [ ] 텍스트를 길게 넣어봤을 때 레이아웃이 깨지지 않는지 확인

---

## 4. 더 깊이 알고 싶다면

- 데이터가 화면까지 어떻게 흘러가는지(하단 탭 → 화면 → 카드 → 데이터) 전체 구조는 `CODE_GUIDE.md` 참고
- Expo 최신 API 문법은 `AGENTS.md`에 명시된 버전별 공식 문서 확인
