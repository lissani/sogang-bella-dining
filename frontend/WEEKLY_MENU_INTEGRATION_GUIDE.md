# `useWeeklyMenu.ts` 프론트-백엔드 연동 가이드

`hooks/useWeeklyMenu.ts`가 mock 데이터 대신 **로컬 FastAPI 서버(`backend/app/main.py`)를 실제로 호출하도록 바뀐 상태**를 기준으로,
① 코드가 정확히 무엇을 하는지, ② 지금 이 상태가 실제로 잘 동작하는지 확인하는 방법을 정리한 문서입니다.

관련 문서: [`CODE_GUIDE.md`](./CODE_GUIDE.md)(프론트 전체 구조), [`backend/BACKEND_GUIDE.md`](../backend/BACKEND_GUIDE.md)(백엔드 자동화 설계), [`backend/API_GUIDE.md`](../backend/API_GUIDE.md)(API 개념 설명)

---

## 1. 전체 흐름

```
[backend/data/*.json]  (크롤링+OCR로 미리 만들어진 주간 식단 파일들)
        │  서버 시작 시 폴더 내 "MM-DD_menu.json" 전부 읽어서 합침
        ▼
[FastAPI 서버] main.py  GET /api/menu/weekly   (http://localhost:8000)
        │  HTTP 요청/응답 (JSON)
        ▼
[프론트] hooks/useWeeklyMenu.ts   useEffect 안에서 fetch
        │  화면에 필요한 상태(선택된 날짜, 현재 메뉴 등)로 가공
        ▼
[프론트] app/(tabs)/index.tsx    화면에 렌더링
```

핵심 변화: 예전에는 `assets/data/mock_menu.json`을 `import`해서 썼지만(주석 처리된 9~10줄, 21~22줄이 그 흔적),
지금은 컴포넌트가 마운트될 때 `fetch`로 **로컬에서 실행 중인 백엔드 서버**에 실제 요청을 보냅니다.

---

## 2. `useWeeklyMenu.ts` 코드 설명

### 상태 선언 (16~17줄)
```ts
const [menuData, setMenuData] = useState<WeeklyMenuResponse | null>(null);
const [selectedDate, setSelectedDate] = useState<string>('');
```
- `menuData`: 서버가 응답한 원본 데이터 전체 (`{ meta, weekly_menu }`). 아직 안 왔으면 `null`.
- `selectedDate`: 사용자가 현재 보고 있는 날짜 (`yyyy-mm-dd` 문자열).

### 데이터 가져오기 (19~41줄)
```ts
useEffect(() => {
  fetch(`${process.env.EXPO_LOCAL_API_URL}/api/menu/weekly`)
    .then(response => {
      if (!response.ok) throw new Error('API 응답 오류: ' + response.status);
      return response.json();
    })
    .then((data: WeeklyMenuResponse) => {
      setMenuData(data);
      const todayStr = new Date().toISOString().split('T')[0];
      const hasToday = data.weekly_menu.some(m => m.date === todayStr);
      setSelectedDate(hasToday ? todayStr : data.weekly_menu[0]?.date ?? '');
    })
    .catch(error => {
      console.error('API 호출 실패:', error);
    });
}, []);
```
- `useEffect(..., [])`: 의존성 배열이 빈 배열이므로 **컴포넌트가 처음 화면에 나타날 때 딱 한 번만** 실행됩니다.
- `fetch(...)`: `${process.env.EXPO_LOCAL_API_URL}` + `/api/menu/weekly` 주소로 GET 요청.
  `.env`에 `EXPO_LOCAL_API_URL=http://localhost:8000`이 정의되어 있으므로 의도상 `http://localhost:8000/api/menu/weekly`를 호출하려는 코드입니다.
  → ⚠️ 이 부분에 실제로 값이 들어가는지는 **3번 섹션에서 반드시 확인**해야 합니다 (아래 참고).
- `response.ok`가 `false`면(4xx/5xx) 직접 에러를 던져서 `.catch`로 보냅니다. fetch는 네트워크 자체가 실패한 경우에만 자동으로 reject하기 때문에, 404/500 같은 HTTP 에러는 이렇게 수동으로 걸러줘야 합니다.
- 응답을 받으면 오늘 날짜(`todayStr`)가 `weekly_menu` 안에 있는지 찾아서, 있으면 오늘로, 없으면 첫 번째 날짜로 `selectedDate`를 초기화합니다.
- 실패하면 지금은 `console.error`만 하고 끝 — 화면에 별도 에러 UI는 없습니다 (`currentDayMenu`가 계속 `undefined`라 로딩 스피너가 무한히 보이게 됨. 6번 트러블슈팅 참고).

