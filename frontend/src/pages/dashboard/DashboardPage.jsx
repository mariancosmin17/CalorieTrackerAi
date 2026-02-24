import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CaloriesTab } from '../../components/features/dashboard/CaloriesTab';
import { NutrientsTab } from '../../components/features/dashboard/NutrientsTab';
import { BottomNavbar } from '../../components/layout/BottomNavbar';

export function DashboardPage() {
    const [activeTab, setActiveTab] = useState('calories');
    const navigate=useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState(null);
    const todaysMeals = [
    {
      id: 1,
      name: 'Carnati',
      type: 'Breakfast',
      time: '08:30',
      calories: 320,
      created_at: '2026-02-24',
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

   const handleMealClick = (meal)=>{
    navigate('/diary', {
      state: {
        openMealId: meal.id
            }
        });
     };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A1F44] via-[#1E3A5F] to-gray-100 pb-20">
            <div className="p-6 max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-white mb-1">
                        Dashboard
                    </h1>
                    <p className="text-blue-200 text-sm">
                        {new Date().toLocaleDateString('en-US',{
                            weekday:'long',
                            year:'numeric',
                            month:'long',
                            day:'numeric'
                            })}
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
                    <div className="flex bg-gray-50 p-1.5">
                        <button
                            onClick={() => setActiveTab('calories')}
                            className={`
                                flex-1 py-3.5 px-6 text-base font-semibold rounded-xl transition-all
                                ${
                                    activeTab === 'calories'
                                      ? 'bg-white text-primary-600 shadow-sm'
                                      : 'text-gray-500 hover:text-gray-700'
                                    }
                                `}
                        >
                            Calories
                        </button>
                        <button
                            onClick={() => setActiveTab('nutrients')}
                            className={`
                                flex-1 py-3.5 px-6 text-base font-semibold rounded-xl transition-all
                                ${
                                    activeTab === 'nutrients'
                                      ? 'bg-white text-primary-600 shadow-sm'
                                      : 'text-gray-500 hover:text-gray-700'
                                    }
                                `}
                        >
                            Nutrients
                        </button>
                    </div>
                    <div className="p-6">
                        {activeTab === 'calories' ? <CaloriesTab /> : <NutrientsTab />}
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6">
                       <div className="flex items-center justify-between mb-4">
                           <h3 className="text-lg font-semibold text-gray-900">
                               Today's Meals
                           </h3>
                           <button
                            onClick={()=>navigate('/diary')}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                           >
                               View All →
                           </button>
                       </div>
                       <div className="space-y-3">
                           {todaysMeals.length===0 ? (
                               <p className="text-center text-gray-400 py-8">
                                   No meals logged today
                               </p>
                               ) : (
                                   todaysMeals.map((meal)=>(
                                       <div
                                        key={meal.id}
                                        onClick={() => handleMealClick(meal)}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                       >
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">
                                                {meal.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {meal.type} • {meal.time}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">
                                                {meal.calories} kcal
                                            </p>
                                        </div>
                                       </div>
                                       ))
                                   )
                           }
                       </div>
                </div>
            </div>
            <BottomNavbar/>
        </div>
    );
}