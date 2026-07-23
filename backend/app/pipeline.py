import os
import json
import traceback
from crawler import check_latest_post_id, fetch_and_save_menu_image
from ocr import ocr_with_google_vision, parse_text_to_json

DATA_DIR = "../data"
LAST_ID_PATH = os.path.join(DATA_DIR, "last_post_id.txt")

def run_pipeline():
    """
    크롤링 -> OCR -> GPT 파싱 파이프라인 함수
    스케줄러에 의해 주기적으로 실행되며, 실패하더라도 스케줄러가 죽지 않도록 예외 처리되어 있습니다.
    """
    print("[Pipeline] 식단 수집 및 파이프라인 시작...")
    
    # data/ 폴더가 없으면 자동 생성
    os.makedirs(DATA_DIR, exist_ok=True)

    try:
        # 1. 최신 게시글 정보 확인 (게시글 ID, 이미지 URL, 포맷팅된 시작 날짜 ex: "07-20")
        post_id, post_link, title = check_latest_post_id()

        # 2. 중복 방지: 이미 처리한 게시글이면 스킵
        if os.path.exists(LAST_ID_PATH):
            with open(LAST_ID_PATH, "r", encoding="utf-8") as f:
                if f.read().strip() == str(post_id):
                    print(f"[Pipeline] 이미 처리된 게시글입니다. (Post ID: {post_id}) - 스킵")
                    return

        print(f"[Pipeline] 새 식단 게시글 감지 (Post ID: {post_id}, 제목: {title})")

        # 3. 이미지 다운로드
        image_path, start_date = fetch_and_save_menu_image(post_link, title)

        # 4. Google Vision OCR 실행
        raw_text = ocr_with_google_vision(image_path)

        # 5. GPT-4o-mini 파싱 실행
        result_json = parse_text_to_json(raw_text)

        # 6. 주차별 JSON 파일 및 Last Post ID 저장
        # 저장 경로 예시: data/07-20_menu.json
        target_file_path = os.path.join(DATA_DIR, f"{start_date}_menu.json")

        with open(target_file_path, "w", encoding="utf-8") as f:
            json.dump(result_json, f, ensure_ascii=False, indent=2)

        with open(LAST_ID_PATH, "w", encoding="utf-8") as f:
            f.write(str(post_id))

        print(f"[Pipeline] 성공적으로 식단 정보가 저장되었습니다: {target_file_path}")

        # (선택) 처리 완료된 다운로드 이미지 파일 삭제/정리
        if os.path.exists(image_path):
            os.remove(image_path)

    except Exception as e:
        # ⚠️ 핵심: 에러가 발생해도 백엔드 서버나 APScheduler가 종료되지 않고 로그만 남김
        print(f"❌ [Pipeline Error] 파이프라인 실행 중 오류가 발생했습니다: {e}")
        # 상세한 에러 트레이스백 출력 (디버깅용)
        traceback.print_exc()


if __name__ == "__main__":
    # 수동 테스트 실행용
    run_pipeline()