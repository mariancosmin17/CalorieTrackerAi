import {useLocation,useNavigate} from 'react-router-dom';
import {useState} from 'react';
import {
  HomeIcon,
  BookOpenIcon,
  PlusCircleIcon,
  Cog6ToothIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import {Sidebar} from './Sidebar';
export function BottomNavbar(){
    const location=useLocation();
    const navigate=useNavigate();
    const [isSidebarOpen,setIsSidebarOpen]=useState(false);
    const navItems=[
        {
            id:'dashboard',
            label:'Dashboard',
            icon:HomeIcon,
            path:'/dashboard'
            },
        {
            id:'diary',
            label:'Diary',
            icon:BookOpenIcon,
            path:'/diary',
            },
        {
            id:'logfood',
            label:'Log Food',
            icon:PlusCircleIcon,
            path:'/log-food',
            isCenter:true,
            },
        {
            id:'settings',
            label:'Settings',
            icon:Cog6ToothIcon,
            path:'/settings',
            },
        {
            id:'more',
            label:'More',
            icon:Bars3Icon,
            onClick:'openSidebar',
            },
        ];
    const handleNavClick=(item)=>{
        if(item.onClick==='openSidebar')
        {
            setIsSidebarOpen(prev=>!prev);
            return;
            }
        if(item.path){
            navigate(item.path);
            }
        };

    const isActive=(item)=>{
        if(!item.path) return false;
        return location.pathname===item.path
        };

    return(
      <>
        <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
        />
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="flex items-center justify-around h-16">
                    {navItems.map((item=>{
                        const Icon=item.icon;
                        const active=isActive(item);
                        if(item.isCenter){
                            return(
                                <button
                                    key={item.id}
                                    onClick={()=>handleNavClick(item)}
                                    className="flex flex-col items-center justify-center -mt-6 relative"
                                    aria-label={item.label}
                                >
                                    <div
                                        className={`
                                            w-14 h-14 rounded-full
                                            flex items-center justify-center
                                            shadow-lg
                                            transition-all duration-200
                                            ${
                                                active
                                                    ? 'bg-primary-600 scale-110'
                                                    : 'bg-primary-600 hover:scale-105'
                                            }
                                        `}
                                    >
                                        <Icon className="w-7 h-7 text-white"/>
                                    </div>
                                    <span
                                        className={`
                                            text-xs mt-1
                                            transition-colors duration-200
                                            ${active ? 'text-primary-600 font-medium' : 'text-gray-600'}
                                            `}
                                    >
                                        {item.label}
                                    </span>
                                </button>
                                );
                            }

                            return(
                                <button
                                    key={item.id}
                                    onClick={()=>handleNavClick(item)}
                                    className="flex flex-col items-center justify-center py-2 px-3 min-w-[64px]"
                                    aria-label={item.label}
                                >
                                    <Icon
                                        className={`
                                            w-6 h-6 mb-1
                                            transition-colors duration-200
                                            ${active ? 'text-primary-600' : 'text-gray-600'}
                                            `}
                                    />
                                    <span
                                        className={`
                                            text-xs
                                            transition-colors duration-200
                                            ${active ? 'text-primary-600 font-medium' : 'text-gray-600'}
                                            `}
                                    >
                                        {item.label}
                                    </span>
                                </button>
                                );
                        }))}
                </div>
            </div>
        </nav>
      </>
        );
    }