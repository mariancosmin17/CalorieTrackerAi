export function Input({
    label,
    type='text',
    placeholder,
    error,
    icon,
    ...props}){
        return(
            <div className="mb-4">
                {label &&
                    (<label className="block text-gray-700 text-sm font-medium mb-2">
                        {label}
                        </label>
                    )}
                <div className="relative">
                    {icon &&(
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                        </div>
                        )}
                    <input
                    type={type}
                    placeholder={placeholder}
                    className={`
                        w-full
                        px-4
                        py-3
                        ${icon ? 'pl-10' : ''}
                        border
                        ${error ? 'border-red-500': 'border-gray-300'}
                        rounded-lg
                        focus:ring-2
                        focus:ring-primary-500
                        focus:border-transparent
                        transition-all
                        duration-200
                        outline-none
                        ${error ? 'bg-red-50':'bg-white'}
                        `}
                        {...props}
                        />
                        </div>
                        {error && (
                            <p className="text-red-600 text-sm mt-1">
                                {error}
                                </p>
                            )}
                        </div>
            );
        }