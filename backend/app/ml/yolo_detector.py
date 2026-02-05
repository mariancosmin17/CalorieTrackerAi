from ultralytics import YOLO
from PIL import Image
import os
from typing import List, Dict

class YOLOFoodDetector:
    def __init__(self,model_path:str=None,confidence_threshold:float=0.25):
        if model_path is None:
            model_path=os.getenv('YOLO_MODEL_PATH', 'runs/detect/allinone_yolov8n_v1/weights/best.pt')
        self.model=YOLO(model_path)
        self.confidence_threshold=confidence_threshold
    def detect(self,image_path:str)->List[Dict]:
        results=self.model.predict(image_path,conf=self.confidence_threshold,verbose=False)
        detections=[]
        for box in results[0].boxes:
            class_id=int(box.cls[0])
            class_name=self.model.names[class_id]
            confidence=float(box.conf[0])
            bbox_xywh=box.xywhn[0].cpu().numpy()
            detection={'class':class_name,
                       'class_id':class_id,
                       'confidence':confidence,
                       'bbox':[round(float(bbox_xywh[0]),3),
                    round(float(bbox_xywh[1]),3),
                    round(float(bbox_xywh[2]),3),
                    round(float(bbox_xywh[3]),3)]}
            detections.append(detection)
            detections.sort(key=lambda x: x['confidence'],reverse=True)
            return detections
