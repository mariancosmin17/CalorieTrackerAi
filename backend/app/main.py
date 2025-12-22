from fastapi import FastAPI, UploadFile, File, Form,Depends, HTTPException, status
from PIL import Image
from sqlalchemy.orm import Session
from app.core.security import hash_password,verify_password, create_access_token
from app.db.models import User
from app.db.database import Base, engine,SessionLocal
import io
from app.ml.calories import CalorieCalculator
from app.ml.model import FoodClassifier
from fastapi.middleware.cors import CORSMiddleware

from backend.app.db.database import SessionLocal

Base.metadata.create_all(bind=engine)
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

classifier = FoodClassifier()
calorie_calculator=CalorieCalculator("calorie_table.csv")

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register")
def register(username:str,password:str,db:Session=Depends(get_db)):
    existing_user=db.query(User).filter(User.username==username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered."
        )
    hashed_password=hash_password(password)
    user=User(username=username,hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User created successfully"}

@app.post("/login")
def login(username:str,password:str,db:Session=Depends(get_db)):
    user=db.query(User).filter(User.username==username).first()
    if not user or not verify_password(password,user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    acces_token=create_access_token(data={"sub":user.username})
    return {"acces_token":acces_token,"token_type":"bearer"}

@app.get("/")
def root():
    return {"message": "Food AI API is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...),grams:int=Form(...,ge=1,le=2500)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    label = classifier.predict(image)
    calories=calorie_calculator.calculate(label,grams)
    return {
        "prediction": label,
        "grams":grams,
        "calories":calories
    }
