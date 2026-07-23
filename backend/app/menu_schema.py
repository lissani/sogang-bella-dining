json_schema = {
    "name": "weekly_menu_schema",
    "strict": True, # 💡 모델이 이 구조를 100% 엄격하게 따르도록 강제합니다.
    "schema": {
        "type": "object",
        "properties": {
            "meta": {
                "type": "object",
                "description": "식단표 상단의 공통 정보 및 관리자 연락처",
                "properties": {
                    "title": {"type": "string"},
                    "period": {"type": "string"},
                    "institution": {"type": "string"},
                    "provider": {"type": "string"},
                    "contacts": {
                        "type": "object",
                        "properties": {
                            "phone": {"type": "string"},
                            "email": {"type": "string"}
                        },
                        "required": ["phone", "email"],
                        "additionalProperties": False
                    }
                },
                "required": ["title", "period", "institution", "provider", "contacts"],
                "additionalProperties": False
            },
            "weekly_menu": {
                "type": "array",
                "description": "월요일부터 일요일까지의 요일별 식단 배열",
                "items": {
                    "type": "object",
                    "properties": {
                        "date": {"type": "string", "description": "YYYY-MM-DD 형식의 날짜"},
                        "day_of_week": {"type": "string", "description": "월요일, 화요일 등의 요일명"},
                        "meals": {
                            "type": "object",
                            "properties": {
                                "breakfast": {
                                    "type": "object",
                                    "description": "정성이 가득한 조식 정보 (한식과 베이커리 분리)",
                                    "properties": {
                                        "korean": {
                                            "type": "object",
                                            "properties": {
                                                "main": {"type": "string", "description": "조식 한식 메인 반찬/메뉴"},
                                                "items": {
                                                    "type": "array", 
                                                    "items": {"type": "string"},
                                                    "description": "국, 밥, 밑반찬 등을 포함한 전체 식단 리스트"
                                                },
                                                "calories": {"type": "string"}
                                            },
                                            "required": ["main", "items", "calories"],
                                            "additionalProperties": False
                                        },
                                        "bakery": {
                                            "type": "object",
                                            "properties": {
                                                "main": {"type": "string", "description": "조식 베이커리 메인 빵 종류"},
                                                "items": {
                                                    "type": "array", 
                                                    "items": {"type": "string"},
                                                    "description": "사이드 메뉴, 음료, 요거트 등"
                                                },
                                                "calories": {"type": "string"}
                               			},
                                            "required": ["main", "items", "calories"],
                                            "additionalProperties": False
                                        },
                                        "common": {"type": "string", "description": "조식 공통 자율 배식 메뉴 (예: 샐러드바)"}
                                    },
                                    "required": ["korean", "bakery", "common"],
                                    "additionalProperties": False
                                },
                                "lunch_cupbap": {
                                    # 💡 중요: 컵밥은 운영하지 않는 날이 많으므로 object 구조이거나 null일 수 있도록 허용
                                    "type": ["object", "null"],
                                    "description": "12:00에 제공되는 컵밥 메뉴 정보 (없으면 null)",
                                    "properties": {
                                        "time": {"type": "string"},
                                        "menu": {"type": "string"}
                                    },
                                    "required": ["time", "menu"],
                                    "additionalProperties": False
                                },
                                "dinner": {
                                    # 💡 중요: 토요일 석식 미운영 등 식단이 없는 날이 있으므로 object이거나 null 허용
                                    "type": ["object", "null"],
                                    "description": "행복을 주는 석식 정보 (없으면 null)",
                                    "properties": {
                                        "korean": {
                                            "type": ["object", "null"],
                                            "properties": {
                                                "main": {"type": "string", "description": "석식 메인 메뉴"},
                                                "items": {"type": "array", "items": {"type": "string"}},
                                                "calories": {"type": "string"}
                                            },
                                            "required": ["main", "items", "calories"],
                                            "additionalProperties": False
                                        },
                                        "info": {"type": ["string", "null"], "description": "석식 미운영 시 안내 문구 (예: 토요일석식미운영)"},
                                        "common_beverage": {"type": "string", "description": "석식 공통 음료 (예: 디톡스워터)"}
                                    },
                                    "required": ["korean", "info", "common_beverage"],
                                    "additionalProperties": False
                                }
                            },
                            "required": ["breakfast", "lunch_cupbap", "dinner"],
                            "additionalProperties": False
                        }
                    },
                    "required": ["date", "day_of_week", "meals"],
                    "additionalProperties": False
                }
            }
        },
        "required": ["meta", "weekly_menu"],
        "additionalProperties": False
    }
}