import { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';

export function EditMealModal({isOpen,onClose,meal,onSave,onDelete}){
    const [grams,setGrams]=useState(meal?.grams||0);
    useEffect(()=>{
        if(meal){
            setGrams(meal.grams||0);
            }
        },[meal]);

    const calculateNutrition=()=>{
        if(!meal) return {calories:0,protein:0,carbs:0,fat:0};
        const gramsValue = parseInt(grams) || 0;
        if (gramsValue === 0||isNaN(gramsValue)) {
            return { calories: 0, protein: 0, carbs: 0, fat: 0 };
        }
        const ratio=grams/meal.grams;
        return{
            calories:Math.round(meal.calories*ratio),
            protein:Math.round((meal.protein_g||0)*ratio),
            carbs:Math.round((meal.carbs_g||0)*ratio),
            fat:Math.round((meal.fat_g||0)*ratio),
            };
        };
    const nutrition=calculateNutrition();

    const handleSave=()=>{
        onSave({
            ...meal,
            grams:parseInt(grams)||0,
            calories: nutrition.calories,
            protein_g: nutrition.protein,
            carbs_g: nutrition.carbs,
            fat_g: nutrition.fat,
            });
        onClose();
        };

    const handleDelete=()=>{
        if (window.confirm(`Are you sure you want to delete "${meal.name}"?`)){
            onDelete(meal.id);
            onClose();
            }
        };
    const handleGramsChange=(e)=>{
        const value=e.target.value;
        if(value===''){
            setGrams(value);
            return;
            }
        const numValue=parseInt(value);
        if (!isNaN(numValue)&&numValue>=0) {
            setGrams(numValue);
           }
        };
    if(!meal) return null;

    return(
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Meal">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {meal.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {meal.type} • {meal.time}
                    </p>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-600 focus:border-transparent"
                    />
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 font-medium mb-2">
                        Nutrition Info
                    </p>
                    <p className="text-2xl font-bold text-primary-600 mb-2">
                        {nutrition.calories} kcal
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>Protein: <strong>{nutrition.protein}g</strong></span>
                        <span>•</span>
                        <span>Carbs: <strong>{nutrition.carbs}g</strong></span>
                        <span>•</span>
                        <span>Fat: <strong>{nutrition.fat}g</strong></span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleDelete}
                        className="flex-1 py-3 px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                    >
                        Delete
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </Modal>
        );
    }