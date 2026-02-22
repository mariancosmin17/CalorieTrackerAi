export function ProgressBar({
    label='Nutrient',
    current=0,
    goal=100,
    color='#2196F3',
    unit='g'
    }){
        const percentage=goal>0 ? Math.min((current/goal)*100,100) : 0;
        return(
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{backgroundColor:color}}
                        />
                        <span className="font-medium text-gray-900">
                            {label}
                        </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                        {current} {unit}
                    </span>
                </div>
                <div className="relative">
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{
                                width:`${percentage}%`,
                                backgroundColor:color,
                                }}
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Goal: {goal}{unit}</span>
                </div>
            </div>
            );
        }