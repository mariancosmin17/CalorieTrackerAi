from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL:str="sqlite:///./calorie_tracker.db"
    SECRET_KEY:str="supersecretkey"
    ALGORITHM:str="HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES:int=30
    SMTP_HOST:str="smtp.gmail.com"
    SMTP_PORT:int=587
    SMTP_USERNAME:str
    SMTP_PASSWORD:str
    SMTP_FROM_EMAIL:str
    SMTP_FROM_NAME:str="Food AI App"
    RESET_CODE_EXPIRE_MINUTES:int=15
    GEMINI_API_KEY:str=""
    GEMINI_MODEL:str="gemini-3-flash-preview"
    YOLO_MODEL_PATH:str="runs/detect/allinone_yolov8n_v1/weights/best.pt"

    class Config:
        env_file=".env"

settings=Settings()

        