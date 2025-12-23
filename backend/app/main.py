from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from PIL import Image
from sqlalchemy.orm import Session
from app.core.security import decode_access_token, hash_password, verify_password, create_access_token
from app.db.models import User, History
from app.db.database import Base, engine, SessionLocal
import io
from app.ml. calories import CalorieCalculator
from app.ml.model import FoodClassifier
from fastapi. middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    username = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

classifier = FoodClassifier()
calorie_calculator = CalorieCalculator("calorie_table.csv")

@app.get("/")
def root():
    return {"message": "Food AI API is running"}
@app.post("/register")
def register(username:str=Form(...),password:str=Form(...),db:Session=Depends(get_db)):
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
def login(username:str=Form(...),password:str=Form(...),db:Session=Depends(get_db)):
    user=db.query(User).filter(User.username==username).first()
    if not user or not verify_password(password,user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    access_token=create_access_token(data={"sub":user.username})
    return {"access_token":access_token,"token_type":"bearer"}

@app.post("/predict")
async def predict(file: UploadFile = File(...),grams:int=Form(...,ge=1,le=2500),
                  db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):

    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    label = classifier.predict(image)
    calories=calorie_calculator.calculate(label,grams)

    history=History(label=label,grams=grams,calories=calories,user_id=current_user.id)
    db.add(history)
    db.commit()
    return {
        "prediction": label,
        "grams":grams,
        "calories":calories
    }
@app.get("/history")
def get_history(db:Session=Depends(get_db),current_user=Depends(get_current_user)):
    history=(db.query(History).filter(History.user_id==current_user.id).order_by(History.created_at.desc()).all())
    return {"history":history}