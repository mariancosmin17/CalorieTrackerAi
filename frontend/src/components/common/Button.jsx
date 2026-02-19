export function Button({
    children,
    variant='primary',
    loading=false,
    fullWidth=false,
    disabled=false,
    ...props
    }){
        const variants={
            primary:`
            bg-primary-600
            hover:bg-primary-700
            text-white
            shadow-md
            hover:shadow-lg
            `,
            secondary:`
            bg-gray-200
            hover:bg-gray-300
            text-gray-900
            `,
            outline:`
            bg-transparent
            border-2
            border-primary-600
            text-primary-600
            hover:bg-primary-50
            `
            };
        return(
            <button
            className={`
                ${variants[variant]}
                ${fullWidth ? 'w-full': ''}
                font-medium
                py-3
                px-6
                rounded-lg
                transition-all
                duration-200
                disabled:opacity-50
                disabled:cursor-not-allowed
                flex
                items-center
                justify-center
                gap-2
                `}
                disabled={disabled||loading}
                {...props}
                >
                {loading && (
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  {children}
                 </button>
            );
        }