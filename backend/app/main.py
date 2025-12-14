from fastapi import FastAPI, UploadFile, File
from PIL import Image
import io

from app.ml.model import FoodClassifier

app = FastAPI()

classifier = FoodClassifier()

@app.get("/")
def root():
    return {"message": "Food AI API is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    label = classifier.predict(image)
    return {
        "prediction": label
    }
