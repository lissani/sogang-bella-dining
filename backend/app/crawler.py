import os # 운영체제 관련 기능 - 경로와 디렉토리 다루기
import requests
import base64
from bs4 import BeautifulSoup
from urllib.parse import urljoin # URL 조합

BASE_URL = "https://scc.sogang.ac.kr"
LIST_URL = f"{BASE_URL}/front/cmsboardlist.do?siteId=dormitory&bbsConfigFK=1185"

# 서버에 일반 브라우저로 요청 (차단 방지)
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def check_latest_post_id() -> tuple[str, str, str]:
    """
    1단계: 목록 페이지에서 가장 최근 '식단' 게시글의 [ID, 상세페이지링크, 제목]만 빠르게 확인
    (상세 페이지 접속 전 스킵 여부를 결정하기 위함)
    """
    response = requests.get(LIST_URL, headers=headers)
    if response.status_code != 200:
        raise Exception("게시판 목록 접근 실패")
    
    soup = BeautifulSoup(response.text, "html.parser")
    posts = soup.select("div.list_box > ul > li")

    for post in posts:
        a_tag = post.select_one("a.title")
        if not a_tag:
            continue

        title = a_tag.text.strip()
        if "식단" in title:
            post_id_elem = post.select_one("div > div")
            post_id = post_id_elem.text.strip() if post_id_elem else post.get("id", "unknown_id")
            post_link = urljoin(BASE_URL, a_tag["href"])
            return post_id, post_link, title

    raise Exception("식단 게시글을 찾을 수 없습니다.")

def fetch_and_save_menu_image(post_link: str, title: str) -> tuple[str, str]:
    """
    2단계: 새 글일 경우에만 상세 페이지로 이동하여 이미지를 다운로드(또는 디코딩)하고 저장
    """
    post_response = requests.get(post_link, headers=headers)
    if post_response.status_code != 200:
        raise Exception("게시글 상세 페이지 접근 실패")
        
    post_soup = BeautifulSoup(post_response.text, "html.parser")

    # 디버깅용 HTML 저장
    # debug_dir = "../debug"
    # os.makedirs(debug_dir, exist_ok=True)
    # with open(os.path.join(debug_dir, "debug_post.html"), "w", encoding="utf-8") as f:
    #     f.write(post_soup.prettify())

    # 이미지 태그 찾기
    post_cont = post_soup.select_one("div.post_cont")
    img = post_cont.find("img") if post_cont else None
    if img is None:
        img = post_soup.find("img", class_="txc-image")

    if img is None:
        raise Exception(f"게시글('{title}')에서 이미지 태그를 찾을 수 없습니다.")
    
    image_src = img.get("src", "")
    if not image_src:
        raise Exception("이미지 태그에서 src 속성을 찾을 수 없습니다.")

    # 저장 폴더 준비
    output_dir = "../downloaded_menus"
    os.makedirs(output_dir, exist_ok=True)
    filepath = os.path.join(output_dir, "menu_image.png")

    # A. Base64 인코딩 이미지인 경우
    if image_src.startswith("data:image"):
        _, encoded_data = image_src.split(",", 1)
        image_data = base64.b64decode(encoded_data)
        with open(filepath, "wb") as f:
            f.write(image_data)
        print(f"[Crawler] Base64 이미지 저장 완료: {filepath}")

    # B. 일반 HTTP URL인 경우
    else:
        full_url = urljoin(BASE_URL, image_src)
        img_res = requests.get(full_url, headers=headers)
        if img_res.status_code == 200:
            with open(filepath, "wb") as f:
                f.write(img_res.content)
            print(f"[Crawler] URL 이미지 다운로드 완료: {filepath}")
        else:
            raise Exception(f"이미지 다운로드 실패 (상태 코드: {img_res.status_code})")

    # 날짜 파싱 ("07-20")
    cleaned_tokens = [s.rstrip('월일~') for s in title.split()]
    numbers = [s for s in cleaned_tokens if s.isdigit()]
    start_m, start_d = numbers[0].zfill(2), numbers[1].zfill(2)
    start_date = f"{start_m}-{start_d}"

    return filepath, start_date

