from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from PIL import Image
from sqlalchemy.orm import Session
from fastapi. middleware.cors import CORSMiddleware
from datetime import datetime,timedelta
import io
from app.core.config import settings
from app.core.email import send_reset_code
from app.core.utils import validate_email,validate_password,generate_code
from app.core.security import decode_access_token, hash_password, verify_password, create_access_token
from app.db.models import User, History,PasswordReset
from app.db.database import Base, engine, SessionLocal
from app.ml. calories import CalorieCalculator
from app.ml.model import FoodClassifier
from app.core.totp import (
    generate_totp_secret,
    generate_qr_code,
    verify_totp_code,
    get_current_totp_code
)

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
def register(username:str=Form(...),password:str=Form(...),email:str=Form(...),db:Session=Depends(get_db)):
    if not validate_email(email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format."
        )

    is_valid, error_message = validate_password(password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )

    existing_user=db.query(User).filter(User.username==username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered."
        )

    existing_email=db.query(User).filter(User.email==email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )

    hashed_password=hash_password(password)
    user=User(username=username,email=email,hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User created successfully"}

@app.post("/login")
def login(username:str=Form(...),password:str=Form(...),db:Session=Depends(get_db)):
    user=db.query(User).filter(User.username==username).first()
    if not user:
        user=db.query(User).filter(User.email==username).first()

    if not user or not verify_password(password,user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password"
        )

    access_token=create_access_token(data={"sub":user.username})
    return {"access_token":access_token,"token_type":"bearer"}

@app.post("/forgot-password")
def forgot_password(email:str=Form(...),db:Session=Depends(get_db)):
    if not validate_email(email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format."
        )

    user=db.query(User).filter(User.email==email).first()
    if not user:
        return {
            "message": "If this email exists, a reset code has been sent.",
            "email": email
        }
    reset_code=generate_code()
    expires_at=datetime.utcnow()+timedelta(minutes=settings.RESET_CODE_EXPIRE_MINUTES)
    db.query(PasswordReset).filter(PasswordReset.user_id==user.id,PasswordReset.is_used==0).delete()
    password_reset=PasswordReset(user_id=user.id,reset_code=reset_code,expires_at=expires_at,is_used=0)
    db.add(password_reset)
    db.commit()
    email_sent=send_reset_code(user.email,reset_code)
    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send email.  Please try again later."
        )
    return {
        "message": "Reset code sent to your email.",
        "email": email,
        "expires_in_minutes": settings.RESET_CODE_EXPIRE_MINUTES
    }

@app.post("/reset-password")
def reset_password(email:str=Form(...),reset_code:str=Form(...),new_password:str=Form(...),db:Session=Depends(get_db)):
    user=db.query(User).filter(User.email==email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or reset code."
        )
    reset_entry=db.query(PasswordReset).filter(PasswordReset.user_id==user.id,PasswordReset.reset_code==reset_code,PasswordReset.is_used==0).first()
    if not reset_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code."
        )
    if datetime.utcnow() > reset_entry.expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset code has expired.  Please request a new one."
        )
    is_valid, error_message = validate_password(new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )
    user.hashed_password=hash_password(new_password)
    reset_entry.is_used = 1
    db.commit()
    return {
        "message": "Password reset successfully.",
        "email": email
    }

@app.post("/2fa/enable")
def enable_2fa(db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):
    if current_user.is_2fa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is already enabled for this account."
        )
    secret=generate_totp_secret()
    current_user.totp_secret=secret
    qr_code=generate_qr_code(username=current_user.email,secret=secret,issuer="CalorieTrackerAi")
    return {
        "message": "Scan the QR code with Google Authenticator",
        "qr_code": qr_code,
        "instructions": [
            "1. Install Google Authenticator on your phone",
            "2. Open the QR code URL in browser",
            "3. Scan the QR code with Google Authenticator",
            "4. Enter the 6-digit code to confirm"
        ]
    }

@app.post("/2fa/disable")
def disable_2fa(db:Session=Depends(get_db),current_user:User=Depends(get_current_user),code:str=Form(...)):
    if not current_user.is_2fa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not enabled for this account."
        )
    if not verify_totp_code(current_user.totp_secret, code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code."
        )
    current_user.is_2fa_enabled=False
    current_user.totp_secret=None
    db.commit()
    return {
        "message": "2FA disabled successfully.",
        "email": current_user.email
    }

@app.post("/2fa/verify")
def verify_2fa(db:Session=Depends(get_db),code:str=Form(...),current_user:User=Depends(get_current_user)):
    if not current_user.totp_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA setup not initiated.  Call /2fa/enable first."
        )
    if current_user.is_2fa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is already enabled."
        )
    if not verify_totp_code(current_user.totp_secret, code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code."
        )
    current_user.is_2fa_enabled=True
    db.commit()
    return {
        "message": "2FA enabled successfully! ",
        "email": current_user.email
    }

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