from fastapi import FastAPI, UploadFile, File, Form
from PIL import Image
from app.database import Base, engine
import io
from app.ml.calories import CalorieCalculator
from app.ml.model import FoodClassifier
from fastapi.middleware.cors import CORSMiddleware

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
