from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

pwd_context=CryptContext(schemes=["bcrypt"],deprecated="auto")
SECRET_KEY="supersecretkey"
ALGHORITM="HS256"
ACCES_TOKEN_EXPIRE_MINUTES=30

def has_password(password:str)->str:
    return pwd_context.hash(password)
def verify_password(plain_password:str,hashed_password:str)->bool:
    return pwd_context.verify(plain_password,hashed_password)
def create_acces_token(data:dict)->str:
    to_encode=data.copy()
    expire=datetime.utcnow()+timedelta(minutes=ACCES_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp":expire})
    return jwt.encode(to_encode,SECRET_KEY,algorithm=ALGHORITM)
def decode_acces_token(token:str)->dict:
    try:
        return jwt.decode(token,SECRET_KEY,algorithms=[ALGHORITM])
    except JWTError:
        return None