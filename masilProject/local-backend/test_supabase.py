import os
from dotenv import load_dotenv
from supabase import create_client, Client

print("--- Supabase 연결 테스트 스크립트 시작 ---")

# 1. .env 파일 로드
load_dotenv()

# 2. Supabase 클라이언트 초기화
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ 에러: .env 파일에서 URL 또는 키를 찾을 수 없습니다.")
    exit()

print("URL과 키를 성공적으로 불러왔습니다.")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Supabase 클라이언트가 성공적으로 생성되었습니다.")

    # 3. 데이터 조회 시도
    print(">>> opportunities 테이블에서 데이터 조회를 시도합니다...")
    response = supabase.from_("opportunities").select("*").execute()

    # 4. 결과 확인
    print("<<< 조회 시도가 완료되었습니다.")

    # PostgrestResponse 객체의 내용을 확인합니다.
    print("\n--- 응답 상세 내용 ---")
    print(f"Data: {response.data}")
    print(f"Error: {response.error}")
    print("---------------------\n")


    if response.data:
        print("✅ 최종 결과: 데이터 조회 성공!")
    elif response.error:
        print(f"❌ 최종 결과: 데이터 조회 실패! 원인: {response.error}")
    else:
        print("❔ 최종 결과: 데이터를 찾지 못했지만 에러도 없습니다. 테이블이 비어있을 수 있습니다.")

except Exception as e:
    print("❌ 스크립트 실행 중 심각한 에러 발생:")
    print(e)

print("--- 테스트 스크립트 종료 ---")