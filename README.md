1. 라이브러리 설치

* 서비스 요약
- 게시판 크롤링 -> 식단 이미지 저장
- 식단 이미지 -> ocr 텍스트 추출 -> json 파싱
- json 식단 데이터 -> 앱 UI

BELLA_DINING/
├── backend/                  <-- [기존 파이썬 데이터 파이프라인 전면 배치]
│   ├── downloaded_menus/
│   │   └── menu_image.jpg
│   ├── venv/
│   ├── .env
│   ├── .gitignore
│   ├── crawling.py
│   ├── google_key.json
│   ├── menu_ocr.py
│   ├── menu_schema.py
│   ├── mock_menu.json
│   ├── ocr_result.txt
│   ├── parsed_menu.json      <-- 이 정제된 JSON이 앱으로 들어가야 함!
│   └── requirements.txt
│
├── frontend/                 <-- [새로 생성할 Expo 앱 영역]
│   ├── assets/               <-- 앱 로고, 아이콘 등 이미지
│   ├── src/
│   │   ├── components/       <-- 공통 UI 컴포넌트 (버튼, 식단 카드 등)
│   │   ├── screens/          <-- 앱의 각 화면 (메인 화면, 달력 화면 등)
│   │   └── services/         <-- API 통신 및 데이터 로드 로직
│   ├── App.js / App.tsx      <-- 앱의 진입점
│   ├── package.json          <-- 앱 라이브러리 관리 파일
│   └── app.json              <-- Expo 설정 파일 (앱 이름, 버전 등)
│
└── README.md                 <-- 프로젝트 전체 개요