# 백엔드 자동화 + 프론트 연동 가이드 (오늘 벨밥)

지금 `backend/`에는 "수동으로 실행하는 스크립트 2개"만 있습니다.
이 문서는 이걸 **자동으로 돌아가는 서버**로 만들고, 프론트(mock 데이터)를 **실제 API**로 교체하는 방법을 단계별로 정리합니다.

---

## 0. 지금 상태 정확히 파악하기

```
[사람이 직접 실행] python crawling.py
      → 게시판에서 최신 글 찾기 → 이미지 다운로드 (downloaded_menus/menu_image.jpg)

[사람이 직접 실행] python menu_ocr.py
      → 이미지 → Google Vision OCR → GPT-4o-mini로 JSON 파싱 → parsed_menu.json 저장

[프론트] hooks/useWeeklyMenu.ts
      → parsed_menu.json이 아니라 assets/data/mock_menu.json(수동으로 복사해둔 목데이터)을 import
```

즉 지금은 **서버가 없고, 자동 실행도 없고, 프론트와 연결도 안 되어 있는** 상태입니다. 이 세 가지가 이번에 채워야 할 부분입니다.

바꾸기 전에 짚고 넘어가야 할 기존 코드의 문제 2가지:
- `crawling.py`는 실행할 때마다 최신 글의 이미지를 **무조건 다시 다운로드**합니다 (파일 하단 TODO 주석 "중복 다운로드 방지"가 이미 이걸 가리키고 있음). 자동화하면 하루에도 여러 번 돌 수 있으니, 새 글인지 먼저 확인하는 로직이 꼭 필요합니다.
- `menu_ocr.py`의 `KEY_PATH`가 `C:\Users\lissa\...` 같은 **로컬 절대경로로 하드코딩**되어 있습니다. 서버에 배포하면 이 경로가 존재하지 않으므로, 환경변수 기반으로 바꿔야 합니다.

---

## 1. 목표 아키텍처

```
┌─────────────┐   주기적 트리거   ┌───────────────────────────┐
│  스케줄러    │ ───────────────▶ │ 파이프라인                  │
│ (APScheduler │                  │ 크롤링 → OCR → GPT 파싱     │
│  / cron)     │                  └─────────────┬─────────────┘
└─────────────┘                                  │ 성공 시에만 덮어씀
                                                  ▼
                                        data/parsed_menu.json
                                                  │
                                                  ▼
                                     ┌─────────────────────────┐
                                     │ FastAPI 서버              │
                                     │ GET /api/menu/weekly     │
                                     └─────────────┬─────────────┘
                                                  │ HTTP
                                                  ▼
                                     프론트 hooks/useWeeklyMenu.ts
                                     (mock import 대신 fetch)
```

핵심 원칙: **파이프라인이 실패해도 API는 항상 마지막으로 성공한 데이터를 돌려줘야 함.** (크롤링 사이트 구조가 바뀌거나 GPT 응답이 스키마를 못 맞추는 경우가 실제로 생김 — 그때 앱이 빈 화면을 보여주면 안 됨)

---

## 2. 폴더 구조 재정리

```
backend/
├── app/
│   ├── main.py         # FastAPI 앱 진입점 + CORS + 라우터 등록
│   ├── crawler.py       # 기존 crawling.py (게시판 크롤링)
│   ├── ocr.py            # 기존 menu_ocr.py (OCR + GPT 파싱)
│   ├── pipeline.py       # crawler+ocr을 묶어서 "한 번 실행" 단위로 만든 함수
│   ├── scheduler.py      # 자동 실행 스케줄 등록
│   └── menu_schema.py    # 기존 파일 그대로
├── data/
│   ├── parsed_menu.json  # API가 실제로 응답하는 "현재 최신" 데이터
│   └── last_post_id.txt  # 마지막으로 처리한 게시글 번호 (중복 방지용)
├── requirements.txt      # 지금 비어있음 → 채워야 함
└── .env
```

---

## 3. 단계별 구현

