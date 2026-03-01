import { useState, useRef,useEffect,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PhotoIcon,
  CameraIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { BottomNavbar } from '../../components/layout/BottomNavbar';
import { analyzeFoodImage,SaveMealToHistory,getFoodHistory } from '../../api/foodApi';
import { DetectedFoodsModal } from '../../components/features/logfood/DetectedFoodsModal';
import { QuickAddEditModal } from '../../components/features/logfood/QuickAddEditModal';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
const PAGE_SIZE=10;

export function LogFoodPage(){
    const navigate=useNavigate();
    const fileInputRef=useRef(null);

    const [selectedImage,setSelectedImage]=useState(null);
    const [imagePreview,setImagePreview]=useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const [detectedFoods, setDetectedFoods] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLogging,setIsLogging]=useState(false);
    const [recentMeals,setRecentMeals]=useState([]);
    const [isLoadingMeals,setIsLoadingMeals]=useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [expandedMealLabel,setExpandedMealLabel]=useState(null);
    const [savingMealLabel, setSavingMealLabel] = useState(null);
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [isQuickAdding, setIsQuickAdding] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const fetchRecentMeals=useCallback(async ()=>{
        setIsLoadingMeals(true);
        try{
            const thirtyDaysAgo=new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate()-30);
            const fromDate=thirtyDaysAgo.toISOString().split('T')[0];
            const response=await getFoodHistory();
            if(response && response.history){
                const filtered=response.history.filter(item=> item.log_date>=fromDate);
                const seen=new Map();
                filtered.forEach(item=>{
                    if(!seen.has(item.label)){seen.set(item.label,item);}
                    });
                setRecentMeals(Array.from(seen.values()));
                }
            }
        catch(err){console.error('Failed to fetch recent meals:', err)}
        finally{setIsLoadingMeals(false);}
        },[]);

    useEffect(()=>{fetchRecentMeals();},[fetchRecentMeals]);

    const filteredMeals=recentMeals.filter(meal=>meal.label.toLowerCase().includes(searchQuery.toLowerCase()));
    const visibleMeals=filteredMeals.slice(0,visibleCount);
    const hasMore=visibleCount<filteredMeals.length;

    const handleLoadMore=()=>setVisibleCount(prev=>prev+PAGE_SIZE);

    const handleSearchChange=(e)=>{
        setSearchQuery(e.target.value);
        setVisibleCount(PAGE_SIZE);
        setExpandedMealLabel(null);
        };

    const handleToggleSelector=(e,mealLabel)=>{
        e.stopPropagation();
        setExpandedMealLabel(prev=>prev===mealLabel ? null: mealLabel);
        };

    const handleQuickAddDirect=async (e,meal,mealType)=>{
        e.stopPropagation();
        setSavingMealLabel(meal.label);
        try{
            const now=new Date();
            const response=await SaveMealToHistory({
                foods: [{
                    name: meal.label,
                    grams: meal.grams,
                    calories: meal.calories,
                    protein_g: meal.protein_g || 0,
                    carbs_g: meal.carbs_g || 0,
                    fat_g: meal.fat_g || 0,
                }],
                meal_type: mealType,
                meal_time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                log_date: now.toISOString().split('T')[0],
                });
            if (response && response.success) {
                setExpandedMealLabel(null);
                setSuccessMsg('Meal added to diary!');
                fetchRecentMeals();
            } else {
                throw new Error('Failed to save');
            }
            }
        catch (err) {
            console.error('Quick add failed:', err);
        } finally {
            setSavingMealLabel(null);
        }
        };

     const handleOpenQuickAdd = (meal) => {
        setExpandedMealLabel(null);
        setSelectedMeal(meal);
        setIsQuickAddOpen(true);
    };

    const handleQuickAdd=async (foodData,mealType)=>{
        setIsQuickAdding(true);
        try{
            const now=new Date();
            const response = await SaveMealToHistory({
                foods: [foodData],
                meal_type: mealType,
                meal_time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                log_date: now.toISOString().split('T')[0],
            });
            if (response && response.success) {
                setIsQuickAddOpen(false);
                setSelectedMeal(null);
                setSuccessMsg('Meal added to diary!');
                fetchRecentMeals();
            } else {
                throw new Error('Failed to save meal');
            }
            }
        catch (err) {
            console.error('Quick add modal failed:', err);
        } finally {
            setIsQuickAdding(false);
        }
        };

    const handleCloseQuickAdd = () => {
        setIsQuickAddOpen(false);
        setSelectedMeal(null);
    };

    const handleBack=()=>{
        navigate('/dashboard');
    };

    const handleUploadClick=()=>{
        fileInputRef.current?.click();
    };

    const handleFileSelect=(e)=>{
        const file=e.target.files[0];
        if(file){
            setSelectedImage(file);
            const reader=new FileReader();
            reader.onloadend=()=>{
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage=()=>{
        setImagePreview(null);
        setSelectedImage(null);
        if(fileInputRef.current){
            fileInputRef.current.value='';
        }
    };

    const handleTakePhoto = () => {
        alert('Camera feature coming soon!');
    };

    const handleAnalyze = async () => {
        if(!selectedImage){
            setError('Please select an image first');
            return;
        }
        setIsAnalyzing(true);
        setError(null);
        try{
            const response=await analyzeFoodImage(selectedImage);
            console.log('RAW response:', response);

            if (response && response.success && response.foods_detected) {
                setDetectedFoods(response.foods_detected);
                setIsModalOpen(true);
            } else {
                console.error('Invalid response structure:', response);
                throw new Error('Analysis failed: Invalid response structure');
            }
        }
        catch(err){
            setError(err.message || 'Failed to analyze image. Please try again.');
        }
        finally{
            setIsAnalyzing(false);
        }
    };

    const handleLogFood=async (mealType)=>{
        if(detectedFoods.length==0)
        return;
        setIsLogging(true);
        try{
            const now=new Date();
            const mealTime=now.toLocaleTimeString('en-GB',{
                hour:'2-digit',
                minute:'2-digit'
            });
            const logDate=now.toISOString().split('T')[0];
            const requestData={
                foods:detectedFoods,
                meal_type:mealType,
                meal_time:mealTime,
                log_date:logDate,
                };
            const response=await SaveMealToHistory(requestData);
            if(response&&response.success){
                setIsModalOpen(false);
                setDetectedFoods([]);
                handleRemoveImage();
                fetchRecentMeals();
                navigate('/log-food');
                }
            else{
                throw new Error('Failed to save meal');
                }
        }
        catch(err){
            setError(err.message||'Failed to log food. Please try again.');
            }
        finally{
            setIsLogging(false);
            }
        };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setDetectedFoods([]);
        handleRemoveImage();
    };

    useEffect(() => {
      if (successMsg) {
        const timer = setTimeout(() => setSuccessMsg(''), 2000);
        return () => clearTimeout(timer);
      }
    }, [successMsg]);

    return(
        <div className="min-h-screen bg-gradient-to-b from-[#0A1F44] via-[#1E3A5F] to-gray-100 pb-20">
            {successMsg && (
              <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[200] bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl font-semibold text-base transition-opacity animate-fade-in">
                {successMsg}
              </div>
            )}
            <div className="p-6 max-w-2xl mx-auto">
                <div className="mb-6">
                   <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors mb-4"
                   >
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Back</span>
                   </button>

                   <h1 className="text-3xl font-bold text-white">
                       Log Food
                   </h1>
                   <p className="text-blue-200 text-sm mt-1">
                       Upload a photo to analyze your meal
                   </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                    <div className="px-5 py-4 pb-2">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Analyze Food Photo
                        </h2>
                    </div>
                    <div className="px-5 pt-2 pb-5">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/gif,image/bmp"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        {imagePreview ? (
                            <div className="relative mb-4">
                                <img
                                    src={imagePreview}
                                    alt="Selected food"
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                                <button
                                    onClick={handleRemoveImage}
                                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleUploadClick}
                                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-primary-500 transition-colors mb-4"
                            >
                                <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600 text-sm">
                                    Click to upload photo
                                </p>
                                <p className="text-gray-400 text-xs mt-1">
                                    PNG, JPG, GIF, or BMP (max 10MB)
                                </p>
                            </button>
                        )}

                        {imagePreview && (
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="w-full py-3 px-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isAnalyzing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                        Analyzing...
                                    </span>
                                ) : 'Analyze Photo'}
                            </button>
                        )}

                        <button
                            onClick={handleTakePhoto}
                            className="w-full py-3 px-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center gap-2"
                        >
                            <CameraIcon className="w-5 h-5" />
                            Take Live Picture
                        </button>
                    </div>
                </div>
                {!imagePreview && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4">
                        <div className="px-5 py-4 pb-2">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Meals</h2>
                        </div>
                        <div className="px-5 pb-5 pt-2">
                            <div className="relative mb-3">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Search recent meals..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl  text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                                    />
                            </div>
                            {isLoadingMeals && (
                                <div className="space-y-1 py-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center justify-between py-3 px-2 animate-pulse">
                                            <div className="space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-36" />
                                                <div className="h-3 bg-gray-200 rounded w-24" />
                                            </div>
                                            <div className="w-20 h-8 bg-gray-200 rounded-lg" />
                                        </div>
                                    ))}
                                </div>
                                )}
                            {!isLoadingMeals && searchQuery && filteredMeals.length === 0 && (
                                <p className="text-center text-gray-400 text-sm py-6">
                                    No meals found for "{searchQuery}"
                                </p>
                            )}
                            {!isLoadingMeals && !searchQuery && recentMeals.length === 0 && (
                                    <p className="text-center text-gray-400 text-sm py-6">
                                        No recent meals in the last 30 days
                                    </p>
                                )}
                            {!isLoadingMeals && visibleMeals.length > 0 && (
                                <div>
                                    {visibleMeals.map((meal, index) => {
                                        const isExpanded = expandedMealLabel === meal.label;
                                        const isSaving = savingMealLabel === meal.label;
                                        return (
                                            <div
                                                key={`${meal.label}-${index}`}
                                                onClick={() => handleOpenQuickAdd(meal)}
                                                className="cursor-pointer rounded-xl hover:bg-gray-100 active:bg-gray-100 transition-colors mb-1"
                                            >

                                                <div className="flex items-center justify-between py-3 px-2">

                                                    <div className="flex-1 min-w-0 mr-3">

                                                        <p className="font-semibold text-gray-900 truncate">
                                                            {meal.label}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                           <span className="font-medium">{meal.grams}g</span>
                                                           {' • '}
                                                           <span className="font-bold text-primary-600">{Math.round(meal.calories)} kcal </span>
                                                        </p>

                                                    </div>


                                                    <button
                                                        onClick={(e) => handleToggleSelector(e, meal.label)}

                                                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-white text-xs font-semibold transition-colors
                                                            ${isExpanded
                                                                ? 'bg-primary-700'
                                                                : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800'
                                                            }`}
                                                    >
                                                        {isSaving ? (

                                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                            </svg>
                                                        ) : (
                                                            <>
                                                                <PlusIcon className="w-3.5 h-3.5 "strokeWidth={3} />

                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                                {isExpanded && (
                                                    <div className="px-2 pb-3">
                                                        {/* Linie subtilă de separare */}
                                                        <div className="border-t border-gray-100 mb-2" />
                                                        {/* Textul "Add to:" */}
                                                        <p className="text-xs text-gray-400 mb-2 px-1">Add to:</p>
                                                        {/* Coloana cu 4 opțiuni — fiecare pe rândul lui */}
                                                        <div className="flex flex-col gap-1">
                                                            {MEAL_TYPES.map(type => (
                                                                <button
                                                                    key={type}
                                                                    onClick={(e) => handleQuickAddDirect(e, meal, type)}
                                                                    disabled={isSaving}

                                                                    className="w-full py-2.5 px-3 rounded-lg text-sm font-medium text-gray-700 text-left hover:bg-primary-50 hover:text-primary-700 active:bg-primary-100 transition-colors disabled:opacity-50"
                                                                >
                                                                    {type}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {hasMore && (
                                        <button
                                            onClick={handleLoadMore}
                                            className="w-full py-3 text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors mt-1"
                                        >
                                            Load more meals
                                        </button>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>

            <DetectedFoodsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                foods={detectedFoods}
                setFoods={setDetectedFoods}
                onLogFood={handleLogFood}
                isLogging={isLogging}
            />
            <QuickAddEditModal
                isOpen={isQuickAddOpen}
                onClose={handleCloseQuickAdd}
                meal={selectedMeal}
                onAdd={handleQuickAdd}
                isLoading={isQuickAdding}
            />

            <BottomNavbar/>
        </div>
    );
}