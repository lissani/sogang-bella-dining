# 크롤링 자동화 - 스케줄러 등록

from apscheduler.schedulers.background import BackgroundScheduler
from pipeline import run_pipeline

scheduler = BackgroundScheduler(timezone="Asia/Seoul")
scheduler.add_job(run_pipeline, "cron", day_of_week="fri", hour=19, minute=0)

# 테스트용
# scheduler.add_job(run_pipeline, "interval", minutes=1)  # 1분마다 실행