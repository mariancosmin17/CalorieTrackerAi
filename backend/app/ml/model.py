from transformers import AutoFeatureExtractor, AutoModelForImageClassification
from PIL import Image
import torch

class FoodClassifier:
    def __init__(self):
        self.extractor = AutoFeatureExtractor.from_pretrained("nateraw/food")
        self.model = AutoModelForImageClassification.from_pretrained("nateraw/food")
        self.model.eval()

    def predict(self, image: Image.Image) -> str:
        inputs = self.extractor(images=image, return_tensors="pt")

        with torch.no_grad():
            logits = self.model(**inputs).logits
        pred_id = logits.argmax(-1).item()
        label = self.model.config.id2label[pred_id]

        return label