# def get_latest_post_info():
#     response = requests.get(LIST_URL, headers=headers)
#     if response.status_code != 200:
#         raise Exception("게시판 접근 실패")
    
#     soup = BeautifulSoup(response.text, "html.parser")
#     # 최신 게시글 li 태그 선택 (한 페이지)
#     posts = soup.select("div.list_box > ul > li")

#     target_post = None
#     title = ""

#     for post in posts:
#         a_tag = post.select_one("a.title")
#         if not a_tag:
#             continue

#         post_title = a_tag.text.strip()
#         if "식단" in post_title:
#             target_post = post
#             title = post_title
#             break
#     if not target_post:
#         raise Exception("식단 게시글을 찾을 수 없습니다.")
    
#     post_id_elem = target_post.select_one("div > div")
#     post_id = post_id_elem.text.strip() if post_id_elem else target_post.get("id", "unknown_id")
    
#     a_tag = target_post.select_one("a.title")
#     link = a_tag["href"]
#     post_link = urljoin(BASE_URL, link)

#     # 최신 게시글로 이동하여 이미지 찾기
#     post_response = requests.get(post_link, headers=headers)
#     post_soup = BeautifulSoup(post_response.text, "html.parser")

#     # -------------------------------------------------------------
#     # 🛠️ [디버깅용] prettify() 결과를 외부 파일(debug_post.html)로 저장
#     # -------------------------------------------------------------
#     with open("debug_post.html", "w", encoding="utf-8") as f:
#         f.write(post_soup.prettify())
#     print("디버깅용 HTML 저장 완료: debug_post.html")
#     # -------------------------------------------------------------
    
#     # img = post_soup.find("img", class_="txc-image")
#     # if img is None:
#     #     raise Exception("게시글에서 이미지 태그를 찾을 수 없습니다.")

#     # 💡 [핵심]: 과거 방식(txc-image)과 신규 방식(일반 img) 모두 커버하기 위해 
#     # 본문 영역(post_cont) 내부의 첫 번째 img 태그를 우선 탐색
#     post_cont = post_soup.select_one("div.post_cont")
#     img = None
    
#     if post_cont:
#         # 1순위: post_cont 내부의 img 찾기
#         img = post_cont.find("img")
    
#     if img is None:
#         # 2순위: 혹시 몰라 과거 방식인 txc-image 클래스 검색 (백업용)
#         img = post_soup.find("img", class_="txc-image")

#     if img is None:
#         raise Exception(f"게시글('{title}')에서 이미지 태그를 찾을 수 없습니다.")
    
#     image_url = img.get("src", "")
#     if not image_url:
#         raise Exception("이미지 태그에서 src 속성을 찾을 수 없습니다.")

#     # Base64 데이터가 아닌 일반 상대 경로 URL일 경우에만 BASE_URL 결합
#     if not image_url.startswith("data:image"):
#         image_url = urljoin(BASE_URL, image_url)
    
#     cleaned_tokens = [s.rstrip('월일~') for s in title.split()]
#     numbers = [s for s in cleaned_tokens if s.isdigit()]

#     start_m, start_d = numbers[0].zfill(2), numbers[1].zfill(2)
#     # end_m, end_d = numbers[2].zfill(2), numbers[3].zfill(2)
#     # formatted_period = f"{start_m}.{start_d} ~ {end_m}.{end_d}" # "07.20 ~ 07.26"
#     start_date = f"{start_m}-{start_d}"                        # "07-20"
    
#     return post_id, image_url, start_date

# def download_menu_image(image_url):
    output_dir = "../downloaded_menus"
    os.makedirs(output_dir, exist_ok=True)

    try:
        img_res = requests.get(image_url, headers=headers)
        if img_res.status_code == 200:
            ext = os.path.splitext(image_url.split('?')[0])[1]
            if not ext:
                ext = ".jpg"
            filename = f"menu_image{ext}"
            filepath = os.path.join(output_dir, filename)
                
            with open(filepath, 'wb') as f:
                f.write(img_res.content)
            print(f"성공: {filename} 저장 완료 ({image_url}, {filepath})")
            return filepath
    except Exception as e:
        print(f"실패: {image_url} 다운로드 중 오류 발생 ({e})")
        raise