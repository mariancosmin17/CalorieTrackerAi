import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { BottomNavbar } from '../../components/layout/BottomNavbar';
import { getProfile, updateProfile } from '../../api/profileApi';

const ACTIVITY_LEVELS = [
    { value: 'sedentary',label:'Sedentary',desc: 'Little or no exercise' },
    { value: 'light',label:'Light',desc: '1-3 days/week' },
    { value: 'moderate',label: 'Moderate',desc: '3-5 days/week' },
    { value: 'active',label:'Active',desc: '6-7 days/week' },
];

 export function PersonalInfoPage(){
    const navigate=useNavigate();
    const [form, setForm] = useState({
        full_name:'',
        username:'',
        email:'',
        age:'',
        gender:'',
        height_cm:'',
        weight_kg:'',
        activity_level:'',
    });
    const [isLoading, setIsLoading]= useState(false);
    const [isSaving, setIsSaving]= useState(false);
    const [error, setError]= useState(null);
    const [successMsg, setSuccessMsg]= useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const response = await getProfile();
                if (response && response.success) {
                    setForm({
                        full_name:response.full_name || '',
                        username:response.username || '',
                        email:response.email || '',
                        age:response.age|| '',
                        gender:response.gender|| '',
                        height_cm:response.height_cm|| '',
                        weight_kg: response.weight_kg || '',
                        activity_level: response.activity_level || '',
                    });
                }
            } catch (err) {
                setError('Could not load profile. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setError(null);
        setSuccessMsg(null);
    };

    const isValidEmail =(email)=> {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setSuccessMsg(null);

        if (form.email&&!isValidEmail(form.email)) {
        setError('Invalid email format.');
        setIsSaving(false);
        window.scrollTo({top:0,behavior:'smooth' });
        return;
        }

        try {
            const payload = {
                full_name:form.full_name|| null,
                username:form.username || null,
                email:form.email|| null,
                age:form.age ? parseInt(form.age):null,
                gender:form.gender|| null,
                height_cm:form.height_cm ? parseFloat(form.height_cm):null,
                weight_kg:form.weight_kg ? parseFloat(form.weight_kg) :null,
                activity_level: form.activity_level || null,
            };
            const response = await updateProfile(payload);
            if (response && response.success) {
                setSuccessMsg('Profile updated successfully!');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update profile.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A1F44] via-[#1E3A5F] to-gray-100 pb-20">
            <div className="p-6 max-w-2xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/settings')}
                        className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors mb-4"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                    <h1 className="text-3xl font-bold text-white">Personal Information</h1>
                    {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}
                        {successMsg && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <p className="text-green-600 text-sm">{successMsg}</p>
                            </div>
                        )}
                </div>
                {isLoading && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 animate-pulse">
                        {[1,2,3,4,5].map(i => (
                            <div key={i}>
                                <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
                                <div className="h-11 bg-gray-100 rounded-lg" />
                            </div>
                        ))}
                    </div>
                )}
                {!isLoading && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-base font-semibold text-gray-700 mb-4">
                                Account
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={form.full_name}
                                        onChange={e => handleChange('full_name', e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={form.username}
                                        onChange={e => handleChange('username', e.target.value)}
                                        placeholder="username"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => handleChange('email', e.target.value)}
                                        placeholder="email@example.com"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-base font-semibold text-gray-700 mb-4">
                                Physical Details
                            </h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Age
                                        </label>
                                        <input
                                            type="number"
                                            value={form.age}
                                            onChange={e => handleChange('age', e.target.value)}
                                            placeholder="25"
                                            min="1"
                                            max="120"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Gender
                                        </label>
                                        <div className="grid grid-cols-2 gap-2 mt-1">
                                            {['male', 'female'].map(g => (
                                                <button
                                                    key={g}
                                                    onClick={() => handleChange('gender', g)}
                                                    className={`py-3 rounded-lg text-sm font-medium capitalize transition-colors
                                                        ${form.gender === g
                                                            ? 'bg-primary-600 text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Height (cm)
                                        </label>
                                        <input
                                            type="number"
                                            value={form.height_cm}
                                            onChange={e => handleChange('height_cm', e.target.value)}
                                            placeholder="175"
                                            min="50"
                                            max="250"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Weight (kg)
                                        </label>
                                        <input
                                            type="number"
                                            value={form.weight_kg}
                                            onChange={e => handleChange('weight_kg', e.target.value)}
                                            placeholder="70"
                                            min="20"
                                            max="300"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-base font-semibold text-gray-700 mb-4">
                                Activity Level
                            </h2>
                            <div className="space-y-2">
                                {ACTIVITY_LEVELS.map(level => (
                                    <button
                                        key={level.value}
                                        onClick={() => handleChange('activity_level', level.value)}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all
                                            ${form.activity_level === level.value
                                                ? 'border-primary-600 bg-primary-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="text-left">
                                            <p className={`font-medium ${form.activity_level === level.value ? 'text-primary-700' : 'text-gray-900'}`}>
                                                {level.label}
                                            </p>
                                            <p className="text-sm text-gray-500">{level.desc}</p>
                                        </div>
                                        {form.activity_level === level.value && (
                                            <CheckIcon className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}
                        {successMsg && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <p className="text-green-600 text-sm">{successMsg}</p>
                            </div>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full py-4 bg-primary-600 text-white rounded-2xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>

                    </div>
                )}

            </div>
            <BottomNavbar />
        </div>
        );
    }