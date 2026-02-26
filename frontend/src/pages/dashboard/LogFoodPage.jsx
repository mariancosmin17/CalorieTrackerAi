import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PhotoIcon,
  CameraIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { BottomNavbar } from '../../components/layout/BottomNavbar';
import { analyzeFoodImage } from '../../api/foodApi';
import { DetectedFoodsModal } from '../../components/features/logfood/DetectedFoodsModal';

export function LogFoodPage(){
    const navigate=useNavigate();
    const fileInputRef=useRef(null);

    const [selectedImage,setSelectedImage]=useState(null);
    const [imagePreview,setImagePreview]=useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const [detectedFoods, setDetectedFoods] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setDetectedFoods([]);
        handleRemoveImage();
    };

    return(
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
            </div>

            <DetectedFoodsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                foods={detectedFoods}
                setFoods={setDetectedFoods}
            />

            <BottomNavbar/>
        </div>
    );
}