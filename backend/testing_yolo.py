from ultralytics import YOLO
from pathlib import Path
import cv2
import random

model = YOLO('runs/detect/allinone_yolov8n_v1/weights/best.pt')

val_images = Path('data/Dataset2_rboflow/valid/images')
val_labels = Path('data/Dataset2_rboflow/valid/labels')
output_dir = Path('test_comparison')
output_dir.mkdir(exist_ok=True)

all_images = list(val_images.glob('*.jpg'))
test_images = random.sample(all_images, min(10, len(all_images)))

print(f"Testing pe {len(test_images)} imagini\n")

for img_path in test_images:
    results = model.predict(img_path, conf=0.25, imgsz=640, verbose=False)

    n_detections = len(results[0].boxes)

    label_path = val_labels / f"{img_path.stem}.txt"
    n_true = 0
    if label_path.exists():
        with open(label_path, 'r') as f:
            n_true = len(f.readlines())

    result_img = results[0].plot()
    output_path = output_dir / img_path.name
    cv2.imwrite(str(output_path), result_img)

    print(f" {img_path.name}")
    print(f"  TRUE objects: {n_true}")
    print(f"  PREDICTED:    {n_detections}")
    print(f" Salvat in: {output_path}\n")
