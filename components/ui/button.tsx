import React from 'react';

interface ButtonProps {
  variant?: 'ghost' | 'solid';
  size?: 'icon' | 'default';
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'solid', size = 'default', onClick, children }) => {
  const baseStyles = 'px-4 py-2 rounded focus:outline-none';
  const variantStyles = variant === 'ghost' ? 'bg-transparent text-gray-600' : 'bg-blue-500 text-white';
  const sizeStyles = size === 'icon' ? 'h-10 w-10' : 'h-12';

  return (
    <button className={`${baseStyles} ${variantStyles} ${sizeStyles}`} onClick={onClick}>
      {children}
    </button>
  );
};
