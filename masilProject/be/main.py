# main.py
from fastapi import FastAPI, status, Response
from pydantic import BaseModel
from typing import List, Optional

# --- Pydantic 모델 정의 (요청/응답 형식) ---
class Activity(BaseModel):
    activity_id: int
    name: str
    category: str

class CartItemCreate(BaseModel):
    activity_id: int

# --- FastAPI 앱 인스턴스 생성 ---
app = FastAPI()

# --- API 엔드포인트 뼈대 코드 ---

@app.get("/")
def read_root():
    return {"message": "아빠 어디가? API 서버"}

# 1. 인증 (/auth)
@app.post("/api/v1/auth/register", status_code=status.HTTP_201_CREATED)
def register_user():
    return {"message": "회원가입 성공", "user_id": 1}

@app.post("/api/v1/auth/login")
def login_user():
    return {"access_token": "fake-jwt-token", "token_type": "bearer"}

# 2. 사용자 (/users)
@app.get("/api/v1/users/me")
def get_my_profile():
    return {"user_id": 1, "name": "홍길동", "interests": ["운동", "학습"]}

@app.put("/api/v1/users/me")
def update_my_profile():
    return {"message": "사용자 정보 수정 성공"}

# 3. 활동 (/activities)
@app.get("/api/v1/activities/recommendations", response_model=List[Activity])
def get_recommendations():
    # 하드코딩된 가짜(mock) 데이터 반환
    return [
        {"activity_id": 1, "name": "뚝섬유원지 조깅", "category": "운동"},
        {"activity_id": 2, "name": "스마트폰 사진 교실", "category": "학습"}
    ]

@app.get("/api/v1/activities/{activity_id}")
def get_activity_detail(activity_id: int):
    return {"message": f"{activity_id}번 활동의 상세 정보를 반환합니다."}

# 4. 장바구니 (/cart)
@app.get("/api/v1/cart")
def get_my_cart():
    return {"message": "내 장바구니 목록을 반환합니다."}

@app.post("/api/v1/cart", status_code=status.HTTP_201_CREATED)
def add_to_cart(item: CartItemCreate):
    return {"message": f"{item.activity_id}번 활동을 장바구니에 추가했습니다."}

@app.delete("/api/v1/cart/items/{cart_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_cart(cart_item_id: int):
    # 204 No Content는 본문(body)이 없으므로 아무것도 반환하지 않음
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# 5. 스케줄 (/schedules)
@app.post("/api/v1/schedules", status_code=status.HTTP_201_CREATED)
def create_schedule():
    return {"message": "AI 스케줄 생성을 시작합니다.", "schedule_id": 101}

@app.get("/api/v1/schedules/{schedule_id}")
def get_schedule_detail(schedule_id: int):
    return {"message": f"{schedule_id}번 스케줄의 상세 정보를 반환합니다."}

@app.post("/api/v1/schedules/{schedule_id}/poster", status_code=status.HTTP_202_ACCEPTED)
def request_poster_generation(schedule_id: int):
    # 비동기 작업 시작을 알림
    return {"message": f"{schedule_id}번 스케줄의 포스터 이미지 생성을 시작했습니다."}

# 6. AI 캐릭터 영상 (/characters)
@app.post("/api/v1/characters/video/generate", status_code=status.HTTP_202_ACCEPTED)
def request_video_generation():
    return {"message": "AI 캐릭터 영상 생성을 시작했습니다.", "task_id": "task-12345"}

@app.get("/api/v1/characters/video/status/{task_id}")
def get_video_generation_status(task_id: str):
    return {"task_id": task_id, "status": "processing"}