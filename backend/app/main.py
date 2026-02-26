from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from PIL import Image
from sqlalchemy.orm import Session
from fastapi. middleware.cors import CORSMiddleware
from datetime import datetime,timedelta
from pydantic import BaseModel
from typing import List
from datetime import date as date_type
import os
import uuid
import io
from app.core.config import settings
from app.core.email import send_reset_code
from app.core.utils import validate_email,validate_password,generate_code
from app.core.security import decode_access_token, hash_password, verify_password, create_access_token
from app.db.models import User, History,PasswordReset
from app.db.database import Base, engine, SessionLocal
from app.services.nutrition_estimator import NutritionEstimator
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
    if payload.get("temp"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Temporary token not allowed.  Please complete 2FA verification.",
            headers={"WWW-Authenticate": "Bearer"},
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

try:
    nutrition_estimator=NutritionEstimator()
except Exception as e:
    print(f"Warning: Nutrition Estimator failed to initialize: {e}")
    nutrition_estimator=None

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

    if user.is_2fa_enabled:
        temp_token=create_access_token(
            data={"sub":user.username,"temp":True},
            expires_delta=timedelta(minutes=5)
        )
        return {
            "requires_2fa":True,
            "temp_token":temp_token,
            "message":"Please provide 2FA code"
        }

    access_token=create_access_token(data={"sub":user.username})
    return {"access_token":access_token,"token_type":"bearer"}

@app.post("/login/2fa")
def login_2fa(temp_token:str=Form(...),code:str=Form(...),db:Session=Depends(get_db)):
    payload=decode_access_token(temp_token)
    if not payload or not payload.get("temp"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired temporary token"
        )
    username=payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    user=db.query(User).filter(User.username==username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    if not user.is_2fa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not enabled for this account"
        )
    if not verify_totp_code(user.totp_secret,code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid 2FA code"
        )
    access_token=create_access_token(data={"sub":user.username})
    return {"access_token": access_token, "token_type": "bearer"}

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
    db.commit()
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
async def predict(file: UploadFile=File(...),db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):
    try:
        if nutrition_estimator is None:
            raise HTTPException(
                status_code=500,
                detail="Nutrition analysis not available"
            )
        contents = await file.read()
        allowed_extensions = {'png','jpg','jpeg','gif','bmp'}
        file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type.Allowed: {', '.join(allowed_extensions)}"
            )
        upload_folder='uploads'
        os.makedirs(upload_folder,exist_ok=True)
        unique_filename=f"{uuid.uuid4()}_{file.filename}"
        temp_path=os.path.join(upload_folder,unique_filename)
        with open(temp_path,'wb') as f:
            f.write(contents)
        try:
            result=nutrition_estimator.analyze_image(temp_path)
            if result is None:
                raise HTTPException(
                    status_code=500,
                    detail="Analysis returned no result (internal error)"
                )
            try:
                os.remove(temp_path)
            except:
                pass
            if not result['success']:
                raise HTTPException(
                    status_code=500,
                    detail=f"Analysis failed: {result.get('error','Unknown error')}"
                )
            final_result=result["final_result"]
            final_foods=final_result["final_foods"]
            foods_list=[]
            for food_item in final_foods:
                food_name=food_item['name']
                nutrition=food_item.get('nutrition',{})
                if nutrition is None:
                    nutrition={}
                estimated_grams=nutrition.get('estimated_weight_grams',0) or 0
                estimated_calories=nutrition.get('calories_total',0) or 0
                macros=nutrition.get('macronutrients',{})
                if macros is None:
                    macros={}
                protein_g=macros.get('protein_g',0.0) or 0.0
                carbs_g=macros.get('carbs_g',0.0) or 0.0
                fat_g=macros.get('fat_g',0.0) or 0.0
                foods_list.append({"name":food_name,
                                "grams":estimated_grams,
                                "calories":estimated_calories,
                                "protein_g":protein_g,
                                "carbs_g":carbs_g,
                                "fat_g":fat_g})

            return {
                "success":True,
                "foods_detected":foods_list,
                "total_nutrition":final_result['total_nutrition'],
                "reconciliation_info":final_result['reconciliation_summary']
            }
        except HTTPException:
            raise
        except Exception as e:
            try:
                os.remove(temp_path)
            except:
                pass
            raise HTTPException(
                status_code=500,
                detail=f"Analysis failed: {str(e)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Server error: {str(e)}"
        )

class FoodItemInput(BaseModel):
    name:str
    grams:int
    calories:float
    protein_g:float
    carbs_g:float
    fat_g:float

class SaveMealRequest(BaseModel):
    foods:List[FoodItemInput]
    meal_type:str
    meal_time:str
    log_date:str

@app.post("/history/save")
def save_meal(request:SaveMealRequest,db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):
    try:
        valid_meal_types=["Breakfast","Lunch","Snack","Dinner"]
        if request.meal_type not in valid_meal_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid meal_type. Must be one of: {', '.join(valid_meal_types)}"
            )
        try:
            log_date = datetime.fromisoformat(request.log_date)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid log_date format. Use ISO format: YYYY-MM-DD"
            )
        saved_items=[]
        for food in request.foods:
            history=History(
                label=food.name,
                grams=food.grams,
                calories=food.calories,
                protein_g=food.protein_g,
                carbs_g=food.carbs_g,
                fat_g=food.fat_g,
                meal_type=request.meal_type,
                meal_time=request.meal_time,
                log_date=log_date,
                user_id=current_user.id
            )
            db.add(history)
            saved_items.append({
                "name": food.name,
                "grams": food.grams,
                "calories": food.calories
            })
        db.commit()
        return {
            "success": True,
            "message": f"Meal logged successfully ({len(saved_items)} items)",
            "meal_type": request.meal_type,
            "meal_time": request.meal_time,
            "log_date": request.log_date,
            "items_saved": len(saved_items),
            "foods": saved_items
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save meal: {str(e)}"
        )

@app.get("/history")
def get_history(date:str=None,db:Session=Depends(get_db),current_user=Depends(get_current_user)):
    query=db.query(History).filter(History.user_id==current_user.id)
    if date:
        try:
            target_date=datetime.fromisoformat(date)
            query=query.filter(db.func.date(History.log_date)==target_date.date())
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid date format. Use YYYY-MM-DD"
            )
    history = query.order_by(History.created_at.desc()).all()
    return {
        "success": True,
        "count": len(history),
        "date_filter": date if date else "all",
        "history": history
    }