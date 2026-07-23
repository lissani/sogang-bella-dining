import os
import json
from menu_schema import json_schema

# 두 라이브러리 모두 os.environ에 등록된 api key를 찾아 쓰므로 보안상 안전
from google.cloud import vision # google OCR 엔진 사용을 위한 SDK
from openai import OpenAI
from dotenv import load_dotenv


def ocr_with_google_vision(image_path):
    """
    1단계: Google Cloud Vision API를 사용

    - 이미지 파일 경로를 받아 구글 서버에 전송
    - 추출된 전체 텍스트를 문자열로 반환
    """
    load_dotenv() # .env 파일에서 환경변수 읽기

    # 환경변수에서 키 경로 가져오기 (기본값 설정)
    key_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "./google_key.json")
    
    if not os.path.isabs(key_path):
        # ocr.py의 상위 폴더(backend/) 기준으로 경로 재설정
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # backend/ 폴더
        possible_path = os.path.join(base_dir, os.path.basename(key_path))
        
        if os.path.exists(possible_path):
            key_path = possible_path

    if not os.path.exists(key_path):
        raise FileNotFoundError(f"Google 자격 증명 키 파일을 찾을 수 없습니다: {key_path}")

    # Google SDK에 환경변수 등록
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = key_path
    
    # 인증 정보를 환경변수에서 자동으로 인식하도록 클라이언트 생성
    client = vision.ImageAnnotatorClient()

    with open(image_path, "rb") as image_file:
        content = image_file.read()
    
    image = vision.Image(content=content)

    # text_detection
    # 구글 서버로 이미지 내 텍스트 감지 요청
    # document_text_detection -> 글자가 빽빽한 이미지에 좋음
    response = client.document_text_detection(image=image)
    annotations = response.text_annotations

    if not annotations:
        raise Exception("이미지에서 텍스트를 인식하지 못했습니다.")

    full_text = annotations[0].description # OCR 결과 배열 0번째 인덱스에 글자들이 문자열로 들어있음
    return full_text

def parse_text_to_json(ocr_text):
    """
    2단계: OpenAI GPT-4o-mini를 사용하여 OCR 텍스트를 JSON 스키마 규격으로 파싱
    """

    # ① OpenAI 클라이언트 객체를 생성합니다.
    load_dotenv()

    # OPENAI_API_KEY 환경변수 확인
    if not os.getenv("OPENAI_API_KEY"):
        raise ValueError("OPENAI_API_KEY 환경변수가 설정되지 않았습니다.")
    
    client = OpenAI()

    # ② GPT에게 내릴 명령(Prompt)을 작성합니다. f-string을 사용해 구글 OCR 텍스트를 삽입합니다.
    prompt = f"너는 식단표 파싱 전문가야. 아래의 텍스트는 격자 형태의 주간 식단표 이미지를 OCR로 추출한 로우(Raw) 데이터야. 요일별, 끼니별(조식, 컵밥, 석식) 문맥을 파악해서 정해진 스키마 규칙대로 JSON 데이터를 만들어 줘.\n\n[OCR TEXT]:\n{ocr_text}"

    # ③ GPT API를 호출합니다.
    response = client.chat.completions.create(
        model="gpt-4o-mini", # 가성비가 가장 좋고 속도가 빠른 모델 선택
        messages=[
            {"role": "system", "content": "제공된 JSON 스키마 구조에 완벽히 들어맞는 정밀한 데이터만 출력하세요."},
            {"role": "user", "content": prompt}
        ],
        # 🔥 이 코드가 치트키입니다. 위에서 정의한 스키마 구조를 모델에 주입하여 JSON 출력을 강제합니다.
        response_format={"type": "json_schema", "json_schema": json_schema},
        temperature=0.1 # 값이 낮을수록 모델이 소설을 쓰지 않고 팩트에만 기반해 똑같이 출력합니다.
    )

    # ④ GPT가 응답한 내용(문자열 형태의 JSON)을 파이썬의 딕셔너리(Dict) 객체로 변환하여 리턴합니다.
    result_json = json.loads(response.choices[0].message.content)
    return result_json

# hardcoding_url = "downloaded_menus/menu_image.jpg"
# full_text = ocr_with_google_vision(hardcoding_url)
# print(full_text)

# if __name__ == "__main__":
#     IMAGE_PATH = "downloaded_menus/menu_image.jpg"

#     try:
#         print("1단계: google cloud vision ocr")
#         raw_text = ocr_with_google_vision(IMAGE_PATH)
#         print("ocr 완료. 추출 텍스트 크기:", len(raw_text))

#         print("2단계: llm 기반 json 구조 생성")
#         final_menu_json = parse_text_to_json(raw_text)
#         print("json 파싱 완료")

#         # 3. 파싱이 완료된 파이썬 딕셔너리 데이터를 파일로 깔끔하게 저장하기
#         with open("parsed_menu.json", "w", encoding="utf-8") as f:
#             # ensure_ascii=False를 줘야 한글이 \u003c 처럼 깨지지 않고 이쁘게 저장됩니다.
#             json.dump(final_menu_json, f, ensure_ascii=False, indent=2)
#         print("결과가 'parsed_menu.json' 파일로 저장되었습니다.")

#     except Exception as e:
#         print(f"오류 발생: {e}")