from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from app.core.config import settings

pwd_context=CryptContext(schemes=["bcrypt"],deprecated="auto")
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=60

def hash_password(password:str)->str:
    return pwd_context.hash(password)
def verify_password(plain_password:str,hashed_password:str)->bool:
    return pwd_context.verify(plain_password,hashed_password)
def create_access_token(data:dict,expires_delta:Optional[timedelta]=None)->str:
    to_encode=data.copy()
    if expires_delta:
        expire=datetime.utcnow()+expires_delta
    else:
        expire=datetime.utcnow()+timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp":expire})
    return jwt.encode(to_encode,settings.SECRET_KEY,algorithm=ALGORITHM)
def decode_access_token(token:str)->dict:
    try:
        return jwt.decode(token,settings.SECRET_KEY,algorithms=[ALGORITHM])
    except JWTError:
        return None