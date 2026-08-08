# app/main.py
import json
import os
import re
from datetime import date as date_type

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from scheduler import scheduler

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 처음엔 전체 허용, 도메인 정해지면 좁히기
    allow_methods=["*"],
    allow_headers=["*"],
)

# main.py 기준 상대경로가 아니라 이 파일 위치 기준 절대경로로 고정
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
# pipeline.py가 "07-06_menu.json" 형태로 저장하므로 그 형식만 골라서 읽는다
MENU_FILENAME_PATTERN = re.compile(r"^\d{2}-\d{2}_menu\.json$")

# 서버가 켜질 때 스케줄러 자동 시작
@app.on_event("startup")
def start_scheduler():
    scheduler.start()
    print("⏰ 크롤링 스케줄러가 성공적으로 시작되었습니다.")

# (참고) 서버가 꺼질 때 스케줄러도 안전하게 종료
@app.on_event("shutdown")
def stop_scheduler():
    scheduler.shutdown()

def _load_all_days() -> list[dict]:
    """data/ 폴더의 모든 주간 메뉴 파일을 읽어 날짜별 항목을 하나의 리스트로 합친다."""
    all_days: list[dict] = []

    if not os.path.isdir(DATA_DIR):
        return all_days

    for filename in os.listdir(DATA_DIR):
        if not MENU_FILENAME_PATTERN.match(filename):
            continue

        file_path = os.path.join(DATA_DIR, filename)
        with open(file_path, encoding="utf-8") as f:
            data = json.load(f)

        all_days.extend(data.get("weekly_menu", []))

    all_days.sort(key=lambda day: day.get("date", ""))
    return all_days


@app.get("/api/menu/weekly")
def get_weekly_menu():
    """저장된 모든 주간 메뉴 데이터를 반환합니다."""
    return {"weekly_menu": _load_all_days()}


@app.get("/api/menu/daily")
def get_daily_menu(
    date: date_type = Query(..., description="조회할 날짜 (YYYY-MM-DD 형식, 예: 2026-07-06)"),
):
    """클라이언트가 요청한 날짜 하나에 해당하는 식단 정보만 반환합니다."""
    date_str = date.isoformat()

    for day in _load_all_days():
        if day.get("date") == date_str:
            return day

    raise HTTPException(
        status_code=404,
        detail=f"{date_str}에 해당하는 식단 정보를 찾을 수 없습니다.",
    )
