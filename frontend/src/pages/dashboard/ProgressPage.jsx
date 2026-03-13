import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeftIcon,
    ScaleIcon,
    TrophyIcon,
    BoltIcon,
    CalendarDaysIcon,
    FireIcon,
    ArrowTrendingDownIcon,
    ArrowTrendingUpIcon,
    PlusCircleIcon,
    XMarkIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';
import { BottomNavbar } from '../../components/layout/BottomNavbar';
import { getProgress, logWeight } from '../../api/progressApi';

function CircularProgress({ percentage }) {
    const radius=75;
    const stroke=10;
    const normalised = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalised;
    const offset= circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-44 h-44">
            <svg width="176" height="176" className="-rotate-90">

                <circle
                    cx="88" cy="88"
                    r={normalised}
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth={stroke}
                />

                <circle
                    cx="88" cy="88"
                    r={normalised}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-700"
                />
            </svg>

            <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold text-gray-900">
                    {percentage}%
                </span>
                <span className="text-xs text-gray-500">Complete</span>
            </div>
        </div>
    );
}

function LogWeightModal({ onClose, onSave }) {
    const [value, setValue]= useState('');
    const [error, setError]= useState('');
    const [loading, setLoading]= useState(false);

    const handleSave = async () => {
        const num = parseFloat(value);
        if (!value || isNaN(num) || num < 20 || num > 300) {
            setError('Please enter a valid weight (20-300 kg).');
            return;
        }
        setLoading(true);
        try {
            await onSave(num);
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to log weight.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50"
                onClick={onClose}
            />

            <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Log Weight</h3>
                    <button onClick={onClose}>
                        <XMarkIcon className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                    Enter your current weight to track your progress.
                </p>
                <div className="relative mb-4">
                    <input
                        type="number"
                        value={value}
                        onChange={e => { setValue(e.target.value); setError(''); }}
                        placeholder="e.g. 80.5"
                        min="20"
                        max="300"
                        step="0.1"
                        autoFocus
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 text-lg"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                        kg
                    </span>
                </div>
                {error && (
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                )}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || !value}
                        className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </>
    );
}