### 파생 상태 계산 (43~46줄)
```ts
const weeklyList = menuData?.weekly_menu ?? [];
const currentIndex = weeklyList.findIndex(m => m.date === selectedDate);
const currentDayMenu = currentIndex >= 0 ? weeklyList[currentIndex] : weeklyList[0];
```
- `menuData`가 아직 없으면 `weeklyList`는 빈 배열 → `currentIndex`는 `-1` → `currentDayMenu`도 `undefined`.
- 이 `undefined` 상태를 `index.tsx`가 "로딩 중"으로 판단해서 스피너를 보여줍니다.

### 날짜 이동 함수 (48~56줄)
- `goToPreviousDay` / `goToNextDay`: 현재 인덱스 기준 ±1로 `selectedDate`를 바꿔줍니다. 배열 경계를 벗어나면 아무 동작도 하지 않습니다 (조건문으로 방지).

### 반환값 (58~67줄)
화면(`index.tsx`)이 쓰는 것만 딱 골라서 반환합니다: `meta`, `weeklyList`, `selectedDate`, `currentDayMenu`, `isFirstDay`, `isLastDay`, `goToPreviousDay`, `goToNextDay`.

---

## 3. ⚠️ 실행 전 반드시 확인: 환경변수 접두사 문제

`frontend/.env`:
```
EXPO_PUBLIC_API_URL=https://your-backend-domain.com
EXPO_LOCAL_API_URL=http://localhost:8000
```

Expo(SDK 49+)는 **`EXPO_PUBLIC_` 접두사가 붙은 변수만** 클라이언트 번들에 실제 값으로 주입합니다. 접두사가 없는 변수(`EXPO_LOCAL_API_URL`)는 `app.config.js` 같은 Node 환경(빌드 설정 파일)에서만 읽히고, 앱/웹에서 실행되는 실제 코드(`process.env.EXPO_LOCAL_API_URL`)에서는 **`undefined`로 평가됩니다.**
(이 프로젝트의 `backend/BACKEND_GUIDE.md` 211줄에도 동일한 내용이 명시되어 있습니다.)

즉 지금 코드 그대로 실행하면 `fetch("undefined/api/menu/weekly")`가 되어 요청이 실패할 가능성이 높습니다. 아래 둘 중 하나로 맞춰야 합니다.

**옵션 A — 코드는 그대로 두고 `.env` 변수명을 접두사에 맞게 바꾸기**
```
EXPO_PUBLIC_LOCAL_API_URL=http://localhost:8000
```
그리고 `useWeeklyMenu.ts` 25줄의 `EXPO_LOCAL_API_URL`을 `EXPO_PUBLIC_LOCAL_API_URL`로 수정.

**옵션 B — 기존 `EXPO_PUBLIC_API_URL`을 로컬 주소로 임시 변경**
```
EXPO_PUBLIC_API_URL=http://localhost:8000
```
그리고 코드의 `EXPO_LOCAL_API_URL`을 `EXPO_PUBLIC_API_URL`로 수정 (배포 시 다시 실제 도메인으로 되돌려야 함).

어느 쪽이든 **`.env`를 수정한 뒤에는 Expo 개발 서버를 재시작**해야 반영됩니다 (`.env`는 서버 시작 시점에만 읽힘, 핫리로드로는 안 잡힘).

---

## 4. 로컬에서 실행하기

### ① 백엔드 (터미널 1)
```powershell
cd backend
.\venv\Scripts\Activate.ps1
cd app
uvicorn main:app --reload --port 8000
```
콘솔에 `⏰ 크롤링 스케줄러가 성공적으로 시작되었습니다.` 로그가 뜨고 `Uvicorn running on http://127.0.0.1:8000`이 보이면 정상입니다.

### ② 프론트엔드 (터미널 2)
```powershell
cd frontend
npm install    # 최초 1회
npm run web    # 가장 빠르게 확인 가능
```

---

## 5. 작동 확인 절차 (단계별)

### ① 백엔드 단독으로 먼저 확인 — 프론트 문제인지 백엔드 문제인지 분리
서버를 켠 상태에서 브라우저 주소창에 입력:
```
http://localhost:8000/api/menu/weekly
```
`weekly_menu` 배열이 담긴 JSON이 보이면 백엔드는 정상입니다. `backend/data/`에 있는 `07-06_menu.json`, `07-20_menu.json`, `07-27_menu.json` 세 파일의 내용이 합쳐져서 나와야 합니다.

