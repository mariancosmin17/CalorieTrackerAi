from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class User(Base):
    __tablename__="users"
    id=Column(Integer,primary_key=True,index=True)
    username=Column(String,unique=True,index=True,nullable=False)
    hashed_password=Column(String,nullable=False)
    created_at=Column(DateTime,default=datetime.utcnow)
    history=relationship("History",back_populates="user")

class History(Base):
    __tablename__="history"
    id=Column(Integer,primary_key=True,index=True)
    label=Column(String,nullable=False)
    grams=Column(Integer,nullable=False)
    calories=Column(Float,nullable=False)
    created_at=Column(DateTime,default=datetime.utcnow)

    user_id=Column(Integer,ForeignKey("users.id"))
    user=relationship("User",back_populates="history")