### ① `requirements.txt` 채우기
지금 코드가 실제로 쓰는 라이브러리 + 새로 필요한 것들:
```
requests
beautifulsoup4
google-cloud-vision
openai
python-dotenv
fastapi
uvicorn[standard]
apscheduler
```

### ② 크롤링 + OCR을 "파이프라인 함수" 하나로 묶기
`crawling.py`의 `get_latest_menu()`를 **"새 글 여부와 이미지 경로를 반환하도록"** 바꾸고, `pipeline.py`에서 아래 흐름으로 조립합니다.

```python
# app/pipeline.py
from app.crawler import get_latest_post_info, download_menu_image
from app.ocr import ocr_with_google_vision, parse_text_to_json
import json, os

LAST_ID_PATH = "data/last_post_id.txt"
OUTPUT_PATH = "data/parsed_menu.json"

def run_pipeline():
    post_id, image_url = get_latest_post_info()

    # 중복 방지: 이미 처리한 글이면 스킵
    if os.path.exists(LAST_ID_PATH):
        with open(LAST_ID_PATH) as f:
            if f.read().strip() == post_id:
                print("새 글 없음, 스킵")
                return

    image_path = download_menu_image(image_url)
    raw_text = ocr_with_google_vision(image_path)
    result_json = parse_text_to_json(raw_text)

    # 성공했을 때만 덮어쓰기 (실패해도 기존 데이터는 유지됨)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(result_json, f, ensure_ascii=False, indent=2)
    with open(LAST_ID_PATH, "w") as f:
        f.write(post_id)
```
`try/except`로 감싸서 실패 시 로그만 남기고 조용히 넘어가게 하세요 — 새벽에 자동 실행되는 코드가 죽어서 스케줄러 자체가 멈추면 안 됩니다.

### ③ FastAPI로 API 서버 열기
```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 처음엔 전체 허용, 도메인 정해지면 좁히기
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/menu/weekly")
def get_weekly_menu():
    with open("data/parsed_menu.json", encoding="utf-8") as f:
        return json.load(f)
```
실행: `uvicorn app.main:app --reload --port 8000`
브라우저에서 `http://localhost:8000/api/menu/weekly` 접속해서 JSON이 나오면 성공.

### ④ 크롤링 자동화 — 스케줄러 등록
```python
# app/scheduler.py
from apscheduler.schedulers.background import BackgroundScheduler
from app.pipeline import run_pipeline

scheduler = BackgroundScheduler(timezone="Asia/Seoul")
scheduler.add_job(run_pipeline, "cron", day_of_week="mon", hour=9, minute=0)
```
```python
# app/main.py 에 추가
from app.scheduler import scheduler

@app.on_event("startup")
def start_scheduler():
    scheduler.start()
    run_pipeline()  # 서버 켜질 때 한 번 즉시 실행 (최신 상태 보장)
```
> 학교가 식단표를 보통 주 단위로 올린다면 `cron` 주기를 그에 맞추면 되고, 언제 올라올지 불확실하면 `hour="*/6"` 같이 짧게 잡아서 "새 글 있으면만 처리"하는 ②의 중복 방지 로직에 맡기는 게 안전합니다.

### ⑤ 자격증명(API 키) 서버 배포에 맞게 정리
- `menu_ocr.py`의 하드코딩된 `KEY_PATH`를 제거하고 환경변수로:
  ```python
  KEY_PATH = os.environ["GOOGLE_APPLICATION_CREDENTIALS_PATH"]
  ```
- `.env`에 `OPENAI_API_KEY`와 함께 추가:
  ```
  OPENAI_API_KEY=...
  GOOGLE_APPLICATION_CREDENTIALS_PATH=./google_key.json
  ```
- `google_key.json`, `.env`는 이미 `.gitignore`에 있으니 그대로 유지 (배포 플랫폼에는 파일 업로드 또는 환경변수로 별도 등록).

