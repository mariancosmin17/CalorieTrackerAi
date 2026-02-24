import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export function DatePicker({selectedDate,onDateSelect,onClose}){
    const [currentMonth,setCurrentMonth]=useState(new Date());
    const today=new Date();
    today.setHours(0,0,0,0);
    const minDate=new Date(today);
    minDate.setDate(minDate.getDate()-30);
    const getDaysInMonth=(date)=>{
        const year=date.getFullYear();
        const month=date.getMonth();
        const firstDay=new Date(year,month,1);
        const lastDay=new Date(year,month+1,0);
        const days=[];
        const startDayOfWeek=firstDay.getDay();
        for (let i =0;i < startDayOfWeek; i++){
            days.push(null);
            }
        for(let day=1;day<=lastDay.getDate();day++){
            days.push(new Date(year,month,day));
            }
        return days;
        }
    const days=getDaysInMonth(currentMonth);
    const isDateDisabled=(date)=>
    {
        if(!date) return true;
        return date<minDate||date>today;
        }
    const isDateSelected=(date)=>{
        if(!date) return true;
        return date.toDateString()===selectedDate.toDateString();
        };
    const isToday=(date)=>
    {
        if(!date) return false;
        return date.toDateString()===today.toDateString();
        };

    const handlePrevMonth=()=>{
        setCurrentMonth(new Date(currentMonth.getFullYear(),currentMonth.getMonth()-1))
        };

    const handleNextMonth=()=>{
        setCurrentMonth(new Date(currentMonth.getFullYear(),currentMonth.getMonth()+1))
        };

    const handleDateClick=(date)=>{
        if(!isDateDisabled(date)){
            onDateSelect(date);
            onClose();
            }
        };
    const monthName =currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl p-4 z-50 border border-gray-200">
           <div className="flex items-center justify-between mb-4">
               <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
               >
                <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
               </button>
               <h3 className="font-semibold text-gray-900">
                {monthName}
               </h3>
               <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
               >
                <ChevronRightIcon className="w-5 h-5 text-gray-600" />
               </button>
           </div>

           <div className="grid grid-cols-7 gap-1 mb-2">
               {weekDays.map((day,i)=>(
                   <div key={i} className="text-center text-xs font-medium text-gray-500 py-1">
                       {day}
                   </div>
                   ))}
           </div>
           <div className="grid grid-cols-7 gap-1">
               {days.map((date,i)=>(
                   <button
                    key={i}
                    onClick={() => handleDateClick(date)}
                    disabled={isDateDisabled(date)}
                    className={`
                        py-2 text-sm rounded-lg transition-colors
                        ${!date ? 'invisible' : ''}
                        ${isDateDisabled(date) ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-50'}
                        ${isDateSelected(date) ? 'bg-primary-600 text-white hover:bg-primary-700' : ''}
                        ${isToday(date) && !isDateSelected(date) ? 'bg-blue-50 text-primary-600 font-bold' : ''}
                        ${!isDateDisabled(date) && !isDateSelected(date) && !isToday(date) ? 'text-gray-700' : ''}
                        `}
                    >
                        {date? date.getDate(): ''}
                    </button>
                   ))}
           </div>
           <p className="text-xs text-gray-500 text-center mt-3">
                Last 30 days available
           </p>
        </div>
        );
    }