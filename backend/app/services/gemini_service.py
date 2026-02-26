import os
import json
import re
from typing import List, Dict, Optional
from PIL import Image
from google import genai
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO)
logger=logging.getLogger(__name__)
load_dotenv()

class GeminiNutritionService:
    def __init__(self,model_name:str=None):
        api_key=os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in .env")
        if model_name is None:
            model_name=os.getenv('GEMINI_MODEL','gemini-3-flash-preview')
        self.client=genai.Client(api_key=api_key)
        self.model_name=model_name
    def create_prompt(self,yolo_detections:List[str])->str:
        detected_foods=",".join(yolo_detections)
        prompt = f"""Analyze this food image carefully.

        MY OBJECT DETECTION MODEL detected these foods: {detected_foods}

        YOUR TASKS:

        1. VERIFICATION:
           - For EACH item in my list, confirm if you can clearly see it
           - If any item is NOT visible or MISIDENTIFIED, note the correction
           - Example: If I said "Rice" but you see "Pasta", correct it

        2. ADDITIONAL DETECTION:
           - Look for OTHER SEPARATE FOOD ITEMS I might have missed
           - Only include DISCRETE FOODS (not ingredients within detected items)
           - Example: ✅ Add "Lemon slice" (separate item), ❌ Don't add "Pepperoni" (ingredient in Pizza)
           - Only add items with medium-to-high confidence

        3. NUTRITIONAL ESTIMATION:
           - For FINAL LIST (verified + corrected + additional), estimate:
             * Weight in grams (based on visible portion size)
             * Total calories
             * Macronutrients (protein, carbs, fat, fiber in grams)
             * Key micronutrients (sodium, calcium, iron, vitamin C in mg)
           - Base estimates on typical portion sizes visible in the image

        RESPONSE FORMAT (strict JSON):
        {{
          "verification": [
            {{
              "original": "Pizza",
              "status": "confirmed",
              "confidence": "high",
              "note": "Clearly visible in center"
            }},
            {{
              "original": "Rice",
              "status": "corrected",
              "corrected_to": "Pasta",
              "confidence": "high",
              "note": "Shape indicates pasta, not rice"
            }},
            {{
              "original": "Cake",
              "status": "not_found",
              "confidence": "low",
              "note": "Cannot see this item in image"
            }}
          ],
          "additional_items": [
            {{
              "food": "Lemon",
              "confidence": "medium",
              "note": "Small lemon slice visible on side"
            }}
          ],
          "nutrition_estimates": [
            {{
              "food_name": "Pizza",
              "estimated_weight_grams": 280,
              "calories_total": 728,
              "macronutrients": {{
                "protein_g": 28,
                "carbs_g": 85,
                "fat_g": 32,
                "fiber_g": 4
              }},
              "micronutrients": {{
                "sodium_mg": 1250,
                "calcium_mg": 320,
                "iron_mg": 3.5,
                "vitamin_c_mg": 2
              }},
              "portion_size": "medium"
            }}
          ],
          "total_summary": {{
            "total_weight_grams": 530,
            "total_calories": 965,
            "total_protein_g": 38,
            "total_carbs_g": 135,
            "total_fat_g": 34
          }}
        }}

        IMPORTANT:
        - Be realistic with portion sizes (compare to plates, utensils, hands)
        - nutrition_estimates should include ALL final items (verified + corrected + additional)
        - If confidence is low, mark it explicitly
        - Provide brief notes for corrections/additions
        - For confirmed foods keep the original name that you received,use that one for nutrition_estimates
        """
        return prompt
    def analyze_image(self,image_path:str,yolo_detections:List[str])->Optional[Dict]:
        try:
            image=Image.open(image_path)
            prompt=self.create_prompt(yolo_detections)
            response=self.client.models.generate_content(
                model=self.model_name,
                contents=[prompt,image],
                config={'temperature':0.3,
                        'max_output_tokens':4096}
            )
            result_text=response.text
            logger.info(response.text)
            parsed=self._parse_json_response(result_text)
            return parsed
        except Exception as e:
            print(f"Gemini API error: {e}")
            return None

    def _parse_json_response(self,text:str)->Optional[Dict]:
        text = text.strip()

        if text.startswith('```'):
            parts = text.split('```')
            if len(parts) >= 3:
                json_block = parts[1].strip()
                if json_block.startswith('json'):
                    json_block=json_block[4:].strip()
                text = json_block

        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            print(f"First 300 chars of attempted JSON:\n{text[:300]}")
            return None


if __name__=="__main__":
    service = GeminiNutritionService()
    yolo_detections=['Pizza', 'Salad']
    import glob
    test_images=glob.glob('data/Dataset2_rboflow/valid/images/204_jpg.rf.ed3c00866196fd089fe77b5e0e9eef05.jpg')
    if not test_images:
        test_images=glob.glob('data/*/valid/images/*.jpg')

    if test_images:
        test_img = test_images[0]
        print(f"\nTesting on: {test_img}")
        print(f"YOLO detected: {yolo_detections}\n")
        result=service.analyze_image(test_img, yolo_detections)
        if result:
            print("\nGemini analysis SUCCESS!\n")
            print(json.dumps(result, indent=2))
        else:
            print("\nGemini analysis FAILED!")
    else:
        print("No test images found!")