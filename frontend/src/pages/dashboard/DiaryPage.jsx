import { useState,useEffect } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { MealCard } from '../../components/features/diary/MealCard';
import { EditMealModal } from '../../components/features/diary/EditMealModal';
import { BottomNavbar } from '../../components/layout/BottomNavbar';

export function DiaryPage(){
    const navigate=useNavigate();
    const location = useLocation();
    const [searchQuery,setSearchQuery]=useState('');
    const [isEditModalOpen,setIsEditModalOpen]=useState(false);
    const [selectedMeal,setSelectedMeal]=useState(null);
    const calorieGoal=2000;
    const meals = [
    {
      id: 1,
      name: 'carnati',
      type: 'Breakfast',
      time: '08:30',
      grams: 250,
      calories: 320,
    },
    {
      id: 2,
      name: 'Piept de pui cu orez',
      type: 'Lunch',
      time: '13:00',
      grams: 350,
      calories: 450,
    },
    {
      id: 3,
      name: 'Iaurt grecesc',
      type: 'Snack',
      time: '16:30',
      grams: 150,
      calories: 150,
    },
    {
      id: 4,
      name: 'Somon la grătar',
      type: 'Dinner',
      time: '19:00',
      grams: 200,
      calories: 280,
    },
  ];
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
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

  const handleSaveMeal=(updatedMeal)=>{
      console.log('Save meal:', updatedMeal);
      setIsEditModalOpen(false);
      };

  const handleDeleteMeal=(mealId)=>{
      console.log('Delete meal:', mealId);
      setIsEditModalOpen(false);
      };

  useEffect(() =>{
    const openMealId=location.state?.openMealId;
    if (openMealId) {
      const meal=meals.find(m => m.id===openMealId);
      if (meal) {
        setSelectedMeal(meal);
        setIsEditModalOpen(true);
      }
      window.history.replaceState({},document.title);
    }
  },[location.state]);

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
          <p className="text-blue-200 text-sm">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="bg-blue-50  rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="p-4 bg-blue-50 ">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-900 font-medium mb-1">
                  Total Calories
                </p>
                <p className="text-2xl font-bold text-primary-600">
                  {totalCalories} kcal
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-900 font-medium mb-1">
                  Remaining
                </p>
                <p className="text-2xl font-bold text-primary-600">
                  {remainingCalories} kcal
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search meals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
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