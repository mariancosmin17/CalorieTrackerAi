import { useState,useEffect,useCallback,useRef } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { ArrowLeftIcon, MagnifyingGlassIcon,ChevronDownIcon } from '@heroicons/react/24/outline';
import { MealCard } from '../../components/features/diary/MealCard';
import { EditMealModal } from '../../components/features/diary/EditMealModal';
import { BottomNavbar } from '../../components/layout/BottomNavbar';
import { DatePicker } from '../../components/common/DatePicker';
import { getFoodHistory,updateMeal,deleteMeal } from '../../api/foodApi';
import { getProfile } from '../../api/profileApi';
import { resolveCalorieGoal } from '../../utils/calorieCalculator';

export function DiaryPage(){
    const navigate=useNavigate();
    const location = useLocation();
    const [searchQuery,setSearchQuery]=useState('');
    const [isEditModalOpen,setIsEditModalOpen]=useState(false);
    const [selectedMeal,setSelectedMeal]=useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

    const [meals,setMeals]=useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const openMealHandled=useRef(false);
    const [calorieGoal, setCalorieGoal] = useState(2000);

    useEffect(() => {
        const fetchProfileGoal = async () => {
            try {
                const profile = await getProfile();
                const calculated = resolveCalorieGoal(profile);
                if (calculated) setCalorieGoal(calculated);
            } catch (err) {
            }
        };
        fetchProfileGoal();
    }, []);

  const fetchMeals=useCallback(async()=>{
      setIsLoading(true);
      setError(null);
      try{
          const year = selectedDate.getFullYear();
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const day = String(selectedDate.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          const response=await getFoodHistory(dateStr);
          if(response && response.history){
              const normalized=response.history.map(item=>({
                  id:item.id,
                  name:item.label,
                  type:item.meal_type,
                  time:item.meal_time,
                  grams:item.grams,
                  calories:item.calories,
                  protein_g:item.protein_g,
                  carbs_g:item.carbs_g,
                  fat_g:item.fat_g,
                  }));
              setMeals(normalized);
              }
          else{setMeals([]);}
          }
      catch(err){console.error('Failed to fetch meals:', err);
            setError('Could not load meals. Please try again.');
            setMeals([]);}
      finally{setIsLoading(false);}
      },[selectedDate]);

  useEffect(()=>{
      fetchMeals();
      },[fetchMeals]);

  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories||0), 0);
  const remainingCalories = calorieGoal - totalCalories;

  const mealsByType={
      Breakfast:meals.filter(m=>m.type==='Breakfast'),
      Lunch:meals.filter(m=>m.type==='Lunch'),
      Snack:meals.filter(m=>m.type==='Snack'),
      Dinner:meals.filter(m=>m.type==='Dinner'),
      };

  const filteredMealsByType = Object.entries(mealsByType).reduce((acc, [type, typeMeals]) => {
    const filtered = typeMeals.filter(meal =>
      meal.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[type] = filtered;
    }
    return acc;
  }, {});

  const handleBack= ()=>{
      navigate('/dashboard');
      };

  const handleEditMeal=(meal)=>{
      setSelectedMeal(meal);
      setIsEditModalOpen(true);
      };

  const handleSaveMeal=async (updatedMeal)=>{
      try{
          await updateMeal(updatedMeal.id,{
              grams:updatedMeal.grams,
              calories:updatedMeal.calories,
              protein_g:updatedMeal.protein_g,
              carbs_g:updatedMeal.carbs_g,
              fat_g:updatedMeal.fat_g,
              });
      setIsEditModalOpen(false);
      fetchMeals();
      }
      catch (err) {
        console.error('Failed to update meal:', err);
      }
};

  const handleDeleteMeal=async (mealId)=>{
      try {
        await deleteMeal(mealId);
        setIsEditModalOpen(false);
        fetchMeals();
    } catch (err) {
        console.error('Failed to delete meal:', err);
    }
};

  useEffect(() =>{
    const openMealId=location.state?.openMealId;
    if (!openMealId || openMealHandled.current) return;
    const meal=meals.find(m => m.id===openMealId);
      if (meal) {
        openMealHandled.current = true;
        setSelectedMeal(meal);
        setIsEditModalOpen(true);
        window.history.replaceState({},document.title);
      }
  },[location.state,meals]);

  useEffect(()=>{
      const handleClickOutside=(e)=>{
          if(isDatePickerOpen && !e.target.closest('.date-picker-container')){
              setIsDatePickerOpen(false);
              }
          };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
      },[isDatePickerOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1F44] via-[#1E3A5F] to-gray-100 pb-20">
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-3xl font-bold text-white mb-1">
            Food Diary
          </h1>
          <div className="relative date-picker-container">
              <button
                onClick={()=> setIsDatePickerOpen(!isDatePickerOpen)}
                className="flex items-center gap-2 text-blue-200 text-sm hover:text-white transition-colors"
              >
                  <span>
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <ChevronDownIcon className="w-4 h-4" />
              </button>
              {isDatePickerOpen && (
                  <DatePicker
                    selectedDate={selectedDate}
                    onDateSelect={(date) => {
                        setSelectedDate(date);
                        setIsDatePickerOpen(false);
                    }}
                    onClose={()=> setIsDatePickerOpen(false)}
                  />
                  )}
          </div>
        </div>
        <div className="bg-white  rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="p-5 pb-4">
            <div className="flex items-end justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">
                  Consumed
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(totalCalories)}
                </p>
              </div>
              <div className="text-2xl font-light text-gray-400 mx-4 mb-2">
                /
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">
                  Goal
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {calorieGoal}
                </p>
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm text-gray-500 mb-1">
                  Remaining
                </p>
                <p className="text-2xl font-bold text-primary-600">
                  {remainingCalories >= 0 ? remainingCalories : 0}
                </p>
              </div>
            </div>
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-primary-600 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${calorieGoal > 0 ? Math.min((totalCalories / calorieGoal) * 100, 100) : 0}%`
                }}
              />
            </div>
          </div>
          <div className="p-4 pt-0">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search meals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        {isLoading && (
            <div className="space y-4">
                {[1,2,3].map(i=>(
                    <div key={i} className="bg-white rounded-2xl shadow-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
                        <div className="h-16 bg-gray-100 rounded-xl" />
                    </div>
                    ))}
            </div>
            )}
        {!isLoading && error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                        <p className="text-red-600 text-sm">{error}</p>
                        <button
                            onClick={fetchMeals}
                            className="mt-3 text-sm text-primary-600 font-medium hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                )}
        {!isLoading && !error && (
            <div className="space-y-6">
              {Object.entries(filteredMealsByType).length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <p className="text-gray-400">
                    {searchQuery ? 'No meals found' : 'No meals logged today'}
                  </p>
                </div>
              ) : (
                Object.entries(filteredMealsByType).map(([type, typeMeals]) => (
                  <div key={type}>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      {type}
                    </h3>
                    <div className="space-y-3">
                      {typeMeals.map((meal) => (
                        <MealCard
                          key={meal.id}
                          meal={meal}
                          onEdit={handleEditMeal}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
            )}
      </div>
      <EditMealModal
        isOpen={isEditModalOpen}
        onClose={()=>setIsEditModalOpen(false)}
        meal={selectedMeal}
        onSave={handleSaveMeal}
        onDelete={handleDeleteMeal}
      />
      <BottomNavbar />
    </div>
  );
  }