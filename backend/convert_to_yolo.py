import os
import shutil
from pathlib import Path
from datasets import load_dataset
from PIL import Image
import requests
from io import BytesIO
from tqdm import tqdm
import yaml
import random

DATASET_DIR=Path("data/food101_raw")
OUTPUT_DIR=Path("data/yolo_food_dataset")
VAL_SPLIT=0.2
FOOD_CLASSES=[
    'almond', 'apple', 'asparagus', 'avocado', 'banana', 'beef', 'berry',
    'bread', 'broccoli', 'burrito', 'butter', 'cabbage', 'cake', 'candy',
    'cauliflower', 'celery', 'cheese', 'chicken', 'coffee', 'condiment',
    'crab', 'cracker', 'crisp', 'croissant', 'cucumber', 'dessert', 'egg',
    'egg roll', 'egg yolk', 'eggplant', 'fish', 'food', 'garlic', 'ginger',
    'grape', 'green bean', 'green onion', 'ham', 'hot dog', 'ice cream',
    'juice', 'lemon', 'lettuce', 'lobster', 'milk', 'mushroom', 'onion',
    'orange', 'oyster', 'pancake', 'pasta', 'pastry', 'pea', 'pepper',
    'pie', 'pineapple', 'pizza', 'popcorn', 'potato', 'radish', 'salad',
    'sandwich', 'sausage', 'shrimp', 'skewer', 'soup', 'strawberry', 'sushi',
    'tea', 'tomato', 'tortilla', 'watermelon', 'whipped cream', 'yogurt',
    'zucchini'
]
FOOD_CLASSES.append('rice')
FOOD_CLASSES=sorted(FOOD_CLASSES)
CLASS_TO_ID={class_name:idx for idx,class_name in enumerate(FOOD_CLASSES)}
folders=[
    OUTPUT_DIR/"images"/"train",
    OUTPUT_DIR/"images"/"val",
    OUTPUT_DIR/"labels"/"train",
    OUTPUT_DIR/"labels"/"val"
]
for folder in folders:
    folder.mkdir(parents=True,exist_ok=True)

def download_image(image_uri,max_retries=3):
    for attempt in range(max_retries):
        try:
            response=requests.get(image_uri,timeout=10)
            response.raise_for_status()
            image=Image.open(BytesIO(response.content))
            if image.mode!='RGB':
                image=image.convert('RGB')
            return image
        except Exception as e:
            if attempt<max_retries-1:
                continue
            else:
                print(f"Eroare download dupa {max_retries} incercari {e}")
                return None

def convert_bbox_to_yolo(bbox,image_width,image_height):
    x,y,width,height=bbox
    center_x_pixels=x+(width/2.0)
    center_y_pixels=y+(height/2.0)
    center_x_norm=center_x_pixels/image_width
    center_y_norm=center_y_pixels/image_height
    width_norm=width/image_width
    height_norm=height/image_height
    center_x_norm=max(0.0,min(1.0,center_x_norm))
    center_y_norm =max(0.0,min(1.0, center_y_norm))
    width_norm=max(0.0,min(1.0, width_norm))
    height_norm=max(0.0,min(1.0, height_norm))
    return [center_x_norm,center_y_norm,width_norm,height_norm]

def generate_rice_bbox(image_width,image_height):
    bbox_width=int(image_width*0.8)
    bbox_height=int(image_height*0.8)
    bbox_x=int((image_width-bbox_width)/2)
    bbox_y=int((image_height-bbox_height)/2)
    return [bbox_x,bbox_y,bbox_width,bbox_height]

dataset=load_dataset(
    "visual-layer/food101-vl-enriched",
    cache_dir=str(DATASET_DIR)
)
train_split=dataset['train']
total_images=len(train_split)
processed_count=0
skipped_count=0
train_count=0
val_count=0
rice_added_count=0
total_bboxes=0
random.seed(42)

for idx,example in enumerate(tqdm(train_split,desc="Procesare",unit="img")):
    image_uri=example['image_uri']
    image_label=example['image_label']
    object_labels=example['object_labels']
    image=download_image(image_uri)
    if image is None:
        skipped_count+=1
        continue
    img_width,img_height=image.size
    valid_bboxes=[]
    for obj in object_labels:
        label=obj.get('label','').lower()
        bbox=obj.get('bbox',[])
        if label not in CLASS_TO_ID:
            continue
        if len(bbox)!=4 or any(v<0 for v in bbox):
            continue
        yolo_bbox=convert_bbox_to_yolo(bbox,img_width,img_height)
        class_id=CLASS_TO_ID[label]
        valid_bboxes.append({
            'class_id':class_id,
            'bbox':yolo_bbox
        })
    RICE_KEYWORDS=['rice','risotto','paella','biryani','pilaf']
    image_label_lower=image_label.lower()
    contains_rice=any(keyword in image_label_lower for keyword in RICE_KEYWORDS)
    if contains_rice:
        rice_class_id=CLASS_TO_ID['rice']
        already_has_rice=any(
            bbox_data['class_id']==rice_class_id
            for bbox_data in valid_bboxes
        )
        if not already_has_rice:
            rice_bbox_pixels=generate_rice_bbox(img_width,img_height)
            rice_bbox_yolo=convert_bbox_to_yolo(
                rice_bbox_pixels,
                img_width,
                img_height
            )
            valid_bboxes.append({
                'class_id':rice_class_id,
                'bbox':rice_bbox_yolo
            })
            rice_added_count+=1

    if len(valid_bboxes)==0:
        skipped_count+=1
        continue
    is_validation=random.random()<VAL_SPLIT
    if is_validation:
        split_folder="val"
        val_count+=1
    else:
        split_folder="train"
        train_count+=1
    image_filename=f"img_{processed_count:06d}.jpg"
    label_filename=f"img_{processed_count:06d}.txt"
    image_save_path=OUTPUT_DIR / "images" / split_folder / image_filename
    label_save_path=OUTPUT_DIR / "labels" / split_folder / label_filename
    try:
        image.save(image_save_path,"JPEG",quality=95)
    except Exception as e:
        print(f"Eroare salvare imagine {image_filename}: {e}")
        skipped_count+=1
        continue
    try:
        with open(label_save_path,'w') as f:
            for bbox_data in valid_bboxes:
                class_id=bbox_data['class_id']
                bbox=bbox_data['bbox']
                center_x,center_y,width,height=bbox
                line=f"{class_id} {center_x:.6f} {center_y:.6f} {width:.6f} {height:.6f}\n"
                f.write(line)
    except Exception as e:
        print(f"Eroare salvare label {label_filename}: {e}")
        if image_save_path.exists():
            image_save_path.unlink()
        skipped_count += 1
        continue
    processed_count+=1
    total_bboxes+=len(valid_bboxes)

yaml_path=OUTPUT_DIR/"data.yaml"
data_config={
    'path':str(OUTPUT_DIR.absolute()),
    'train':'images/train',
    'val':'images/val',
    'nc':len(FOOD_CLASSES),
    'names':FOOD_CLASSES
}
with open(yaml_path,'w') as f:
    yaml.dump(data_config,f,default_flow_style=False,sort_keys=False)

