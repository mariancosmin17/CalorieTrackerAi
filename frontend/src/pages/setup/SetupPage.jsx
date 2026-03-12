import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    UserCircleIcon,
    ScaleIcon,
    BoltIcon,
    TrophyIcon,
    SparklesIcon,
    ArrowLeftIcon,
    CheckIcon,
    CalendarDateRangeIcon,
    UserIcon,
    ArrowTrendingDownIcon,
    ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { completeSetup } from '../../api/setupApi';

function ProgressBar({ step, total }) {
    const percent = Math.round((step / total) * 100);
    return(
        <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-200">Step {step} of {total}</span>
                <span className="text-sm text-blue-200">{percent}%</span>
            </div>
            <div className="w-full bg-blue-900 rounded-full h-2">
                <div
                    className="bg-primary-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
        );
    }

function StepCard({children}){
    return(
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm mx-auto">
            {children}
        </div>
            );
    }

export function SetupPage(){
    const navigate=useNavigate();
    const [step, setStep] = useState(0);
    const [age, setAge]= useState('');
    const [gender, setGender]= useState('');
    const [weight, setWeight]= useState('');
    const [height, setHeight] = useState('');
    const [activityLevel, setActivityLevel]= useState('');
    const [goalType, setGoalType]= useState('');
    const [targetWeight, setTargetWeight]= useState('');
    const [error, setError]= useState('');
    const [isLoading, setIsLoading]= useState(false);

    const bmi=weight&&height
              ? (parseFloat(weight)/Math.pow(parseFloat(height)/100,2)).toFixed(1)
              : null;
    const getBmiCategory= (bmi)=>
    {
        if (!bmi) return null;
        const b = parseFloat(bmi);
        if (b < 18.5) return { label:'Underweight', color: 'text-blue-500' };
        if (b < 25) return { label:'Normal',color: 'text-green-600' };
        if (b < 30) return { label:'Moderately Overweight',color: 'text-yellow-500' };
        return { label:'Overweight',color:'text-red-500' };
    };
    const bmiCategory=getBmiCategory(bmi);

    const goNext=()=>{setError('');setStep(s=>s+1);};
    const goBack=()=>{setError('');setStep(s=>s-1);};

    const validateStep = (s) => {
        if (s === 1) {
            if (!age || parseInt(age) < 10 || parseInt(age) > 120)
                return 'Please enter a valid age.';
            if (!gender)
                return 'Please select your gender.';
        }
        if (s === 2) {
            if (!weight || parseFloat(weight) < 20 || parseFloat(weight) > 300)
                return 'Please enter a valid weight.';
            if (!height || parseFloat(height) < 50 || parseFloat(height) > 250)
                return 'Please enter a valid height.';
        }
        if (s === 3) {
            if (!activityLevel)
                return 'Please select your activity level.';
        }
        if (s === 4) {
            if (!goalType)
                return 'Please select your goal.';
            if (goalType !== 'maintain' && (!targetWeight || parseFloat(targetWeight) < 20))
                return 'Please enter your target weight.';
        }
        return null;
    };

    const handleContinue = () => {
        const err = validateStep(step);
        if (err) { setError(err); return; }
        goNext();
    };

    const handleComplete=async()=>{
        const err=validateStep(4);
        if(err){setError(err); return;}
        setIsLoading(true);
        setError('');
        try{
            await completeSetup({
                age:parseInt(age),
                gender,
                weight_kg:parseFloat(weight),
                height_cm:parseFloat(height),
                activity_level:activityLevel,
                goal_type:goalType,
                weight_goal_kg:goalType !== 'maintain' ? parseFloat(targetWeight) : null,
                });
            navigate('/dashboard');
            }
        catch(err){setError(err.response?.data?.detail || 'Something went wrong. Please try again.');}
        finally{setIsLoading(false);}
        };

    return(
        <div className="min-h-screen bg-gradient-to-b from-[#0A1F44] via-[#1E3A5F] to-gray-100 flex flex-col items-center justify-center p-6">
            {step==0 && (
                <StepCard>
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center">
                            <SparklesIcon className="w-9 h-9 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                        Welcome!
                    </h1>
                    <p className="text-gray-500 text-center text-sm mb-8">
                        Let's set up your profile to get started
                    </p>
                    <div className="space-y-3 mb-8">
                        <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl">
                            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <TrophyIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">Set Your Goals</p>
                                <p className="text-xs text-gray-500">Define your weight and fitness targets</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-green-50 rounded-xl">
                            <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <BoltIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">Track Progress</p>
                                <p className="text-xs text-gray-500">Monitor your journey with detailed stats</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-xl">
                            <div className="w-9 h-9 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <SparklesIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">AI Food Detection</p>
                                <p className="text-xs text-gray-500">Analyze meals automatically with photos</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setStep(1)}
                        className="w-full py-4 bg-primary-600 text-white rounded-2xl font-semibold hover:bg-primary-700 transition-colors"
                    >
                        Get Started
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-3">
                        This will only take 2 minutes
                    </p>
                </StepCard>
            )}
            {step==1 && (
                <div className="w-full max-w-sm mx-auto">
                    <div className="mb-6">
                        <button
                            onClick={goBack}
                            className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-4"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            <span className="text-sm">Back</span>
                        </button>
                        <ProgressBar step={1} total={4} />
                    </div>
                    <StepCard>
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-primary-600 rounded-2xl flex items-center justify-center">
                                <UserCircleIcon className="w-9 h-9 text-white" />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
                            Tell us about yourself
                        </h2>
                        <p className="text-primary-600 text-center text-sm mb-6">
                            This helps us personalize your experience
                        </p>
                        <div className="mb-5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <CalendarDateRangeIcon className="w-4 h-4 text-primary-600"/> How old are you?
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={age}
                                    onChange={e => { setAge(e.target.value); setError(''); }}
                                    placeholder="Enter your age"
                                    min="10"
                                    max="120"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                    years
                                </span>
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <UserIcon className="w-4 h-4 text-primary-600"/> What's your gender?
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: 'male',emoji: '👨',label: 'Male' },
                                    { value: 'female',emoji: '👩',label: 'Female' },
                                ].map(g => (
                                    <button
                                        key={g.value}
                                        onClick={() => { setGender(g.value); setError(''); }}
                                        className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all
                                            ${gender === g.value
                                                ? 'border-primary-600 bg-primary-50'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }`}
                                    >
                                        <span className="text-2xl mb-1">{g.emoji}</span>
                                        <span className={`text-sm font-medium ${gender === g.value ? 'text-primary-700' : 'text-gray-700'}`}>
                                            {g.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {error && (
                            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                        )}

                        <button
                            onClick={handleContinue}
                            disabled={!age || !gender}
                            className="w-full py-4 bg-primary-600 text-white rounded-2xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Continue
                        </button>
                    </StepCard>
                </div>
            )}
            {step === 2 && (
                <div className="w-full max-w-sm mx-auto">
                    <div className="mb-6">
                        <button
                            onClick={goBack}
                            className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-4"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            <span className="text-sm">Back</span>
                        </button>
                        <ProgressBar step={2} total={4} />
                    </div>
                    <StepCard>
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-primary-600 rounded-2xl flex items-center justify-center">
                                <ScaleIcon className="w-9 h-9 text-white" />
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
                            Your Measurements
                        </h2>
                        <p className="text-primary-600 text-center text-sm mb-6">
                            Help us calculate your calorie needs
                        </p>
                        <div className="mb-4">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <ScaleIcon className="w-4 h-4 text-primary-600" />
                                Current Weight
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={e => { setWeight(e.target.value); setError(''); }}
                                    placeholder="Enter your weight"
                                    min="20"
                                    max="300"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <span className="text-primary-600">↕</span> Height
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={height}
                                    onChange={e => { setHeight(e.target.value); setError(''); }}
                                    placeholder="Enter your height"
                                    min="50"
                                    max="250"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
                            </div>
                        </div>
                        {bmi && bmiCategory && (
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl mb-4">
                                <div>
                                    <p className="text-xs text-gray-500">Your BMI</p>
                                    <p className={`text-2xl font-bold ${bmiCategory.color}`}>{bmi}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Body Mass Index</p>
                                    <p className={`text-sm font-semibold ${bmiCategory.color}`}>{bmiCategory.label}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-xl mb-6">
                            <span className="text-base">💡</span>
                            <p className="text-xs text-yellow-700">
                                Tip: Weigh yourself in the morning before eating for the most accurate results.
                            </p>
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                        )}

                        <button
                            onClick={handleContinue}
                            disabled={!weight || !height}
                            className="w-full py-4 bg-primary-600 text-white rounded-2xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Continue
                        </button>
                    </StepCard>
                </div>
            )}
            {step === 3 && (
                <div className="w-full max-w-sm mx-auto">
                    <div className="mb-6">
                        <button
                            onClick={goBack}
                            className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-4"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            <span className="text-sm">Back</span>
                        </button>
                        <ProgressBar step={3} total={4} />
                    </div>
                    <StepCard>
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-primary-600 rounded-2xl flex items-center justify-center">
                                <BoltIcon className="w-9 h-9 text-white" />
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
                            Activity Level
                        </h2>
                        <p className="text-primary-600 text-center text-sm mb-6">
                            How active are you on a typical day?
                        </p>
                        <div className="space-y-3 mb-6">
                            {[
                                { value: 'sedentary', label: 'Sedentary',desc: 'Little or no exercise' },
                                { value: 'light',label: 'Light',desc: 'Light exercise 1-3 days/week' },
                                { value: 'moderate',label: 'Moderate',desc: 'Moderate exercise 3-5 days/week' },
                                { value: 'active',label: 'Active',desc: 'Hard exercise 6-7 days/week' },
                            ].map(item => (
                                <button
                                    key={item.value}
                                    onClick={() => { setActivityLevel(item.value); setError(''); }}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all
                                        ${activityLevel === item.value
                                            ? 'border-primary-600 bg-primary-50'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                >
                                <div className="text-left">
                                        <p className={`font-semibold text-sm ${activityLevel === item.value ? 'text-primary-700' : 'text-gray-900'}`}>
                                            {item.label}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                    </div>
                                    {activityLevel === item.value && (
                                        <CheckIcon className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                        {error && (
                            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                        )}

                        <button
                            onClick={handleContinue}
                            disabled={!activityLevel}
                            className="w-full py-4 bg-primary-600 text-white rounded-2xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Continue
                        </button>
                    </StepCard>
                </div>
            )}
            {step === 4 && (
                <div className="w-full max-w-sm mx-auto">
                    <div className="mb-6">
                        <button
                            onClick={goBack}
                            className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-4"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            <span className="text-sm">Back</span>
                        </button>
                        <ProgressBar step={4} total={4} />
                    </div>
                    <StepCard>
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                                <TrophyIcon className="w-9 h-9 text-white" />
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
                            Your Goal
                        </h2>
                        <p className="text-primary-600 text-center text-sm mb-2">
                            What would you like to achieve?
                        </p>

                        <p className="text-sm font-semibold text-gray-700 mb-3">Choose your goal</p>
                        <div className="space-y-3 mb-4">
                            {[
                                {
                                    value: 'lose',
                                    label: 'Lose Weight',
                                    desc:  'Burn fat and slim down',
                                    iconBg: 'bg-gradient-to-br from-pink-500 to-red-500',
                                    Icon:   ArrowTrendingDownIcon,
                                },
                                {
                                    value: 'maintain',
                                    label: 'Maintain Weight',
                                    desc:  'Stay at current weight',
                                    iconBg: 'bg-gradient-to-br from-blue-400 to-primary-600',
                                    Icon:   ScaleIcon,
                                },
                                {
                                    value: 'gain',
                                    label: 'Gain Weight',
                                    desc:  'Build muscle mass',
                                    iconBg: 'bg-gradient-to-br from-green-400 to-green-600',
                                    Icon:   ArrowTrendingUpIcon,
                                },
                            ].map(item => (
                                <button
                                    key={item.value}
                                    onClick={() => {
                                        setGoalType(item.value);
                                        setError('');
                                        if (item.value === 'maintain') setTargetWeight('');
                                    }}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all
                                        ${goalType === item.value
                                            ? 'border-primary-600 bg-primary-50'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 ${item.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                            <item.Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className={`font-semibold text-sm ${goalType === item.value ? 'text-primary-700' : 'text-gray-900'}`}>
                                                {item.label}
                                            </p>
                                            <p className="text-xs text-gray-500">{item.desc}</p>
                                        </div>
                                    </div>
                                    {goalType === item.value && (
                                        <CheckIcon className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                        {goalType && goalType !== 'maintain' && (
                            <div className="mb-4">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                     Target Weight
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={targetWeight}
                                        onChange={e => { setTargetWeight(e.target.value); setError(''); }}
                                        placeholder="Enter your target weight"
                                        min="20"
                                        max="300"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {goalType === 'lose' ? 'Your desired weight after losing' : 'Your desired weight after gaining'}
                                </p>
                            </div>
                        )}
                        {goalType === 'maintain' && (
                            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
                                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <CheckIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-green-700">You're all set! </p>
                                    <p className="text-xs text-green-600 mt-0.5">
                                        We'll calculate your personalized calorie goals based on your profile.
                                    </p>
                                </div>
                            </div>
                        )}
                        {error && (
                            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                        )}
                        <button
                            onClick={handleComplete}
                            disabled={
                                isLoading ||
                                !goalType ||
                                (goalType !== 'maintain' && !targetWeight)
                            }
                            className="w-full py-4 bg-primary-600 text-white rounded-2xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Saving...' : 'Complete Setup'}
                        </button>
                    </StepCard>
                </div>
            )}
        </div>
    );
}