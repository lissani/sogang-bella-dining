# 🍚 오늘 벨밥 | Today Bella Dining

**서강대학교 기숙사(벨라르미노 학사) 주간 식단표를 자동으로 수집·파싱해서 보여주는 모바일 앱**

> 기숙사 게시판에는 매주 식단표가 "이미지 한 장"으로만 올라옵니다. 학생들은 매번 게시판에 들어가 흐릿한 표를 확대해가며 오늘 뭐가 나오는지 확인해야 했습니다.
오늘 벨밥은 이 과정을 자동화합니다 — 게시판을 주기적으로 크롤링하고, OCR과 LLM으로 이미지를 구조화된 JSON으로 변환한 뒤, 앱에서 날짜별로 조식/컵밥/석식을 스와이프로 넘겨보게 해줍니다.

**An app that automatically collects and parses the weekly dining hall menu for Sogang University's dormitory (Bella House), so students don't have to squint at a blurry board image every week.**

> The dorm's weekly menu is posted to a bulletin board as a single image. Today Bella Dining scrapes the board on a schedule, turns the image into structured JSON via OCR + an LLM, and serves it to a mobile app where students can swipe through breakfast/lunch/dinner by day.

---

## 🎨 Screenshot

| 일반 케이스 | 주 1회 점심 컵밥 제공 | 주 1회 석식 미제공 |
| :---: | :---: | :---: |
| <img width="250" alt="일반 케이스" src="https://github.com/user-attachments/assets/a81b30ee-01bb-40d0-92c7-19f227d3fb27" /> | <img width="250" alt="주 1회 점심 컵밥 제공" src="https://github.com/user-attachments/assets/15735f6d-8c98-4275-8ace-d02250720158" /> | <img width="250" alt="주 1회 석식 미제공" src="https://github.com/user-attachments/assets/a9c9f4d3-7754-403c-8e18-21cfe5e10768" /> |

---

## 📌 Key Features

- **완전 자동화된 식단 수집 파이프라인**: 크롤링 → OCR → GPT 파싱까지 사람 개입 없이 주기적으로 실행
- **중복 처리 방지**: 마지막으로 처리한 게시글 ID를 기록해, 같은 글을 반복 처리하지 않음
- **장애 허용(Fail-safe) 설계**: 크롤링/OCR/파싱 중 어디서든 실패해도 서버는 죽지 않고, 마지막으로 성공한 식단 데이터를 그대로 제공
- **날짜별 조회 API**: 주간 전체 조회(`/api/menu/weekly`)와 특정 날짜 단건 조회(`/api/menu/daily`) 지원
- **스와이프 기반 날짜 탐색 UI**: 좌우 스와이프로 조식/컵밥(런치)/석식 카드를 날짜별로 전환
- **라이트/다크 모드 대응**: Notion 스타일의 모노크롬 테마를 라이트·다크 두 버전으로 구현

---

## 🏗 System Architecture

```
┌──────────────┐   매주 금 19:00 자동 트리거   ┌──────────────────────────────┐
│  APScheduler  │ ───────────────────────────▶ │        Pipeline               │
│  (BackgroundScheduler) │                     │ 1. 게시판 크롤링 (BeautifulSoup) │
└──────────────┘                               │ 2. 식단 이미지 다운로드          │
                                                │ 3. Google Cloud Vision OCR     │
                                                │ 4. GPT-4o-mini 로 JSON 파싱     │
                                                └───────────────┬───────────────┘
                                                                │ 성공 시에만 덮어쓰기
                                                                ▼
                                                  data/{MM-DD}_menu.json
                                                                │
                                                                ▼
                                                ┌──────────────────────────────┐
                                                │  FastAPI                      │
                                                │  GET /api/menu/weekly         │
                                                │  GET /api/menu/daily?date=    │
                                                └───────────────┬───────────────┘
                                                                │ HTTPS
                                                                ▼
                                                Expo React Native App
                                                (hooks/useWeeklyMenu.ts)
```

> 핵심 설계 원칙: **파이프라인 어느 단계가 실패하더라도 API는 항상 마지막으로 성공한 데이터를 반환해야 한다.** 크롤링 대상 게시판의 HTML 구조가 바뀌거나 LLM이 스키마를 못 맞추는 경우가 실제로 발생하기 때문에, 실패는 로그로만 남기고 기존 데이터는 그대로 유지합니다.

---

## 🛠 Tech Stack

**Backend**
- Python, FastAPI, Uvicorn
- BeautifulSoup4 + requests — 게시판 크롤링
- Google Cloud Vision API — 이미지 → 텍스트 OCR
- OpenAI GPT-4o-mini (Structured Outputs / JSON Schema) — OCR 텍스트를 정형화된 JSON으로 파싱
- APScheduler — 주기적 파이프라인 실행

**Frontend**
- React Native (Expo, Expo Router — file-based routing)
- TypeScript
- React Native Paper (Material Design 3, 커스텀 Notion 스타일 테마)
- react-native-gesture-handler / react-native-reanimated — 스와이프 제스처

---

## 📂 Project Structure

```
Bella_Dining/
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI 앱 진입점, CORS, 라우터
│   │   ├── crawler.py      # 게시판 크롤링 (BeautifulSoup)
│   │   ├── ocr.py          # Google Vision OCR + GPT-4o-mini JSON 파싱
│   │   ├── pipeline.py     # 크롤링 → OCR → 파싱을 하나의 실행 단위로 묶음
│   │   ├── scheduler.py    # APScheduler 주기 실행 등록
│   │   └── menu_schema.py  # GPT에 강제하는 JSON 스키마 정의
│   ├── data/                # 주차별 파싱 결과 (MM-DD_menu.json) + 마지막 처리 게시글 ID
│   └── requirements.txt
│
└── frontend/
    ├── app/(tabs)/          # 식단 / 출석체크 / 알림 탭 (Expo Router)
    ├── components/meal/     # DateHeader, BreakfastCard, LunchCard, DinnerCard 등
    ├── hooks/useWeeklyMenu.ts  # API 호출 + 날짜 상태 관리 커스텀 훅
    ├── types/menu.ts         # 백엔드 JSON 스키마와 대응되는 TS 타입
    └── constants/paper-theme.ts  # 라이트/다크 커스텀 테마
```

---

## 🔌 API Endpoints

| Method | Path | 설명 |
|---|---|---|
| GET | `/api/menu/weekly` | 저장된 모든 주간 식단 데이터를 반환 |
| GET | `/api/menu/daily?date=YYYY-MM-DD` | 지정한 날짜 하나의 식단만 반환 (없으면 404) |


---

## 🚀 Getting Started

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt

# .env에 OPENAI_API_KEY, GOOGLE_APPLICATION_CREDENTIALS 설정 필요

cd app
uvicorn main:app --reload
# → http://127.0.0.1:8000/api/menu/weekly
```

### Frontend

```bash
cd frontend
npm install
npx expo start
```

---

## 🔭 Future Work

- 출석체크 / 알림 탭 기능 구현 (현재 UI만 존재)
- 크롤링 대상 게시판 구조 변경에 대비한 알림/모니터링
- 배포 자동화 (백엔드 상시 배포 + 스케줄러 운영)
