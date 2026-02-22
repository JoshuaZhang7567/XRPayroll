import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime, timezone

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    password = Column(String, nullable=False, server_default="password")
    xrpl_address = Column(String, unique=True, index=True)
    discord_id = Column(String, unique=True, index=True, nullable=True)

    receipts = relationship("Receipt", back_populates="submitter")

class Receipt(Base):
    __tablename__ = 'receipts'

    id = Column(Integer, primary_key=True, index=True)
    submitter_id = Column(Integer, ForeignKey('users.id'))
    image_path = Column(String, nullable=False)
    
    # Extracted fields
    amount = Column(Float, nullable=True)
    merchant = Column(String, nullable=True)
    date_extracted = Column(String, nullable=True)
    
    status = Column(String, default="pending") # pending, approved, rejected, paid
    xrpl_tx_hash = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    submitter = relationship("User", back_populates="receipts")

DATABASE_URL = "sqlite:///./payroll.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
