import os
import requests
import traceback
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client, Client
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID

# --- 초기화 ---
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
app = FastAPI()

# --- CORS 미들웨어 설정 ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://192.168.68.92:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic 데이터 모델 ---
class Job(BaseModel):
    title: str
    participants: Optional[int] = None
    hourly_wage: int
    place: str
    address: Optional[str] = None
    work_days: Optional[str] = Field(None, max_length=7)
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    client: Optional[str] = None
    description: Optional[str] = None
    job_latitude: float
    job_longitude: float

class Review(BaseModel):
    user_id: UUID
    rating: int = Field(..., ge=1, le=5)
    review_text: Optional[str] = None
    status: str

# --- API 엔드포인트: Jobs ---

@app.post("/api/jobs")
def create_job(job: Job):
    text_to_embed = f"제목: {job.title}\n내용: {job.description}\n장소: {job.place}\n클라이언트: {job.client}"
    try:
        embedding_response = client.embeddings.create(input=[text_to_embed], model="text-embedding-3-small")
        embedding_vector = embedding_response.data[0].embedding
        job_data = job.model_dump()
        job_data["embedding"] = embedding_vector
        response = supabase.from_("jobs").insert(job_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"데이터 생성 실패: {str(e)}")

@app.get("/api/jobs")
def get_all_jobs():
    try:
        response = supabase.from_("jobs").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"데이터 조회 실패: {str(e)}")

@app.get("/api/jobs/{job_id}")
def get_job_by_id(job_id: int):
    try:
        response = supabase.from_("jobs").select("*").eq("job_id", job_id).single().execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ID {job_id} 조회 실패: {str(e)}")

@app.put("/api/jobs/{job_id}")
def update_job(job_id: int, job: Job):
    text_to_embed = f"제목: {job.title}\n내용: {job.description}\n장소: {job.place}\n클라이언트: {job.client}"
    try:
        embedding_response = client.embeddings.create(input=[text_to_embed], model="text-embedding-3-small")
        embedding_vector = embedding_response.data[0].embedding
        job_data = job.model_dump()
        job_data["embedding"] = embedding_vector
        response = supabase.from_("jobs").update(job_data).eq("job_id", job_id).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"데이터 수정 실패: {str(e)}")

@app.delete("/api/jobs/{job_id}")
def delete_job(job_id: int):
    try:
        response = supabase.from_("jobs").delete().eq("job_id", job_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail=f"ID {job_id}를 찾을 수 없습니다.")
        return {"message": f"ID {job_id}가 성공적으로 삭제되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"데이터 삭제 실패: {str(e)}")

# --- API 엔드포인트: Reviews ---

@app.post("/api/jobs/{job_id}/reviews")
def create_review_for_job(job_id: int, review: Review):
    try:
        # 1. user_job_reviews 테이블에 새 리뷰 삽입
        review_data = {
            "job_id": job_id,
            "user_id": str(review.user_id),
            "rating": review.rating,
            "review_text": review.review_text,
            "status": review.status,
        }
        supabase.from_("user_job_reviews").insert(review_data).execute()
        
        # 2. 해당 job_id의 평균 평점과 리뷰 개수 재계산
        agg_response = supabase.from_("user_job_reviews").select("rating", count="exact").eq("job_id", job_id).execute()
        
        ratings = [item['rating'] for item in agg_response.data if item.get('rating') is not None]
        new_review_count = agg_response.count
        new_avg_rating = sum(ratings) / len(ratings) if ratings else 0

        # 3. jobs 테이블에 재계산된 값 업데이트
        supabase.from_("jobs").update({
            "average_rating": new_avg_rating,
            "review_count": new_review_count
        }).eq("job_id", job_id).execute()
        
        return {"message": "리뷰가 성공적으로 등록되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"리뷰 등록 실패: {str(e)}")

@app.get("/api/jobs/{job_id}/reviews")
def get_reviews_for_job(job_id: int):
    try:
        response = supabase.from_("user_job_reviews").select("*").eq("job_id", job_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"리뷰 조회 실패: {str(e)}")

# --- API 엔드포인트: Geocode ---
@app.get("/api/geocode")
def geocode_address(address: str = Query(..., min_length=1)):
    api_key_id = os.getenv('NAVER_API_KEY_ID')
    api_key = os.getenv('NAVER_API_KEY')
    if not api_key_id or not api_key: raise HTTPException(status_code=500, detail="API 키가 서버에 설정되지 않았습니다.")
    
    url = f"https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query={address}"
    headers = {"X-NCP-APIGW-API-KEY-ID": api_key_id, "X-NCP-APIGW-API-KEY": api_key}
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "OK" and data.get("addresses"):
            coords = data["addresses"][0]
            return {"latitude": float(coords["y"]), "longitude": float(coords["x"])}
        else:
            raise HTTPException(status_code=404, detail="해당 주소의 좌표를 찾을 수 없습니다.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Naver API 통신 오류: {str(e)}")