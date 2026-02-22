import { ProgressRing } from '../../common/ProgressRing';
import { FireIcon,ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

export function CaloriesTab(){
    const calorieGoal=2000;
    const caloriesConsumed=920;
    const caloriesRemaining=calorieGoal - caloriesConsumed;
    const todaysMeals = [
    {
      id: 1,
      name: 'Carnati',
      type: 'Breakfast',
      time: '08:30',
      calories: 320,
    },
    {
      id: 2,
      name: 'Piept de pui cu orez',
      type: 'Lunch',
      time: '13:00',
      calories: 450,
    },
    {
      id: 3,
      name: 'Iaurt grecesc',
      type: 'Snack',
      time: '16:30',
      calories: 150,
    },
    ];
    return(
        <div className="space-y-6">
           <div>
               <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-semibold text-gray-900">
                       Calories Today
                   </h3>
                   <FireIcon className="w-6 h-6 text-orange-500"/>
               </div>
               <div className="flex justify-center py-6">
                   <ProgressRing
                        current={caloriesConsumed}
                        total={calorieGoal}
                        color="#0284c7"
                        size={200}
                   />
               </div>
               <div className="mt-6 bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                      <div>
                          <p className="text-sm text-blue-600 font-medium mb-1">
                              Remaining
                          </p>
                          <p className="text-2xl font-bold text-blue-700">
                              {caloriesRemaining} kcal
                          </p>
                      </div>
                      <ArrowTrendingUpIcon className="w-8 h-8 text-blue-500"/>
                  </div>
               </div>
           </div>
        </div>
        );
    }