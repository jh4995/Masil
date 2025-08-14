import os
import requests
import traceback
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from supabase import create_client, Client
from pydantic import BaseModel, Field
from typing import List, Optional
from openai import OpenAI
import json

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
    allow_origins=["http://localhost:5173"], # React 앱 주소
    allow_credentials=True,
    allow_methods=["*"], # 모든 HTTP 메소드 허용
    allow_headers=["*"], # 모든 HTTP 헤더 허용
)

# --- Pydantic 데이터 모델 ---
class Opportunity(BaseModel):
    title: str
    client: Optional[str] = None
    description: Optional[str] = None
    participants: Optional[int] = None
    hourly_wage: int
    work_days: Optional[str] = Field(None, max_length=7)
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    place: str
    address: Optional[str] = None
    latitude: float
    longitude: float

# --- API 엔드포인트 ---

# [READ] 모든 소일거리 조회
@app.get("/api/opportunities")
def get_all_opportunities():
    try:
        response = supabase.from_("opportunities").select(
            "job_id, title, client, description, participants, hourly_wage, "
            "work_days, start_time, end_time, place, address, latitude, longitude, created_at"
        ).order("created_at", desc=True).execute()
        
        if response.data:
            return response.data
        else:
            return []
            
    except Exception as e:
        print(traceback.format_exc()) # 터미널에 상세 에러 출력
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/opportunities")
def create_opportunity(opportunity: Opportunity):
    # 1. 텍스트 데이터 조합
    text_to_embed = (
        f"제목: {opportunity.title}\n"
        f"내용: {opportunity.description}\n"
        f"장소: {opportunity.place}\n"
        # f"태그: {', '.join(opportunity.tags if opportunity.tags else [])}"
    )
    
    try:
        # 2. OpenAI 임베딩 API 호출
        response = client.embeddings.create(
            input=text_to_embed,
            model="text-embedding-3-small"
        )
        embedding_vector = response.data[0].embedding
        
        # 3. 원본 데이터와 임베딩 벡터를 함께 DB에 저장
        opportunity_data = opportunity.model_dump()
        opportunity_data["embedding"] = embedding_vector
        
        # # --- 👇 디버깅을 위한 print 문 추가 👇 ---
        # print("\n--- DB에 저장할 데이터 ---")
        # # 보기 좋게 JSON 형태로 출력합니다.
        # print(json.dumps(opportunity_data, indent=2, ensure_ascii=False))
        # print("------------------------\n")
        # # --- 👆 디버깅 코드 끝 👆 ---
        
        response = supabase.from_("opportunities").insert(opportunity_data).execute()
        
        if response.data:
            return response.data[0]
        else:
            # v1.x 에서는 에러가 있으면 Exception을 발생시킵니다.
            raise Exception("데이터 삽입 후 반환된 데이터가 없습니다.")
        
        # data, error = supabase.from_("opportunities").insert(opportunity_data).execute()
        
        # if error:
        #     raise HTTPException(status_code=400, detail=str(error))
        
        # return data[1][0]

    except Exception as e:
        error_traceback = traceback.format_exc()
        print(f"--- 상세 에러 발생 ---\n{error_traceback}\n--------------------")
        raise HTTPException(status_code=500, detail=error_traceback)

# 👇 --- 이 부분이 누락되었을 가능성이 높습니다 --- 👇
@app.put("/api/opportunities/{job_id}")
def update_opportunity(job_id: int, opportunity: Opportunity):
    text_to_embed = f"제목: {opportunity.title}\n내용: {opportunity.description}\n장소: {opportunity.place}\n"
    try:
        embedding_response = client.embeddings.create(input=[text_to_embed], model="text-embedding-3-small")
        embedding_vector = embedding_response.data[0].embedding
        opportunity_data = opportunity.model_dump()
        opportunity_data["embedding"] = embedding_vector
        opportunity_data["updated_at"] = "now()"
        response = supabase.from_("opportunities").update(opportunity_data).eq("job_id", job_id).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"데이터 수정 실패: {str(e)}")

@app.delete("/api/opportunities/{job_id}")
def delete_opportunity(job_id: int):
    try:
        response = supabase.from_("opportunities").delete().eq("job_id", job_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail=f"ID {job_id}를 찾을 수 없습니다.")
        return {"message": f"ID {job_id}가 성공적으로 삭제되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"데이터 삭제 실패: {str(e)}")

# [UTIL] 주소 -> 좌표 변환 (지오코딩)
@app.get("/api/geocode")
def geocode_address(address: str = Query(..., min_length=1)):
    api_key_id = os.getenv('NAVER_API_KEY_ID')
    api_key = os.getenv('NAVER_API_KEY')
    if not api_key_id or not api_key: 
        raise HTTPException(status_code=500, detail="API 키가 서버에 설정되지 않았습니다.")
    
    url = f"https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query={address}"
    headers = {"X-NCP-APIGW-API-KEY-ID": api_key_id, "X-NCP-APIGW-API-KEY": api_key}
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status() # 200 OK가 아니면 에러를 발생시킴
        data = response.json()
        if data.get("status") == "OK" and data.get("addresses"):
            coords = data["addresses"][0]
            return {"latitude": float(coords["y"]), "longitude": float(coords["x"])}
        else:
            raise HTTPException(status_code=404, detail="해당 주소의 좌표를 찾을 수 없습니다.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Naver API 통신 오류: {e}")