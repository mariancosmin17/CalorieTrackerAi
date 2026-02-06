from typing import List, Dict, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger=logging.getLogger(__name__)

class ReconciliationService:
    def reconcile(self,yolo_detections:List[Dict],gemini_response:Dict)->Dict:
        logger.info("Starting reconciliation")
        verifications=gemini_response.get('verification',[])
        additional_items=gemini_response.get('additional_items',[])
        nutrition_estimates=gemini_response.get('nutrition_estimates',[])
        total_summary=gemini_response.get('total_summary',{})
        stats={
            'yolo_detections':len(yolo_detections),
            'confirmed':0,
            'corrected':0,
            'not_found':0,
            'added_by_gemini':len(additional_items),
            'final_count':0
        }
        final_foods=[]
        logger.info(f"Processing {len(verifications)} YOLO verifications")
        for verification in verifications:
            original=verification.get('original')
            status=verification.get('status')
            confidence=verification.get('confidence','unknown')
            note=verification.get('note','')
            if status=='confirmed':
                stats['confirmed']+=1
                yolo_det=self._find_yolo_detection(yolo_detections,original)
                nutrition=self._find_nutrition(nutrition_estimates,original)
                food_item={
                    'name':original,
                    'source':'yolo_confirmed',
                    'yolo_confidence':yolo_det.get('confidence') if yolo_det else None,
                    'gemini_confidence':confidence,
                    'note':note,
                    'nutrition':nutrition
                }
                final_foods.append(food_item)
                logger.info(f"Confirmed: {original}")
            elif status=='corrected':
                stats['corrected']+=1
                corrected_to=verification.get('corrected_to')
                yolo_det=self._find_yolo_detection(yolo_detections, original)
                nutrition=self._find_nutrition(nutrition_estimates, corrected_to)
                food_item={
                    'name':corrected_to,
                    'source':'yolo_corrected',
                    'original_yolo_name':original,
                    'yolo_confidence':yolo_det.get('confidence') if yolo_det else None,
                    'gemini_confidence':confidence,
                    'note':note,
                    'nutrition':nutrition
                }
                final_foods.append(food_item)
                logger.info(f"Corrected: {original} → {corrected_to}")
            elif status=='not_found':
                stats['not_found']+=1
                logger.info(f"Ignored: {original} (not found by Gemini)")
            else:
                logger.warning(f"Unknown status: {status} for {original}")

        logger.info(f"Processing {len(additional_items)} additional Gemini items")
        for item in additional_items:
            food_name=item.get('food')
            confidence=item.get('confidence', 'unknown')
            note=item.get('note', '')
            nutrition=self._find_nutrition(nutrition_estimates,food_name)
            food_item={
                'name':food_name,
                'source':'gemini_added',
                'yolo_confidence':None,
                'gemini_confidence':confidence,
                'note':note,
                'nutrition':nutrition
            }
            final_foods.append(food_item)
            logger.info(f"Added: {food_name}")

        stats['final_count']=len(final_foods)
        logger.info(f"Reconciliation complete: {stats['final_count']} final items")
        return {
            'final_foods':final_foods,
            'reconciliation_summary':stats,
            'total_nutrition':total_summary
        }

    def _find_yolo_detection(self,yolo_detections:List[Dict],class_name:str)->Optional[Dict]:
        for det in yolo_detections:
            if det.get('class')==class_name:
                return det
        return None

    def _find_nutrition(self,nutrition_estimates:List[Dict],food_name:str)->Optional[Dict]:
       for est in nutrition_estimates:
           if est.get('food_name')==food_name:
               return est
       return None

if __name__ == "__main__":
    yolo_detections=[
        {'class': 'Pizza', 'confidence': 0.89},
        {'class': 'Salad', 'confidence': 0.76}
    ]
    gemini_response={
        'verification': [
            {
                'original': 'Pizza',
                'status': 'corrected',
                'corrected_to': 'White Rice',
                'confidence': 'high',
                'note': 'Image shows rice, not pizza'
            },
            {
                'original': 'Salad',
                'status': 'not_found',
                'confidence': 'low',
                'note': 'No salad visible'
            }
        ],
        'additional_items': [],
        'nutrition_estimates': [
            {
                'food_name': 'White Rice',
                'estimated_weight_grams': 180,
                'calories_total': 234,
                'macronutrients': {
                    'protein_g': 4.9,
                    'carbs_g': 50.4,
                    'fat_g': 0.5
                }
            }
        ],
        'total_summary': {
            'total_calories': 234,
            'total_protein_g': 4.9
        }
    }
    service=ReconciliationService()
    result=service.reconcile(yolo_detections, gemini_response)
    import json
    print("RECONCILIATION RESULT:")
    print(json.dumps(result,indent=2))