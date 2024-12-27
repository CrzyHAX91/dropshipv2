import React from 'react';

interface AvatarProps {
  src: string;
  alt: string;
  fallback: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, fallback }) => {
  return (
    <img
      src={src}
      alt={alt}
      onError={(e) => {
        e.currentTarget.src = fallback;
      }}
      className="h-8 w-8 rounded-full"
    />
  );
};
