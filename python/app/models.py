from sqlalchemy import Column, String, Float, Date
from sqlalchemy.orm import declarative_base
from sqlalchemy.dialects.postgresql import UUID

Base = declarative_base()

class CostRecord(Base):
    __tablename__ = "CostRecord"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    date = Column(Date, nullable=False)
    cost = Column(Float, nullable=False)
    region = Column(String, nullable=False)
    resource_id = Column("resource_id", UUID(as_uuid=True), nullable=False)
