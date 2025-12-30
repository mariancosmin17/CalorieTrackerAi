from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime

class User(Base):
    __tablename__="users"
    id=Column(Integer,primary_key=True,index=True)
    username=Column(String,unique=True,index=True,nullable=False)
    email=Column(String,unique=True,index=True,nullable=False)
    hashed_password=Column(String,nullable=False)
    created_at=Column(DateTime,default=datetime.utcnow)
    history=relationship("History",back_populates="user")
    reset_codes=relationship("PasswordReset",back_populates="user")

class History(Base):
    __tablename__="history"
    id=Column(Integer,primary_key=True,index=True)
    label=Column(String,nullable=False)
    grams=Column(Integer,nullable=False)
    calories=Column(Float,nullable=False)
    created_at=Column(DateTime,default=datetime.utcnow)

    user_id=Column(Integer,ForeignKey("users.id"))
    user=relationship("User",back_populates="history")

class PasswordReset(Base):
    __tablename__="password_resets"
    id=Column(Integer,primary_key=True,index=True)
    user_id=Column(Integer,ForeignKey("users.id"),nullable=False)
    reset_code=Column(String,nullable=False)
    expires_at=Column(DateTime,nullable=False)
    is_used=Column(Integer,default=0)
    created_at=Column(DateTime,default=datetime.utcnow)
    user=relationship("User",back_populates="reset_codes")