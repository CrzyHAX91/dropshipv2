import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showClose = true,
    closeOnOverlayClick = true,
    footer,
    className = ''
}) => {
    const sizeClasses = {
        xs: 'max-w-xs',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        full: 'max-w-full mx-4'
    };

    const handleEscape = useCallback((event) => {
        if (event.key === 'Escape' && isOpen) {
            onClose();
        }
    }, [isOpen, onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [handleEscape]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                        onClick={closeOnOverlayClick ? onClose : undefined}
                        aria-hidden="true"
                    />

                    {/* Modal */}
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 30
                            }}
                            className={`
                                relative bg-white dark:bg-gray-800 
                                rounded-lg shadow-xl overflow-hidden 
                                w-full ${sizeClasses[size]} ${className}
                            `}
                            onClick={(e) => e.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="modal-title"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h3 
                                        id="modal-title"
                                        className="text-lg font-semibold text-gray-900 dark:text-white"
                                    >
                                        {title}
                                    </h3>
                                    {showClose && (
                                        <button
                                            onClick={onClose}
                                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                     rounded-full p-1 transition-colors duration-200"
                                            aria-label="Close modal"
                                        >
                                            <svg
                                                className="h-6 w-6"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                                {children}
                            </div>

                            {/* Footer */}
                            {footer && (
                                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                    {footer}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', 'full']),
    showClose: PropTypes.bool,
    closeOnOverlayClick: PropTypes.bool,
    footer: PropTypes.node,
    className: PropTypes.string
};

// Example usage:
// const YourComponent = () => {
//     const [isOpen, setIsOpen] = useState(false);
//
//     return (
//         <>
//             <button onClick={() => setIsOpen(true)}>Open Modal</button>
//             <Modal
//                 isOpen={isOpen}
//                 onClose={() => setIsOpen(false)}
//                 title="Example Modal"
//                 footer={
//                     <div className="flex justify-end space-x-4">
//                         <button onClick={() => setIsOpen(false)}>Cancel</button>
//                         <button onClick={() => {/* handle confirm */}}>Confirm</button>
//                     </div>
//                 }
//             >
//                 <p>Modal content goes here</p>
//             </Modal>
//         </>
//     );
// };

export default Modal;
