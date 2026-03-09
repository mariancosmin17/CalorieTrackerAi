import { useState,useEffect,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CaloriesTab } from '../../components/features/dashboard/CaloriesTab';
import { NutrientsTab } from '../../components/features/dashboard/NutrientsTab';
import { BottomNavbar } from '../../components/layout/BottomNavbar';
import { getFoodHistory } from '../../api/foodApi';
import { getProfile } from '../../api/profileApi';
import { resolveCalorieGoal, calculateMacroGoals } from '../../utils/calorieCalculator';

export function DashboardPage() {

    const [activeTab, setActiveTab] = useState('calories');
    const navigate=useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [todaysMeals,setTodaysMeals]=useState([]);
    const [isLoading,setIsLoading]=useState(null);
    const [calorieGoal, setCalorieGoal] = useState(2000);
    const [macroGoals, setMacroGoals] = useState({ protein: 150, carbs: 250, fat: 65 });

    useEffect(() => {
        const fetchProfileGoals = async () => {
            try {
                const profile = await getProfile();
                const calculated = resolveCalorieGoal(profile);
                if (calculated) {
                    setCalorieGoal(calculated);
                    setMacroGoals(calculateMacroGoals(calculated));
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            }
        };
        fetchProfileGoals();
    }, []);

    const fetchTodaysMeals = useCallback(async () => {
        setIsLoading(true);
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const response = await getFoodHistory(todayStr);

            if (response && response.history) {
                const normalized = response.history.map(item => ({
                    id:       item.id,
                    name:     item.label,
                    type:     item.meal_type,
                    time:     item.meal_time,
                    calories: item.calories,
                    protein_g: item.protein_g,
                    carbs_g:   item.carbs_g,
                    fat_g:     item.fat_g,
                }));
                setTodaysMeals(normalized);
            } else {
                setTodaysMeals([]);
            }
        } catch (err) {
            console.error('Failed to fetch today meals:', err);
            setTodaysMeals([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTodaysMeals();
    }, [fetchTodaysMeals]);

    const caloriesConsumed = todaysMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const proteinConsumed = todaysMeals.reduce((sum, m) => sum + (m.protein_g || 0), 0);
    const carbsConsumed   = todaysMeals.reduce((sum, m) => sum + (m.carbs_g   || 0), 0);
    const fatConsumed     = todaysMeals.reduce((sum, m) => sum + (m.fat_g     || 0), 0);

    const lastThreeMeals = todaysMeals.slice(0, 3);

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
                        {activeTab === 'calories' ? <CaloriesTab consumed={caloriesConsumed} goal={calorieGoal} /> : <NutrientsTab protein={{current:Math.round(proteinConsumed),goal:macroGoals.protein }}
                                carbs={{ current:Math.round(carbsConsumed),goal:macroGoals.carbs }}
                                fat={{ current:Math.round(fatConsumed),goal:macroGoals.fat }}/>}
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
                       {isLoading && (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between p-3 animate-pulse">
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-32" />
                                        <div className="h-3 bg-gray-200 rounded w-20" />
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded w-16" />
                                </div>
                            ))}
                        </div>
                        )}
                        {!isLoading && (
                       <div className="space-y-3">
                           {lastThreeMeals.length===0 ? (
                               <p className="text-center text-gray-400 py-8">
                                   No meals logged today
                               </p>
                               ) : (
                                   lastThreeMeals.map((meal)=>(
                                       <div
                                        key={meal.id}
                                        onClick={() => handleMealClick(meal)}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
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
                                                {Math.round(meal.calories)} kcal
                                            </p>
                                        </div>
                                       </div>
                                       ))
                                   )}
                       </div>
                       )}
                </div>
            </div>
            <BottomNavbar/>
        </div>
    );
}