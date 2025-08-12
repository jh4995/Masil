from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ARRAY
from sqlalchemy.sql import func
from ..database import Base
# PostGIS를 위한 타입 (GeoAlchemy2 필요: pip install geoalchemy2)
# from geoalchemy2 import Geography 

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    contact = Column(String(20), unique=True, nullable=False, index=True)
    interests = Column(ARRAY(Text))
    category_max_duration = Column(Float, nullable=False, default=4.0)
    # preferred_location = Column(Geography(geometry_type='POINT', srid=4326))
    role = Column(String(20), nullable=False, default='user')
    status = Column(String(20), nullable=False, default='active')
    created_at = Column(DateTime(timezone=True), server_default=func.now())