import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# 1. .env 파일에서 환경 변수를 로드합니다.
load_dotenv()

# 2. .env 파일에 정의된 DATABASE_URL 값을 가져옵니다.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# 3. 데이터베이스와 통신하는 엔진(engine)을 생성합니다.
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 4. 데이터베이스 세션(연결)을 생성하는 클래스입니다.
#    API 요청이 들어올 때마다 이 클래스를 통해 DB 연결이 생성됩니다.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 5. 모든 데이터베이스 모델(테이블)이 상속받을 기본 클래스입니다.
Base = declarative_base()

# 6. API 엔드포인트에서 DB 세션을 쉽게 사용하기 위한 의존성 함수입니다.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()