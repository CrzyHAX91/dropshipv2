import React, { useState } from 'react';

export const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button onClick={toggleDropdown} className="flex items-center">
          {children[0]} {/* DropdownMenuTrigger */}
        </button>
      </div>
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          {children[1]} {/* DropdownMenuContent */}
        </div>
      )}
    </div>
  );
};
