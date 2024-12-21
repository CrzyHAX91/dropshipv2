import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    const typeClasses = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    const handleClose = useCallback(() => {
        setIsVisible(false);
        setTimeout(() => {
            onClose?.();
        }, 200);
    }, [onClose]);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, handleClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`
                        fixed top-4 right-4 z-50
                        flex items-center
                        min-w-[300px] max-w-md
                        p-4 rounded-lg shadow-lg
                        text-white
                        ${typeClasses[type]}
                    `}
                >
                    <span className="mr-2 text-xl">{icons[type]}</span>
                    <p className="flex-1">{message}</p>
                    <button
                        onClick={handleClose}
                        className="ml-4 text-white hover:text-gray-200 focus:outline-none"
                    >
                        ✕
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

Toast.propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
    duration: PropTypes.number,
    onClose: PropTypes.func
};

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-4">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

ToastContainer.propTypes = {
    toasts: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            message: PropTypes.string.isRequired,
            type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
            duration: PropTypes.number
        })
    ).isRequired,
    removeToast: PropTypes.func.isRequired
};

// Toast Context and Hook
export const ToastContext = React.createContext({
    showToast: () => {},
    removeToast: () => {}
});

export const useToast = () => {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback(({ message, type = 'info', duration = 3000 }) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((currentToasts) => [...currentToasts, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

ToastProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export default Toast;
