import { useState,useEffect } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { ArrowLeftIcon, MagnifyingGlassIcon,ChevronDownIcon } from '@heroicons/react/24/outline';
import { MealCard } from '../../components/features/diary/MealCard';
import { EditMealModal } from '../../components/features/diary/EditMealModal';
import { BottomNavbar } from '../../components/layout/BottomNavbar';
import { DatePicker } from '../../components/common/DatePicker';

export function DiaryPage(){
    const navigate=useNavigate();
    const location = useLocation();
    const [searchQuery,setSearchQuery]=useState('');
    const [isEditModalOpen,setIsEditModalOpen]=useState(false);
    const [selectedMeal,setSelectedMeal]=useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
    const calorieGoal=2000;
    const meals = [
    {
      id: 1,
      name: 'carnati',
      type: 'Breakfast',
      time: '08:30',
      grams: 250,
      calories: 320,
      created_at: '2026-02-23',
    },
    {
      id: 2,
      name: 'Piept de pui cu orez',
      type: 'Lunch',
      time: '13:00',
      grams: 350,
      calories: 450,
      created_at: '2026-02-23'
    },
    {
      id: 3,
      name: 'Iaurt grecesc',
      type: 'Snack',
      time: '16:30',
      grams: 150,
      calories: 150,
      created_at: '2026-02-22',
    },
    {
      id: 4,
      name: 'Somon la grătar',
      type: 'Dinner',
      time: '19:00',
      grams: 200,
      calories: 280,
      created_at: '2026-02-22',
    },
    {
    id: 5,
    name: 'Omletă cu legume',
    type: 'Breakfast',
    time: '07:45',
    grams: 200,
    calories: 250,
    protein_g: 20,
    carbs_g: 10,
    fat_g: 15,
    created_at: '2026-02-21',
    },
  ];

  const filteredMealsByDate=meals.filter(meal=>{
      const mealDate=new Date(meal.created_at);
      const mealYear = mealDate.getFullYear();
      const mealMonth = mealDate.getMonth();
      const mealDay = mealDate.getDate();

      const selectedYear = selectedDate.getFullYear();
      const selectedMonth = selectedDate.getMonth();
      const selectedDay = selectedDate.getDate();

      return (
         mealYear === selectedYear &&
         mealMonth === selectedMonth &&
         mealDay === selectedDay
        );
      });

  const totalCalories = filteredMealsByDate.reduce((sum, meal) => sum + meal.calories, 0);
  const remainingCalories = calorieGoal - totalCalories;

  const mealsByType={
      Breakfast:filteredMealsByDate.filter(m=>m.type==='Breakfast'),
      Lunch:filteredMealsByDate.filter(m=>m.type==='Lunch'),
      Snack:filteredMealsByDate.filter(m=>m.type==='Snack'),
      Dinner:filteredMealsByDate.filter(m=>m.type==='Dinner'),
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
                  {totalCalories}
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