import { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

export function QuickAddEditModal({isOpen,onClose,meal,onAdd,isLoading}){
    const [grams,setGrams]=useState(meal?.grams || 0);
    const [mealType, setMealType] = useState('');
    const [mealTypeError, setMealTypeError] = useState('');
    useEffect(()=>{
        if(meal){
        setGrams(meal.grams||0);
        setMealType('');
        setMealTypeError('');
        }
    },[meal]);

    const calculateNutrition = () => {
        if (!meal) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
        const gramsValue = parseInt(grams) || 0;
        if (gramsValue === 0 || isNaN(gramsValue)) {
            return { calories: 0, protein: 0, carbs: 0, fat: 0 };
        }
        const ratio = gramsValue / meal.grams;
        return {
            calories: Math.round(meal.calories * ratio),
            protein:  Math.round((meal.protein_g || 0) * ratio),
            carbs:    Math.round((meal.carbs_g   || 0) * ratio),
            fat:      Math.round((meal.fat_g     || 0) * ratio),
        };
    };

    const nutrition=calculateNutrition();
    const handleGramsChange=(e)=>{
        const value=e.target.value;
        if(value===''){
            setGrams(value);
            return;
            }
        const numValue=parseInt(value);
        if (!isNaN(numValue) && numValue >= 0) {
            setGrams(numValue);
        }
        };

    const handleAdd=()=>{
        if (!mealType) {
            setMealTypeError('Please select a meal type');
            return;
        }
        setMealTypeError('');
        onAdd({
            name:      meal.label,
            grams:     parseInt(grams) || 0,
            calories:  nutrition.calories,
            protein_g: nutrition.protein,
            carbs_g:   nutrition.carbs,
            fat_g:     nutrition.fat,
        }, mealType);
        };
    if(!meal) return null;

    return(
        <Modal isOpen={isOpen} onClose={onClose} title="Add to Diary">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {meal.label}
                    </h3>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grams
                    </label>
                    <input
                        type="number"
                        value={grams}
                        onChange={handleGramsChange}
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-primary-600 focus:border-transparent"
                    />
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 font-medium mb-2">
                        Nutrition Info
                    </p>
                    <p className="text-2xl font-bold text-primary-600 mb-2">
                        {nutrition.calories} kcal
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                        <span>Protein: <strong>{nutrition.protein}g</strong></span>
                        <span>•</span>
                        <span>Carbs: <strong>{nutrition.carbs}g</strong></span>
                        <span>•</span>
                        <span>Fat: <strong>{nutrition.fat}g</strong></span>
                    </div>
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                         Meal Type
                     </label>
                     <div className="grid grid-cols-2 gap-2">
                            {MEAL_TYPES.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        setMealType(type);
                                        setMealTypeError('');
                                    }}
                                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors
                                        ${mealType === type
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                     </div>
                     {mealTypeError && (
                            <p className="text-red-500 text-xs mt-1">{mealTypeError}</p>
                        )}
                </div>
                <button
                    onClick={handleAdd}
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                                Adding...
                        </span>
                        ): 'Add'}
                </button>
            </div>
        </Modal>
        );
    }