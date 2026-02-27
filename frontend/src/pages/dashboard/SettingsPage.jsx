import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { BottomNavbar } from '../../components/layout/BottomNavbar';

export function SettingsPage() {
  const navigate = useNavigate();
  const calorieGoal = 2000;
  const weightGoal = 75;
  const units = 'Metric';
  const language = 'Română';
  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleNavigate = (path) => {
    console.log('Navigate to:', path);
    alert(`Navigate to ${path} (page not implemented yet)`);
  };

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

          <h1 className="text-3xl font-bold text-white">
            Settings
          </h1>
        </div>
        <div className="bg-white rounded-2xl shadow-lg mb-4 overflow-hidden">
          <div className="px-5 py-4 pb-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Profile
            </h2>
          </div>
          <div>
            <button
              onClick={() => handleNavigate('/settings/personal-info')}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-100 transition-colors "
            >
              <span className="text-gray-900 font-medium">
                Personal Information
              </span>
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={() => handleNavigate('/settings/change-password')}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-900 font-medium">
                Change Password
              </span>
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg mb-4 overflow-hidden">
          <div className="px-5 py-4 pb-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Goals
            </h2>
          </div>
          <div>
            <button
              onClick={() => handleNavigate('/settings/calorie-goal')}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-100 transition-colors "
            >
              <div className="text-left">
                <p className="text-gray-900 font-medium">
                  Daily Calorie Goal
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {calorieGoal} kcal
                </p>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={() => handleNavigate('/settings/weight-goal')}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-100 transition-colors"
            >
              <div className="text-left">
                <p className="text-gray-900 font-medium">
                  Weight Goal
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {weightGoal} kg
                </p>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg mb-4 overflow-hidden">
          <div className="px-5 py-4 pb-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Preferences
            </h2>
          </div>
          <div>
            <button
              onClick={() => handleNavigate('/settings/units')}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-100 transition-colors "
            >
              <span className="text-gray-900 font-medium">
                Units
              </span>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">
                  {units}
                </span>
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              </div>
            </button>
            <button
              onClick={() => handleNavigate('/settings/language')}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-900 font-medium">
                Language
              </span>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">
                  {language}
                </span>
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          </div>
        </div>
      </div>
      <BottomNavbar />
    </div>
  );
}