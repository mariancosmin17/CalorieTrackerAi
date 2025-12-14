import csv

class CalorieCalculator:
    def __init__(self,csv_path:str):
        self.calorie_map={}
        self._load_csv(csv_path)

    def _load_csv(self,csv_path:str):
        with open(csv_path,newline='',encoding='utf-8') as f:
            reader=csv.DictReader(f)
            for row in reader:
                label=row["label"]
                kcal=float(row["kcal_per_100g"])
                self.calorie_map[label]=kcal

    def calculate(self,label:str,grams:int)->float:
        if label not in self.calorie_map:
            return 0.0

        kcal_per_100g=self.calorie_map[label]
        calories=kcal_per_100g*grams/100
        return round(calories,2)