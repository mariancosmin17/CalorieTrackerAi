from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL:str="sqlite:///./calorie_tracker.db"
    SECRET_KEY:str="supersecretkey"
    ALGORITHM:str="HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES:int=30
    SMTP_HOST:str="smtp.gmail.com"
    SMTP_PORT:int=587
    SMTP_USERNAME:str="mariancosmin694@gmail.com"
    SMTP_PASSWORD:str="afjs wxzg macz gnfg"
    SMTP_FROM_EMAIL:str="mariancosmin694@gmail.com"
    SMTP_FROM_NAME:str="Food AI App"
    RESET_CODE_EXPIRE_MINUTES:int=15

    class Config:
        env_file=".env"

settings=Settings()

        