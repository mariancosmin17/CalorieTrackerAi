export function ProgressRing({
    current=0,
    total=100,
    color='#00ACC1',
    size=200,
    strokeWidth=12,
    showPercentage=false
    })
{
    const percentage=total>0 ? Math.min((current/total)*100,100) : 0;
    const radius=(size-strokeWidth)/2;
    const offset=circumference-(percentage/100)*circumference;
    return(
        <div className="relative inline-flex items-center justify-center">
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                <circle
                    cx={size/2}
                    cy={size/2}
                    r={radius}
                    stroke="#E5E7EB"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <circle
                    cx={size/2}
                    cy={size/2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{
                        transition:'stroke-dashoffset 0.5s ease-in-out',
                        }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900">
                    {current}
                </span>
                <span className="text-sm text-gray-500 mt-1">
                    of {total}
                </span>
                <span className="text-xs text-gray-400">
                    calories
                </span>
                {showPercentage && (
                    <span className="text-sm text-gray-600 mt-2">
                        {Math.round(percentage)}%
                    </span>
                    )}
            </div>
        </div>
        );
    }