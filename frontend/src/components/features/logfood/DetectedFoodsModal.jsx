import { useState } from 'react';
import { XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import { EditMealModal } from '../diary/EditMealModal';
const MEAL_TYPES=['Breakfast','Lunch','Snack','Dinner'];

export function DetectedFoodsModal({ isOpen,onClose,foods,setFoods,onLogFood,isLogging }) {
    const [editingFood, setEditingFood] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [mealType,setMealType]=useState('');
    const [mealTypeError,setMealTypeError]=useState('');

    if (!isOpen) return null;

    const totalCalories = foods.reduce((sum, f) => sum + (f.calories || 0), 0);
    const totalProtein = foods.reduce((sum, f) => sum + (f.protein_g || 0), 0);
    const totalCarbs = foods.reduce((sum, f) => sum + (f.carbs_g || 0), 0);
    const totalFat = foods.reduce((sum, f) => sum + (f.fat_g || 0), 0);

    const handleDeleteFood = (index) => {
        setFoods(prev => prev.filter((_, i) => i !== index));
    };

    const handleFoodClick=(index)=>{
        setEditingFood({...foods[index],_index:index});
        setIsEditOpen(true);
        }

    const handleEditSave=(updatedMeal)=>{
        const index=updatedMeal._index;
        setFoods(prev=>prev.map((food,i)=>{
            if(i!=index) return food;
            return{
                ...food,
                grams:updatedMeal.grams,
                calories:updatedMeal.calories,
                protein_g:updatedMeal.protein_g,
                carbs_g:updatedMeal.carbs_g,
                fat_g:updatedMeal.fat_g,
                };
            }));
        setIsEditOpen(false);
        setEditingFood(null);
        }

    const handleEditDelete=(id)=>{
        const index=editingFood._index;
        setFoods(prev=>prev.filter((_,i)=>i!==index));
        setIsEditOpen(false);
        setEditingFood(null);
        }

    const handleLogFood=()=>{
        if(!mealType){
            setMealTypeError('Please select a meal type');
            return;
            }
        setMealTypeError('');
        onLogFood(mealType);
        };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

     return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
                onClick={handleBackdropClick}
            >
                <div className="bg-white w-full max-w-2xl rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up">
                    <div className="flex items-center justify-between px-6 py-4">
                        <h2 className="text-xl font-bold text-gray-900">
                            Detected Foods
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 pb-4">
                        <div className="bg-blue-50 rounded-xl p-4 mb-4">
                            <p className="text-sm text-gray-600 font-medium mb-1">Total</p>
                            <p className="text-2xl font-bold text-primary-600 mb-2">
                                {Math.round(totalCalories)} kcal
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>P: <strong>{Math.round(totalProtein)}g</strong></span>
                                <span>C: <strong>{Math.round(totalCarbs)}g</strong></span>
                                <span>F: <strong>{Math.round(totalFat)}g</strong></span>
                            </div>
                        </div>
                        {foods.length===0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-400">All foods removed</p>
                            </div>
                        ) : (
                            <div className="mb-4">
                                {foods.map((food,index)=>(
                                    <div
                                        key={index}
                                        onClick={()=>handleFoodClick(index)}
                                        className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">
                                                {food.name}
                                            </h3>
                                            <p className="text-sm text-primary-600 font-medium">
                                                {food.grams}g • {Math.round(food.calories)} kcal
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                                <span>P: {Math.round(food.protein_g)}g</span>
                                                <span>C: {Math.round(food.carbs_g)}g</span>
                                                <span>F: {Math.round(food.fat_g)}g</span>
                                            </div>
                                        </div>
                                        <XMarkIcon
                                            className="w-5 h-5 text-red-400 hover:text-red-600 flex-shrink-0 ml-2"
                                            onClick={(e)=>{
                                                e.stopPropagation();
                                                setFoods(prev=>prev.filter((_,i)=>i!==index));
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mb-2">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Meal Type <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {MEAL_TYPES.map((type)=>(
                                    <button
                                        key={type}
                                        onClick={()=>{
                                            setMealType(type);
                                            setMealTypeError('');
                                        }}
                                        className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all
                                            ${mealType===type
                                                ? 'bg-primary-600 text-white shadow-sm'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                    </div>
                    <div className="px-6 pt-4 pb-6 border-t border-gray-200 bg-white">
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogFood}
                                disabled={foods.length===0||isLogging}
                                className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLogging ? 'Saving...' : 'Log Food'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <EditMealModal
                isOpen={isEditOpen}
                onClose={()=>{setIsEditOpen(false);setEditingFood(null);}}
                meal={editingFood}
                onSave={handleEditSave}
                onDelete={handleEditDelete}
            />
        </>
    );
}