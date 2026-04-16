from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL:str="sqlite:///./calorie_tracker.db"
    SECRET_KEY:str
    ALGORITHM:str="HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES:int=30
    BREVO_API_KEY:str=""
    BREVO_SENDER_EMAIL:str=""
    BREVO_SENDER_NAME:str="Food AI App"
    RESET_CODE_EXPIRE_MINUTES:int=15
    GEMINI_API_KEY:str=""
    GEMINI_MODEL:str="gemini-2.0-flash"
    YOLO_MODEL_PATH:str="runs/detect/allinone_yolov8n_v1/weights/best.pt"

    class Config:
        env_file=".env"

settings=Settings()

        