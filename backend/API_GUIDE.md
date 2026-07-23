# 백엔드 / 서버 / API / 엔드포인트 가이드

`app/main.py`를 예시로, 백엔드 서버가 어떻게 동작하는지 처음부터 설명합니다.

## 1. 서버(Server)란?

서버는 "요청을 받으면 응답을 돌려주는 프로그램"입니다. 우리 프로젝트에서는 FastAPI로 만든
파이썬 프로그램이 서버 역할을 합니다.

```
[클라이언트(웹/앱)]  --요청(request)-->  [서버(main.py)]
[클라이언트(웹/앱)]  <--응답(response)--  [서버(main.py)]
```

- **클라이언트**: 프론트엔드(웹페이지, 앱)처럼 서버에 데이터를 요청하는 쪽
- **서버**: 요청을 받아 데이터를 처리하고 결과를 돌려주는 쪽 (여기서는 `main.py`)

`app/main.py` 맨 아래에 있는 코드로 서버를 실행합니다.

```bash
cd backend/app
uvicorn main:app --reload
```

실행하면 기본적으로 `http://127.0.0.1:8000` 주소에서 서버가 대기합니다.

## 2. API란?

API(Application Programming Interface)는 클라이언트와 서버가 "어떻게 대화할지" 정해둔 약속입니다.
"이 주소로, 이런 형식으로 요청하면, 이런 형식으로 응답해줄게" 라는 규칙이라고 생각하면 됩니다.

## 3. 엔드포인트(Endpoint)란?

엔드포인트는 API 안에서 **하나하나의 구체적인 요청 주소**입니다.
우리 서버에는 현재 엔드포인트가 2개 있습니다.

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/api/menu/weekly` | 저장된 모든 주간 식단을 반환 |
| GET | `/api/menu/daily` | 클라이언트가 지정한 **날짜 하나**의 식단만 반환 |

`main.py`에서는 이렇게 정의되어 있습니다.

```python
@app.get("/api/menu/daily")
def get_daily_menu(date: date_type = Query(..., description="...")):
    ...
```

- `@app.get("/api/menu/daily")` : "GET 방식으로 `/api/menu/daily` 주소에 요청이 오면 아래 함수를 실행해줘" 라는 뜻
- 함수 이름(`get_daily_menu`)은 자유롭게 지어도 되지만, 무슨 일을 하는지 알 수 있게 짓는 것이 좋습니다

### GET 메서드란?

HTTP 요청에는 여러 "메서드(동사)"가 있습니다. 지금 단계에서는 아래 2개만 알면 충분합니다.

- **GET**: 데이터를 **조회**할 때 사용 (지금 만든 두 엔드포인트가 모두 GET)
- **POST**: 데이터를 새로 **생성/전송**할 때 사용 (예: 나중에 관리자가 식단을 직접 등록하는 기능을 만든다면 POST 사용)

## 4. 클라이언트가 원하는 정보만 요청하기: Query Parameter

이번에 추가한 `/api/menu/daily` 엔드포인트가 핵심입니다.
클라이언트가 원하는 날짜를 **쿼리 파라미터(query parameter)**로 붙여서 요청하면,
서버는 전체 데이터가 아니라 그 날짜에 해당하는 정보만 골라서 응답합니다.

```
GET http://127.0.0.1:8000/api/menu/daily?date=2026-07-06
                                          ^^^^^^^^^^^^^^^^
                                          쿼리 파라미터
