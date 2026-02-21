import {useLocation,useNavigate} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';
import {
  XMarkIcon,
  UserIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  InformationCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

export function Sidebar({isOpen,onClose}){
    const navigate=useNavigate();
    const {logout}=useAuth();
    const menuItems=[
        {
            id:'profile',
            label:'Profile',
            icon:UserIcon,
            onClick:()=>{
                navigate('/settings');
                onClose();
                },
            },
        {
            id:'notifications',
            label:'Notifications',
            icon:BellIcon,
            onClick:()=>{
                console.log('urmeaza');
                onClose();
                },
            },
        {
            id:'help',
            label:'Help & Support',
            icon:QuestionMarkCircleIcon,
            onClick:()=>{
                console.log('urmeaza');
                onClose();
                },
            },
        {
            id:'about',
            label:'About',
            icon:InformationCircleIcon,
            onClick:()=>{
                console.log('urmeaza');
                onClose();
                },
            },
        ];

    const handleLogout= async()=>{
        onClose();
        await logout();
        };
    const handleOverlayClick=(e)=>{
        if(e.target===e.currentTarget)
        {
            onClose();
            }
        };
    if (!isOpen) return null;

    return(
        <>
            <div className={`
                fixed inset-0 bg-black bg-opacity-50 z-40
                transition-opacity duration-300
                ${isOpen? 'opacity-100':'opacity-0'}
                `}
                onClick={handleOverlayClick}
                aria-hidden="true"
            />
            <div
                className={`
                    fixed top-0 right-0 h-full w-64 bg-white z-50
                    shadow-2xl
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                    `}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-[#1E3A5F]">Menu</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Close menu"
                    >
                        <XMarkIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
                <nav className="p-4">
                    <ul className="space-y-2">
                        {menuItems.map((item)=>{
                            const Icon=item.icon;
                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={item.onClick}
                                        className="
                                            w-full flex items-center gap-3 px-4 py-3
                                            rounded-lg
                                            hover:bg-gray-100
                                            transition-colors duration-200
                                            text-left
                                        "
                                    >
                                        <Icon className="w-5 h-5 text-gray-600" />
                                        <span className="text-gray-700 font-medium">
                                            {item.label}
                                        </span>
                                    </button>
                                </li>
                                );
                            })}
                        </ul>
                        <div className="my-4 border-t border-gray-200" />
                        <button
                            onClick={handleLogout}
                            className="
                                w-full flex items-center gap-3 px-4 py-3
                                rounded-lg
                                hover:bg-red-50
                                transition-colors duration-200
                                text-left
                            "
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-600" />
                            <span className="text-red-600 font-medium">Logout</span>
                        </button>
                    </nav>
                </div>
        </>
        );
    }