export function ProgressPage() {
    const navigate = useNavigate();

    const [data,setData]= useState(null);
    const [isLoading, setIsLoading]= useState(true);
    const [showModal, setShowModal]= useState(false);
    const [activeChart, setActiveChart]= useState('weight');
    const [logSuccess, setLogSuccess]= useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await getProgress();
            setData(res);
        } catch (err) {
            console.error('Failed to fetch progress:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleLogWeight = async (weight) => {
        await logWeight(weight);
        setLogSuccess(true);
        await fetchData();
        setTimeout(() => setLogSuccess(false), 3000);
    };

    const getChangedLabel = (goalType) => {
        if (goalType === 'lose') return 'Lost So Far';
        if (goalType === 'gain') return 'Gained So Far';
        return 'On Track';
    };

    const getRemainingLabel = (goalType) => {
        if (goalType === 'lose') return 'To Lose';
        if (goalType === 'gain') return 'To Gain';
        return 'Maintaining';
    };

    const getMotivationalText = (data) => {
        if (data.goal_type === 'maintain') {
            return `You've been tracking for ${data.days_tracking} days. Keep maintaining your weight!`;
        }
        if (data.goal_type === 'lose') {
            return `You've lost ${data.changed_so_far} kg out of ${
                Math.round(data.start_weight - data.goal_weight)
            } kg. That's ${data.progress_pct}% of your goal! Keep it up!`;
        }
        if (data.goal_type === 'gain') {
            return `You've gained ${data.changed_so_far} kg out of ${
                Math.round(data.goal_weight - data.start_weight)
            } kg. That's ${data.progress_pct}% of your goal! Keep it up!`;
        }
    };

    const getSubtitle = (goalType) => {
        if (goalType === 'lose')return 'Track your weight loss journey';
        if (goalType === 'gain')return 'Track your muscle gain journey';
        return 'Track your maintenance journey';
    };

    if (isLoading) return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A1F44] via-[#1E3A5F] to-gray-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A1F44] via-[#1E3A5F] to-gray-100 pb-24">
            <div className="p-6 max-w-2xl mx-auto">

                <div className="mb-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span className="text-sm">Back</span>
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Your Progress</h1>
                            <p className="text-blue-200 text-sm mt-1">
                                {data && getSubtitle(data.goal_type)}
                            </p>
                        </div>

                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 text-white rounded-xl hover:bg-opacity-30 transition-all"
                        >
                            <PlusCircleIcon className="w-5 h-5" />
                            <span className="text-sm font-medium">Log Weight</span>
                        </button>
                    </div>
                </div>

                {logSuccess && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="text-green-700 text-sm font-medium">Weight logged successfully!</p>
                    </div>
                )}

                {data && (
                    <div className="space-y-4">

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <ScaleIcon className="w-5 h-5 text-primary-600" />
                                <h2 className="text-base font-bold text-gray-900">Weight Progress</h2>
                            </div>

                            <div className="flex items-center justify-around mb-6">
                                {[
                                    { label: 'Start',value:`${data.start_weight} kg`,icon: ArrowTrendingDownIcon, color:'bg-gray-100',iconColor: 'text-gray-500' },
                                    { label: 'Current',value:`${data.current_weight} kg`,icon: ScaleIcon,color: 'bg-primary-100',  iconColor: 'text-primary-600' },
                                    { label: 'Goal',value: data.goal_weight ? `${data.goal_weight} kg` : '—', icon: TrophyIcon, color: 'bg-yellow-100', iconColor: 'text-yellow-600' },
                                ].map(item => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.label} className="flex flex-col items-center gap-2">
                                            <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center`}>
                                                <Icon className={`w-5 h-5 ${item.iconColor}`} />
                                            </div>
                                            <p className="text-xs text-gray-500">{item.label}</p>
                                            <p className="text-base font-bold text-gray-900">{item.value}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            {data.goal_type !== 'maintain' && (
                                <>
                                    <div className="flex justify-center mb-5">
                                        <CircularProgress percentage={data.progress_pct} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-blue-50 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <ArrowTrendingDownIcon className="w-4 h-4 text-primary-600" />
                                                <p className="text-xs text-gray-500">{getChangedLabel(data.goal_type)}</p>
                                            </div>
                                            <p className="text-xl font-bold text-primary-600">
                                                {data.changed_so_far} kg
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <TrophyIcon className="w-4 h-4 text-gray-500" />
                                                <p className="text-xs text-gray-500">{getRemainingLabel(data.goal_type)}</p>
                                            </div>
                                            <p className="text-xl font-bold text-gray-700">
                                                {data.remaining} kg
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {data.goal_type === 'maintain' && (
                                <div className="flex items-center justify-center p-4 bg-green-50 rounded-xl">
                                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                                    <p className="text-sm font-medium text-green-700">
                                        Maintaining at {data.current_weight} kg
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
                                <button
                                    onClick={() => setActiveChart('weight')}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all
                                        ${activeChart === 'weight'
                                            ? 'bg-white text-primary-600 shadow-sm'
                                            : 'text-gray-500'
                                        }`}
                                >
                                    Weight Trend
                                </button>
                                <button
                                    onClick={() => setActiveChart('calories')}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all
                                        ${activeChart === 'calories'
                                            ? 'bg-white text-primary-600 shadow-sm'
                                            : 'text-gray-500'
                                        }`}
                                >
                                    Calories This Week
                                </button>
                            </div>

                            {activeChart === 'weight' && (
                                <>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <AreaChart data={data.weight_trend}>
                                            <defs>
                                                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%"  stopColor="#0284c7" stopOpacity={0.15} />
                                                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                            <YAxis
                                                domain={['auto', 'auto']}
                                                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                                axisLine={false}
                                                tickLine={false}
                                                width={35}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                                formatter={(val) => [`${val} kg`, 'Weight']}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="weight"
                                                stroke="#0284c7"
                                                strokeWidth={2.5}
                                                fill="url(#weightGrad)"
                                                dot={{ fill: '#0284c7', r: 4 }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                    <p className="text-xs text-gray-500 text-center mt-3">
                                        {data.weight_trend.length > 1
                                            ? `${data.weight_trend.length} weigh-ins logged`
                                            : 'Log your weight regularly to see the trend'
                                        }
                                    </p>
                                </>
                            )}

                            {activeChart === 'calories' && (
                                <>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={data.calories_week}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                            <YAxis
                                                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                                axisLine={false}
                                                tickLine={false}
                                                width={40}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                                formatter={(val) => [`${val} kcal`, 'Calories']}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey={() => data.calorie_goal}
                                                stroke="#10B981"
                                                strokeWidth={1.5}
                                                strokeDasharray="5 5"
                                                dot={false}
                                                name="Goal"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="calories"
                                                stroke="#0284c7"
                                                strokeWidth={2.5}
                                                dot={{ fill: '#0284c7', r: 4 }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                    <p className="text-xs text-center mt-3">
                                        <span className="text-primary-600 font-semibold">Avg: {data.avg_calories} kcal</span>
                                        <span className="text-gray-400 mx-2">•</span>
                                        <span className="text-green-600 font-semibold">Goal: {data.calorie_goal} kcal</span>
                                    </p>
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                {
                                    label:'Days Tracking',
                                    value:data.days_tracking,
                                    sub:'Since start',
                                    icon:CalendarDaysIcon,
                                    iconBg:'bg-purple-500',
                                },
                                {
                                    label:'Streak',
                                    value:data.streak,
                                    sub:'Days in a row',
                                    icon:FireIcon,
                                    iconBg:'bg-orange-500',
                                },
                                {
                                    label:'Avg Calories',
                                    value:data.avg_calories,
                                    sub:'Daily average',
                                    icon:BoltIcon,
                                    iconBg:'bg-primary-600',
                                },
                                {
                                    label:data.goal_type === 'lose' ? 'Weekly Loss' : data.goal_type === 'gain' ? 'Weekly Gain' : 'Weekly Avg',
                                    value:`${Math.abs(data.weekly_change)}`,
                                    sub:'kg per week',
                                    icon:data.goal_type === 'gain' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon,
                                    iconBg:data.goal_type === 'gain' ? 'bg-green-500' : 'bg-primary-600',
                                },
                            ].map(item => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.label} className="bg-white rounded-2xl shadow-lg p-4">
                                        <div className={`w-10 h-10 ${item.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                                        <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="bg-gradient-to-br from-primary-600 to-blue-700 rounded-2xl shadow-lg p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <TrophyIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-bold text-base mb-1">
                                        {data.goal_type === 'maintain' ? 'Keep it up!' : 'Great Progress!'}
                                    </p>
                                    <p className="text-blue-100 text-sm leading-relaxed">
                                        {getMotivationalText(data)}
                                    </p>
                                    {data.goal_type !== 'maintain' && data.remaining > 0 && (
                                        <div className="mt-3 inline-block px-3 py-1.5 bg-white bg-opacity-20 rounded-lg">
                                            <p className="text-white text-xs font-semibold">
                                                Only {data.remaining} kg to go!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {showModal && (
                <LogWeightModal
                    onClose={() => setShowModal(false)}
                    onSave={handleLogWeight}
                />
            )}

            <BottomNavbar />
        </div>
    );
}