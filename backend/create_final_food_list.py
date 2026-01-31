from pathlib import Path
from collections import Counter
from datasets import load_dataset


FINAL_FOOD_CLASSES = [

    'lettuce', 'beef', 'bread', 'food', 'potato', 'onion', 'tomato',
    'green bean', 'cake', 'soup', 'strawberry', 'mushroom', 'egg',
    'shrimp', 'sausage', 'dessert', 'crisp', 'whipped cream', 'ice cream',
    'pizza', 'egg yolk', 'salad', 'sandwich', 'chicken', 'ham', 'pepper',
    'pea', 'egg roll', 'green onion', 'pancake',


    'sushi', 'pastry', 'lemon', 'broccoli', 'cucumber', 'tortilla',
    'asparagus', 'condiment', 'berry', 'coffee', 'rice', 'noodle',
    'pasta', 'cheese', 'bacon', 'fish', 'pork', 'meat', 'steak',
    'orange', 'apple', 'banana', 'grape', 'pineapple', 'watermelon',
    'corn', 'avocado', 'spinach', 'celery', 'radish', 'zucchini',
    'eggplant', 'cauliflower', 'cabbage', 'kale', 'squash',
    'garlic', 'ginger', 'herb', 'parsley', 'basil', 'cilantro',
    'sauce', 'gravy', 'dressing', 'ketchup', 'mayonnaise', 'mustard',
    'butter', 'oil', 'cream', 'milk', 'yogurt',
    'cookie', 'brownie', 'muffin', 'donut', 'croissant', 'bagel',
    'waffle', 'french toast', 'cereal', 'oatmeal', 'granola',
    'chocolate', 'candy', 'pudding', 'pie', 'tart', 'cupcake',
    'nut', 'almond', 'walnut', 'peanut', 'cashew', 'pecan',
    'seed', 'sesame', 'sunflower seed',
    'bean', 'lentil', 'chickpea', 'tofu', 'tempeh',
    'dumpling', 'spring roll', 'burrito', 'taco', 'quesadilla',
    'burger', 'hot dog', 'french fries', 'chips', 'popcorn',
    'pretzel', 'cracker', 'biscuit', 'scone',
    'jam', 'jelly', 'honey', 'syrup', 'marmalade',
    'tea', 'juice', 'smoothie', 'milkshake',
    'lobster', 'crab', 'oyster', 'clam', 'mussel', 'squid', 'octopus',
    'salmon', 'tuna', 'cod', 'halibut', 'sardine', 'anchovy',
    'sashimi', 'nigiri', 'maki', 'tempura',
    'curry', 'stew', 'chili', 'goulash', 'ramen', 'pho', 'udon',
    'risotto', 'paella', 'jambalaya', 'gumbo',
    'quiche', 'frittata', 'omelet', 'scrambled egg',
    'toast', 'baguette', 'roll', 'pita', 'naan', 'focaccia',
    'parmesan', 'mozzarella', 'cheddar', 'feta', 'brie', 'gouda',
    'prosciutto', 'salami', 'pepperoni', 'chorizo', 'bratwurst',
    'meatball', 'kebab', 'skewer', 'rib', 'wing', 'drumstick',
    'cutlet', 'schnitzel', 'croquette', 'nugget', 'tender',
]

FINAL_FOOD_SET = set([food.lower() for food in FINAL_FOOD_CLASSES])

DATASET_DIR = Path("data/food101_raw")
dataset = load_dataset(
    "visual-layer/food101-vl-enriched",
    cache_dir=str(DATASET_DIR)
)

train_split = dataset['train']

all_labels_in_dataset = set()

for i, example in enumerate(train_split):
    if i % 10000 == 0:
        print(f"Procesat:{i}/101000")

    for obj in example['object_labels']:
        label = obj.get('label', '').lower()
        all_labels_in_dataset.add(label)

print()

final_classes_available = FINAL_FOOD_SET.intersection(all_labels_in_dataset)

final_counter = Counter()

for i, example in enumerate(train_split):
    if i % 10000 == 0:
        print(f"Procesat:{i}/101000")

    for obj in example['object_labels']:
        label = obj.get('label', '').lower()
        if label in final_classes_available:
            final_counter[label] += 1

for i, (label, count) in enumerate(final_counter.most_common(50), 1):
    print(f"{i:2d}.{label:25s}→{count:6d}aparitii")

output_file = Path("data/final_food_classes.txt")
output_file.parent.mkdir(exist_ok=True)

with open(output_file, 'w', encoding='utf-8') as f:
    for label in sorted(final_classes_available):
        f.write(f"{label}\n")