```

- `?date=2026-07-06` 부분이 쿼리 파라미터입니다. `?` 뒤에 `key=value` 형태로 붙습니다.
- 파라미터가 여러 개면 `&`로 연결합니다. 예: `?date=2026-07-06&lang=ko`

서버 코드에서는 함수의 파라미터로 자동으로 받아집니다.

```python
def get_daily_menu(date: date_type = Query(...)):
```

FastAPI가 알아서 다음을 처리해줍니다.

- `date=2026-07-06` 형식이 아니면 → 자동으로 `422 Unprocessable Entity` 에러 응답
- `date` 파라미터를 아예 안 보내면 → 자동으로 `422` 에러 응답 (필수 파라미터이므로)
- 형식이 맞으면 → 파이썬 `date` 객체로 변환되어 함수 안에서 사용 가능

### 실제 동작 흐름

1. 클라이언트가 `GET /api/menu/daily?date=2026-07-06` 요청
2. 서버가 `data/` 폴더 안의 `07-06_menu.json`, `07-20_menu.json` 등 모든 주간 파일을 읽어서 합침
3. 그중 `"date": "2026-07-06"` 인 항목 하나만 찾음
4. 찾으면 그 날짜의 `meals` 정보만 응답, 못 찾으면 `404 Not Found` 응답

```json
{
  "date": "2026-07-06",
  "day_of_week": "월요일",
  "meals": {
    "breakfast": { ... },
    "lunch_cupbap": { ... },
    "dinner": { ... }
  }
}
```

## 5. 응답 코드(Status Code) 읽는 법

서버 응답에는 항상 상태 코드가 같이 옵니다. 자주 보게 될 코드:

| 코드 | 의미 |
|---|---|
| 200 OK | 요청 성공, 정상적으로 데이터를 응답함 |
| 404 Not Found | 요청은 정상이지만 해당 데이터가 없음 (예: 없는 날짜 조회) |
| 422 Unprocessable Entity | 요청 자체가 잘못됨 (예: 날짜 형식이 틀림, 필수 파라미터 누락) |
| 500 Internal Server Error | 서버 코드 내부에서 예외가 발생함 (버그) |

## 6. 브라우저 / 코드로 직접 테스트해보기

### 방법 1: 브라우저 주소창

서버를 실행한 상태에서 브라우저 주소창에 아래처럼 입력하면 바로 결과를 볼 수 있습니다.

```
http://127.0.0.1:8000/api/menu/daily?date=2026-07-06
```

### 방법 2: FastAPI 자동 문서 (Swagger UI)

FastAPI는 엔드포인트를 만들면 **자동으로 테스트용 문서 페이지**를 만들어줍니다.

```
http://127.0.0.1:8000/docs
```

이 페이지에서 각 엔드포인트를 펼쳐서 "Try it out" 버튼을 누르고 `date` 값을 입력한 뒤
"Execute"를 누르면, 실제 요청을 보내고 응답을 눈으로 확인할 수 있습니다. 프론트엔드 코드를
짜기 전에 API가 잘 동작하는지 확인할 때 아주 유용합니다.

### 방법 3: 프론트엔드(자바스크립트)에서 호출하는 예시

```js
async function getMenuByDate(dateStr) {
  const res = await fetch(`http://127.0.0.1:8000/api/menu/daily?date=${dateStr}`);
  if (!res.ok) {
    if (res.status === 404) {
      console.log("해당 날짜 식단 없음");
      return null;
    }
    throw new Error(`요청 실패: ${res.status}`);
  }
  return await res.json();
}

const menu = await getMenuByDate("2026-07-06");
console.log(menu.meals.breakfast);
```

## 7. 앞으로 엔드포인트를 추가할 때 패턴

새로운 조회 기능이 필요할 때는 아래 패턴을 그대로 따라 하면 됩니다.

```python
@app.get("/api/새로운/경로")
def 함수이름(파라미터: 타입 = Query(...)):
    # 1. 필요한 데이터를 읽거나 계산
    # 2. 조건에 맞는 데이터만 골라내기
    # 3. 없으면 HTTPException(404, ...) 발생
    # 4. 있으면 dict/list 형태로 return (FastAPI가 자동으로 JSON 변환)
    ...
```

핵심 규칙:

- **경로(path)**: `/api/자원이름/동작` 형태로 명확하게 짓기
- **쿼리 파라미터**: "특정 조건으로 필터링"할 때 사용 (예: `?date=`, `?day_of_week=`)
- **응답은 필요한 정보만**: 클라이언트가 요청한 범위에 맞는 데이터만 돌려주는 것이 좋음
  (전체 데이터를 다 주고 프론트엔드에서 걸러내는 방식은 트래픽과 처리 비용 낭비)
