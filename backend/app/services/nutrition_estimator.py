import os
import logging
from typing import Dict, Optional
from PIL import Image

from app.ml.yolo_detector import YOLOFoodDetector
from app.services.gemini_service import GeminiNutritionService
from app.services.reconciliation import ReconciliationService

logging.basicConfig(level=logging.INFO)
logger=logging.getLogger(__name__)

class NutritionEstimator:
    def __init__(self,yolo_model_path:str=None,yolo_confidence:float=0.25,gemini_model:str=None):
        logger.info("Initializing Nutrition Estimator")
        try:
            self.yolo_detector=YOLOFoodDetector(model_path=yolo_model_path,confidence_threshold=yolo_confidence)
            logger.info("YOLO detector ready")
        except Exception as e:
            logger.error(f"Failed to load YOLO: {e}")
            raise
        try:
            self.gemini_service=GeminiNutritionService(model_name=gemini_model)
            logger.info("Gemini service ready")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini: {e}")
            raise
        self.reconciliation_service=ReconciliationService()
        logger.info("Reconciliation service ready")

        logger.info("Nutrition Estimator initialized successfully\n")

    def analyze_image(self,image_path:str)->Optional[Dict]:
        logger.info(f"ANALYZING IMAGE: {image_path}")
        result={
            'success':False,
            'image_path':image_path,
            'yolo_detections':None,
            'gemini_response':None,
            'final_result':None,
            'error':None
        }
        try:
            logger.info("1:YOLO Detection")
            yolo_detections=self.yolo_detector.detect(image_path)
            if not yolo_detections:
                logger.warning("YOLO found NO detections!")
            else:
                logger.info(f"YOLO detected {len(yolo_detections)} items:")
                for det in yolo_detections:
                    logger.info(f"- {det['class']} (conf: {det['confidence']:.2%})")
            result['yolo_detections']=yolo_detections
        except Exception as e:
            error_msg = f"YOLO detection failed: {e}"
            logger.error(f"{error_msg}")
            result['error']=error_msg
            return result

        try:
            logger.info("\n 2: Gemini Analysis")
            yolo_labels=[det['class'] for det in yolo_detections] if yolo_detections else []
            if not yolo_labels:
                logger.info("No YOLO labels, sending empty list to Gemini")
                yolo_labels=[]
            gemini_response=self.gemini_service.analyze_image(image_path,yolo_labels)
            if not gemini_response:
                error_msg="Gemini analysis failed (no response)"
                logger.error(f"{error_msg}")
                result['error']=error_msg
                return result
            logger.info("Gemini analysis complete")
            result['gemini_response']=gemini_response
        except Exception as e:
            error_msg=f"Gemini analysis failed: {e}"
            logger.error(f"{error_msg}")
            result['error']=error_msg
            return result

        try:
            logger.info("\n 3: Reconciliation")
            final_result=self.reconciliation_service.reconcile(
                yolo_detections if yolo_detections else [],
                gemini_response
            )
            logger.info("Reconciliation complete")
            logger.info(f"Total foods: {final_result['reconciliation_summary']['final_count']}")
            logger.info(f"Total calories: {final_result['total_nutrition'].get('total_calories', 0)}")
            logger.info(f"YOLO confirmed: {final_result['reconciliation_summary']['confirmed']}")
            logger.info(f"YOLO corrected: {final_result['reconciliation_summary']['corrected']}")
            logger.info(f"Gemini added: {final_result['reconciliation_summary']['added_by_gemini']}")
            result['final_result']=final_result
            result['success']=True
        except Exception as e:
            error_msg = f"Reconciliation failed: {e}"
            logger.error(f"{error_msg}")
            result['error']=error_msg
            return result
        logger.info("ANALYSIS COMPLETE")
        return result

if __name__ == "__main__":
    import sys
    import os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))
    from dotenv import load_dotenv
    import json
    import glob
    load_dotenv()
    try:
        estimator = NutritionEstimator()
    except Exception as e:
        print(f"Failed to initialize: {e}")
        exit(1)
    test_images=glob.glob('data/Dataset2_rboflow/valid/images/942_jpg.rf.2440f08881c79f629df86312d3b29784.jpg')
    if not test_images:
        test_images=glob.glob('data/*/valid/images/*.jpg')
    if not test_images:
        print("No test images found")
        exit(1)
    test_img=test_images[0]
    print(f"Using test image: {test_img}\n")
    result=estimator.analyze_image(test_img)
    if result['success']:
        print("SUCCESS! FINAL RESULT:")
        print(json.dumps(result['final_result'],indent=2))
    else:
        print(f"FAILED: {result['error']}")
        exit(1)