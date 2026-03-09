import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ChevronRightIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { BottomNavbar } from '../../components/layout/BottomNavbar';
import { getProfile, updateProfile } from '../../api/profileApi';
import { resolveCalorieGoal, calculateCalorieGoal } from '../../utils/calorieCalculator';

export function SettingsPage() {
    const navigate = useNavigate();

    const [profile, setProfile]                 = useState(null);
    const [calorieExpanded, setCalorieExpanded] = useState(false);
    const [weightExpanded, setWeightExpanded]   = useState(false);
    const [calorieMode, setCalorieMode]         = useState('auto');
    const [calorieManual, setCalorieManual]     = useState('');
    const [weightGoalInput, setWeightGoalInput] = useState('');
    const [savingCalorie, setSavingCalorie]     = useState(false);
    const [savingWeight, setSavingWeight]       = useState(false);
    const [calorieMsg, setCalorieMsg]           = useState(null);
    const [weightMsg, setWeightMsg]             = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getProfile();
                if (res && res.success) {
                    setProfile(res);
                    setCalorieMode(res.calorie_goal_mode || 'auto');
                    setCalorieManual(res.calorie_goal_manual || '');
                    setWeightGoalInput(res.weight_goal_kg || '');
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            }
        };
        fetchData();
    }, []);

    const displayCalorieGoal = profile ? resolveCalorieGoal(profile) : 2000;
    const displayWeightGoal  = profile?.weight_goal_kg ? `${profile.weight_goal_kg} kg` : 'Not set';
    const autoCalorieValue   = profile ? (calculateCalorieGoal(profile) || '—') : '—';

    const handleSaveCalorie = async () => {
        setSavingCalorie(true);
        setCalorieMsg(null);
        try {
            const payload = {
                calorie_goal_mode:   calorieMode,
                calorie_goal_manual: calorieMode === 'manual' && calorieManual
                    ? parseFloat(calorieManual)
                    : null,
            };
            await updateProfile(payload);
            setProfile(prev => ({ ...prev, ...payload }));
            setCalorieMsg({ type: 'success', text: 'Calorie goal saved!' });
        } catch (err) {
            setCalorieMsg({ type: 'error', text: 'Failed to save. Try again.' });
        } finally {
            setSavingCalorie(false);
        }
    };

    const handleSaveWeight = async () => {
        if (!weightGoalInput) {
            setWeightMsg({ type: 'error', text: 'Please enter a weight goal.' });
            return;
        }
        setSavingWeight(true);
        setWeightMsg(null);
        try {
            const payload = { weight_goal_kg: parseFloat(weightGoalInput) };
            await updateProfile(payload);
            setProfile(prev => ({ ...prev, ...payload }));
            setWeightMsg({ type: 'success', text: 'Weight goal saved!' });
        } catch (err) {
            setWeightMsg({ type: 'error', text: 'Failed to save. Try again.' });
        } finally {
            setSavingWeight(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A1F44] via-[#1E3A5F] to-gray-100 pb-20">
            <div className="p-6 max-w-2xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors mb-4"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                    <h1 className="text-3xl font-bold text-white">Settings</h1>
                </div>

                <div className="bg-white rounded-2xl shadow-lg mb-4 overflow-hidden">
                    <div className="px-5 py-4 pb-2">
                        <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
                    </div>
                    <button
                        onClick={() => navigate('/settings/personal-info')}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-100 transition-colors"
                    >
                        <span className="text-gray-900 font-medium">Personal Information</span>
                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                    </button>
                    <button
                        onClick={() => navigate('/settings/change-password')}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-100 transition-colors"
                    >
                        <span className="text-gray-900 font-medium">Change Password</span>
                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                    </button>
                    <button
                        onClick={() => navigate('/settings/2fa')}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-100 transition-colors"
                    >
                        <span className="text-gray-900 font-medium">2FA Settings</span>
                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <div className="bg-white rounded-2xl shadow-lg mb-4 overflow-hidden">
                    <div className="px-5 py-4 pb-2">
                        <h2 className="text-lg font-semibold text-gray-900">Goals</h2>
                    </div>
                    <div>
                        <button
                            onClick={() => { setCalorieExpanded(p => !p); setCalorieMsg(null); }}
                            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-100 transition-colors"
                        >
                            <div className="text-left">
                                <p className="text-gray-900 font-medium">Daily Calorie Goal</p>
                                <p className="text-sm text-gray-500 mt-0.5">{displayCalorieGoal} kcal</p>
                            </div>
                            {calorieExpanded
                                ? <ChevronDownIcon  className="w-5 h-5 text-gray-400" />
                                : <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                            }
                        </button>
                        {calorieExpanded && (
                            <div className="px-5 pb-5 space-y-3 bg-gray-50">
                                <button
                                    onClick={() => setCalorieMode('auto')}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all
                                        ${calorieMode === 'auto'
                                            ? 'border-primary-600 bg-primary-50'
                                            : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                >
                                    <div className="text-left">
                                        <p className={`font-medium ${calorieMode === 'auto' ? 'text-primary-700' : 'text-gray-900'}`}>
                                            Auto
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Calculated via TDEE formula ({autoCalorieValue} kcal)
                                        </p>
                                    </div>
                                    {calorieMode === 'auto' && <CheckIcon className="w-5 h-5 text-primary-600 flex-shrink-0" />}
                                </button>
                                <button
                                    onClick={() => setCalorieMode('manual')}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all
                                        ${calorieMode === 'manual'
                                            ? 'border-primary-600 bg-primary-50'
                                            : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                >
                                    <div className="text-left">
                                        <p className={`font-medium ${calorieMode === 'manual' ? 'text-primary-700' : 'text-gray-900'}`}>
                                            Manual
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">Set your own calorie goal</p>
                                    </div>
                                    {calorieMode === 'manual' && <CheckIcon className="w-5 h-5 text-primary-600 flex-shrink-0" />}
                                </button>

                                {calorieMode === 'manual' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Calories (kcal)
                                        </label>
                                        <input
                                            type="number"
                                            value={calorieManual}
                                            onChange={e => setCalorieManual(e.target.value)}
                                            placeholder="e.g. 2000"
                                            min="1200"
                                            max="6000"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                )}

                                {calorieMsg && (
                                    <p className={`text-sm ${calorieMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                        {calorieMsg.text}
                                    </p>
                                )}

                                <button
                                    onClick={handleSaveCalorie}
                                    disabled={savingCalorie}
                                    className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                                >
                                    {savingCalorie ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>
                    <div>
                        <button
                            onClick={() => { setWeightExpanded(p => !p); setWeightMsg(null); }}
                            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-100 transition-colors"
                        >
                            <div className="text-left">
                                <p className="text-gray-900 font-medium">Weight Goal</p>
                                <p className="text-sm text-gray-500 mt-0.5">{displayWeightGoal}</p>
                            </div>
                            {weightExpanded
                                ? <ChevronDownIcon  className="w-5 h-5 text-gray-400" />
                                : <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                            }
                        </button>

                        {weightExpanded && (
                            <div className="px-5 pb-5 space-y-3 bg-gray-50">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Target Weight (kg)
                                    </label>
                                    <input
                                        type="number"
                                        value={weightGoalInput}
                                        onChange={e => setWeightGoalInput(e.target.value)}
                                        placeholder="e.g. 75"
                                        min="30"
                                        max="300"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                {weightMsg && (
                                    <p className={`text-sm ${weightMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                        {weightMsg.text}
                                    </p>
                                )}

                                <button
                                    onClick={handleSaveWeight}
                                    disabled={savingWeight}
                                    className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                                >
                                    {savingWeight ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <BottomNavbar />
        </div>
    );
}