Swagger 문서(`http://localhost:8000/docs`)에서 `GET /api/menu/weekly`를 "Try it out → Execute"로 실행해도 동일하게 확인 가능합니다.

### ② 프론트에서 실제 요청이 나가는지 확인
`npm run web`으로 실행한 뒤, 브라우저 개발자 도구(F12) → **Network 탭**을 열고 새로고침합니다.
- `weekly` 요청이 보이고 상태가 `200`이면 성공.
- 요청 자체가 `undefined/api/menu/weekly`처럼 이상한 주소로 나가면 → 3번 섹션의 환경변수 문제입니다.
- 요청이 아예 안 보이면 → 컴포넌트가 마운트되지 않았거나 `useEffect`가 실행되지 않은 것이니 `index.tsx`가 화면에 렌더링되고 있는지 먼저 확인하세요.

### ③ 콘솔 로그 확인
개발자 도구 **Console 탭**에 `API 호출 실패: ...` 로그가 있는지 확인합니다. 이 로그가 있다는 것은 `.catch`가 실행됐다는 뜻이므로, 로그에 찍힌 에러 메시지(네트워크 에러 vs. `API 응답 오류: 404`)로 원인을 좁힐 수 있습니다.

### ④ 화면 확인
- 정상: 스피너가 잠깐 보였다가, 오늘 날짜(2026-07-24) 기준 메뉴가 화면에 표시됩니다. 다만 `backend/data`에는 07-06 / 07-20 / 07-27 주차 파일만 있으므로, `weekly_menu`에 `2026-07-24`가 없으면 자동으로 목록의 **첫 번째 날짜**가 대신 선택됩니다 (36줄의 `?? data.weekly_menu[0]?.date` 로직).
- 실패: 스피너가 계속 돌고 멈추지 않습니다 (`currentDayMenu`가 계속 `undefined`이기 때문 — 에러 UI가 아직 없어서 사용자 입장에선 "그냥 안 뜨는" 것처럼 보임).
- 좌우 화살표로 날짜를 이동하며 `weekly_menu` 배열 양 끝에서 화살표가 비활성화되는지도 확인하면 `goToPreviousDay`/`goToNextDay`/`isFirstDay`/`isLastDay`까지 검증됩니다.

---

## 6. 트러블슈팅

| 증상 | 원인 | 해결 |
|---|---|---|
| Network 탭에 `undefined/api/menu/weekly` 요청 | `EXPO_LOCAL_API_URL`에 `EXPO_PUBLIC_` 접두사가 없어 `undefined`로 평가됨 | 3번 섹션 옵션 A/B 적용 후 Expo 서버 재시작 |
| Console에 `Failed to fetch` / `NetworkError` | 백엔드 서버가 안 켜져 있거나 포트가 다름 | 터미널 1에서 uvicorn이 `127.0.0.1:8000`으로 떠 있는지 확인 |
| Console에 `API 응답 오류: 404` | 요청 경로 오타 (`/api/menu/weekly`가 맞음) | `main.py`의 라우트와 fetch 경로 비교 |
| 브라우저에서 CORS 에러 | 발생 가능성 낮음 — `main.py`에서 `allow_origins=["*"]`로 전체 허용 중 | 그래도 뜬다면 백엔드가 실제로 재시작됐는지(코드 반영) 확인 |
| 스피너가 안 멈춤, 콘솔에 에러도 없음 | `.env` 수정 후 Expo 서버를 재시작 안 함 | `.env`는 핫리로드 안 됨 — `npm run web` 재실행 |
| 데이터는 오는데 날짜가 이상함 | `data/` 폴더에 오늘(2026-07-24)이 포함된 주차 파일이 없어 첫 번째 날짜로 대체됨 | 정상 동작 (35~36줄 로직) — 필요하면 해당 주차 파일을 `data/`에 추가 |

---

## 7. 요약 체크리스트

- [ ] `.env`에 `EXPO_PUBLIC_` 접두사 문제 해결 (3번 섹션)
- [ ] 백엔드 `uvicorn` 실행, `http://localhost:8000/api/menu/weekly` 브라우저 직접 접속 확인
- [ ] 프론트 `npm run web` 실행, Network 탭에서 200 응답 확인
- [ ] 화면에 오늘/대체 날짜 메뉴가 정상 표시되는지 확인
- [ ] 날짜 이동 화살표 동작 확인
- [ ] (선택) 백엔드를 잠깐 꺼서 실패 시 화면이 어떻게 되는지도 확인 — 현재는 에러 UI가 없다는 걸 알고 있는 상태로 넘어가기
