from ultralytics import YOLO
from PIL import Image
import numpy as np

class ReferenceDetector:
    def __init__(self):
        self.model=YOLO("yolov8n.pt")
        self.reference_sizes={
            "bowl":25.0,
            "cup":8.0,
            "fork":20.0,
            "knife":22.0,
            "spoon":18.0,
        }
    def detect_reference(self,image:Image.Image):
        results=self.model.predict(image,verbose=False)
        for detection in results[0].boxes:
            class_id=int(detection.cls)
            class_name=self.model.names[class_id]
            if class_name in self.reference_sizes:
                bbox=detection.xyxy[0].cpu().numpy()
                width_px=bbox[2]-bbox[0]
                height_px=bbox[3]-bbox[1]
                size_px=max(width_px,height_px)
                size_cm=self.reference_sizes[class_name]
                scale=size_px/size_cm
                return{
                    "reference_type":class_name,
                    "bbox":bbox.tolist(),
                    "size_pixels":float(size_px),
                    "size_cm":size_cm,
                    "scale":float(scale),
                    "confidence":float(detection.conf)
                }
        return None
