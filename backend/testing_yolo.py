from ultralytics import YOLO

model = YOLO('runs/detect/food_nano_v1/weights/best.pt')

test_images = [
    'test/test_burger.jpg',
    'test/test_pizza.jpg',
    'test/test_steak.jpg',
    'test/test_pasta2.jpg',
    'test/test_bacon.jpg',
    'test/test_gchicken.jpg',
    'test/test_rice.jpg',
    'test/test_salad.jpg'
]

for img_path in test_images:
    print(f"\n{'=' * 50}")
    print(f"Testare: {img_path}")
    print('=' * 50)

    results = model.predict(img_path, conf=0.15, save=True)

    for box in results[0].boxes:
        cls_id = int(box.cls[0])
        cls_name = model.names[cls_id]
        conf = float(box.conf[0])
        print(f"  {cls_name}: {conf * 100:.1f}%")

    if len(results[0].boxes) == 0:
        print(" Nimic detectat")

print(f"\n Imagini salvate în: runs/detect/predict/")