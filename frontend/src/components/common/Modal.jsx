import { XMarkIcon } from '@heroicons/react/24/outline';
export function Modal({isOpen,onClose,title,children}){
const handleOverlayClick=(e)=>{
    if(e.target===e.currentTarget){
        onClose();
        }
    };
    if(!isOpen) return null;
    return(
        <>
            <div
                className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
                onClick={handleOverlayClick}
            >
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all"
                    onClick={(e)=>e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                       <h2 className="text-xl font-bold text-gray-900">
                           {title}
                       </h2>
                       <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            aria-label="Close modal"
                       >
                            <XMarkIcon className="w-6 h-6 text-gray-600" />
                       </button>
                    </div>
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
         </>
    );
}