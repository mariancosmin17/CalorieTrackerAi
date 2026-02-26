import { useState } from 'react';
import { XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';

export function DetectedFoodsModal({ isOpen, onClose, foods, setFoods }) {
    const [editingIndex, setEditingIndex] = useState(null);
    const [editGrams, setEditGrams] = useState('');

    if (!isOpen) return null;

    const totalCalories = foods.reduce((sum, f) => sum + (f.calories || 0), 0);
    const totalProtein = foods.reduce((sum, f) => sum + (f.protein_g || 0), 0);
    const totalCarbs = foods.reduce((sum, f) => sum + (f.carbs_g || 0), 0);
    const totalFat = foods.reduce((sum, f) => sum + (f.fat_g || 0), 0);

    const handleDeleteFood = (index) => {
        setFoods(prev => prev.filter((_, i) => i !== index));
    };

    const handleStartEdit = (index) => {
        setEditingIndex(index);
        setEditGrams(foods[index].grams.toString());
    };

    const handleSaveEdit = (index) => {
        const newGrams = parseInt(editGrams) || 0;
        if (newGrams <= 0) {
            setEditingIndex(null);
            return;
        }
        const originalFood = foods[index];
        const ratio = newGrams / originalFood.grams;

        setFoods(prev => prev.map((food, i) => {
            if (i !== index) return food;
            return {
                ...food,
                grams: newGrams,
                calories: Math.round(food.calories * ratio * 100) / 100,
                protein_g: Math.round(food.protein_g * ratio * 100) / 100,
                carbs_g: Math.round(food.carbs_g * ratio * 100) / 100,
                fat_g: Math.round(food.fat_g * ratio * 100) / 100,
            };
        }));
        setEditingIndex(null);
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditGrams('');
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
            onClick={handleBackdropClick}
        >
            <div className="bg-white w-full max-w-2xl rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
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

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {/* Totals summary */}
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

                    {/* Foods list */}
                    {foods.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-400">All foods removed</p>
                        </div>
                    ) : (
                        <div className="space-y-3 mb-4">
                            {foods.map((food, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-200 rounded-xl p-4"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">
                                                {food.name}
                                            </h3>
                                            {editingIndex === index ? (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <input
                                                        type="number"
                                                        value={editGrams}
                                                        onChange={(e) => setEditGrams(e.target.value)}
                                                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                                        min="1"
                                                        autoFocus
                                                    />
                                                    <span className="text-sm text-gray-500">g</span>
                                                    <button
                                                        onClick={() => handleSaveEdit(index)}
                                                        className="text-xs px-2 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-primary-600 font-medium">
                                                    {food.grams}g • {Math.round(food.calories)} kcal
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {editingIndex !== index && (
                                                <button
                                                    onClick={() => handleStartEdit(index)}
                                                    className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title="Edit grams"
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteFood(index)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove food"
                                            >
                                                <XMarkIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    {editingIndex !== index && (
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span>P: {Math.round(food.protein_g)}g</span>
                                            <span>C: {Math.round(food.carbs_g)}g</span>
                                            <span>F: {Math.round(food.fat_g)}g</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer buttons */}
                <div className="px-6 py-4 border-t border-gray-200 bg-white rounded-b-3xl">
                    <button
                        onClick={onClose}
                        className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}