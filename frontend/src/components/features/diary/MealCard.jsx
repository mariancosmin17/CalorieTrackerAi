import {PencilIcon} from '@heroicons/react/24/outline';
export function MealCard({meal,onEdit}){
    const handleEdit=(e)=>{
        e.stopPropagation();
        onEdit(meal);
        };
    return (
        <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="flex-1">
               <h4 className="font-semibold text-gray-900 mb-1">
                   {meal.name}
               </h4>
               <p className="text-sm text-gray-500 mb-2">
                   {meal.time}
               </p>
               <p className="text-sm text-gray-600">
                   <span className="font-medium">{meal.grams}g</span>
                   {' • '}
                   <span className="font-bold text-primary-600">{meal.calories} kcal </span>
               </p>
            </div>
            <button
                onClick={handleEdit}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Edit meal"
            >
               <PencilIcon className="w-5 h-5 text-primary-600" />
            </button>
          </div>
        </div>

        );
    }