### ⑥ 배포처 정하기
서버가 24시간 켜져 있어야 스케줄러도 돌고 앱도 API를 호출할 수 있습니다. 학생 프로젝트 규모에는:
- **Railway / Render / Fly.io** — 무료/저가 티어로 FastAPI 앱을 그대로 올릴 수 있고, 운영 부담이 가장 적음 (추천)
- 학교나 개인 VPS가 있다면 `uvicorn`을 `systemd` 서비스로 등록 + `cron`으로 파이프라인 실행도 가능 (APScheduler 대신 서버 cron 사용 — 프로세스 재시작에 더 안전)

### ⑦ 프론트를 mock → 실제 API로 연결
`hooks/useWeeklyMenu.ts`에서 mock import를 제거하고 fetch로 교체:
```ts
// frontend/.env
EXPO_PUBLIC_API_URL=https://your-backend-domain.com
```
```tsx
// hooks/useWeeklyMenu.ts
const [menuData, setMenuData] = useState<WeeklyMenuResponse | null>(null);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/menu/weekly`)
    .then(res => {
      if (!res.ok) throw new Error(`API 응답 오류: ${res.status}`);
      return res.json();
    })
    .then((data: WeeklyMenuResponse) => {
      setMenuData(data);
      const todayStr = new Date().toISOString().split('T')[0];
      const hasToday = data.weekly_menu.some(m => m.date === todayStr);
      setSelectedDate(hasToday ? todayStr : data.weekly_menu[0]?.date ?? '');
    })
    .catch(err => setError(err.message));
}, []);
```
`EXPO_PUBLIC_` 접두사가 붙은 환경변수는 Expo가 클라이언트 번들에 그대로 노출시켜주는 방식입니다 (별도 설정 불필요).

`app/(tabs)/index.tsx`의 로딩 가드(`if (!currentDayMenu)`)에 에러 상태 분기도 추가해서, API 호출 실패 시 "메뉴를 불러올 수 없습니다" 같은 안내를 보여주는 게 좋습니다 (지금은 로딩 스피너만 있고 에러 UI가 없음).

---

## 4. 타입 동기화 주의점

`backend/menu_schema.py`(GPT에 강제하는 JSON 스키마)와 `frontend/types/menu.ts`(TS 타입)는 **같은 구조를 두 번 손으로 유지**하고 있습니다. 스키마 필드를 바꾸면 반드시 타입도 같이 수정하세요 — 둘 중 하나만 바꾸면 프론트에서 조용히 `undefined` 참조 에러가 납니다.

---

## 5. 진행 체크리스트

- [ ] `requirements.txt` 채우고 `pip install -r requirements.txt`로 재설치 확인
- [ ] `crawling.py` → 새 글 여부 판단 가능하도록 리팩터링 (post_id 반환)
- [ ] `pipeline.py`로 크롤링+OCR+파싱 통합, 실패해도 기존 `parsed_menu.json` 유지되는지 확인
- [ ] FastAPI `/api/menu/weekly` 로컬에서 정상 응답 확인
- [ ] 스케줄러 등록 + 수동으로 날짜 앞당겨서 자동 실행 테스트
- [ ] `GOOGLE_APPLICATION_CREDENTIALS_PATH` 환경변수로 전환, 하드코딩 경로 제거
- [ ] 배포 플랫폼 선정 후 실제 배포, 외부에서 API URL 접속 확인
- [ ] 프론트 `EXPO_PUBLIC_API_URL` 연결 + mock import 제거
- [ ] API 실패 시 프론트 에러 UI 확인 (서버 잠깐 내려보고 테스트)

---

## 6. 지금 당장 전부 다 안 해도 괜찮은 이유

한 번에 다 구현하지 말고 **①②③번(파이프라인 정리 + API 서버)까지만** 먼저 끝내서 로컬에서 프론트-백엔드 연결을 확인하는 걸 추천합니다. 스케줄러(④)와 배포(⑥)는 "서버가 항상 켜져있어야 의미가 있는" 단계라, 로컬 개발이 끝난 뒤 붙여도 늦지 않습니다.
