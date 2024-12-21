import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ size = 'md', color = 'primary', fullScreen = false }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    const colorClasses = {
        primary: 'text-blue-500',
        secondary: 'text-purple-500',
        success: 'text-green-500',
        warning: 'text-yellow-500',
        error: 'text-red-500'
    };

    const spinnerClasses = `
        inline-block animate-spin rounded-full 
        border-4 border-solid border-current 
        border-r-transparent align-[-0.125em] 
        motion-reduce:animate-[spin_1.5s_linear_infinite]
        ${sizeClasses[size]} 
        ${colorClasses[color]}
    `;

    const spinner = (
        <div 
            role="status" 
            className="inline-flex items-center justify-center"
        >
            <div className={spinnerClasses}>
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                    Loading...
                </span>
            </div>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    {spinner}
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return spinner;
};

LoadingSpinner.propTypes = {
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
    color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error']),
    fullScreen: PropTypes.bool
};

export default LoadingSpinner;
